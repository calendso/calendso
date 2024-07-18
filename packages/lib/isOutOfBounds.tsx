import type { EventType } from "@prisma/client";

import dayjs from "@calcom/dayjs";
import { PeriodType } from "@calcom/prisma/enums";

import { ROLLING_WINDOW_PERIOD_MAX_DAYS_TO_CHECK } from "./constants";
import logger from "./logger";
import { safeStringify } from "./safeStringify";

export class BookingDateInPastError extends Error {
  constructor(message = "Attempting to book a meeting in the past.") {
    super(message);
  }
}

function guardAgainstBookingInThePast(date: Date) {
  if (date >= new Date()) {
    // Date is in the future.
    return;
  }
  throw new BookingDateInPastError();
}

/**
 * Dates passed to this function are timezone neutral.
 */
export function calculatePeriodLimits({
  periodType,
  periodDays,
  periodCountCalendarDays,
  periodStartDate,
  periodEndDate,
  /**
   * These dates will be considered in the same utfcOffset as provided
   */
  allDatesWithBookabilityStatusInBookerTz,
  organizerUtcOffset,
  bookerUtcOffset,
  /**
   * This is temporary till we find a way to provide allDatesWithBookabilityStatus in handleNewBooking without re-computing availability.
   * It is okay for handleNewBooking to pass it as true as the frontend won't allow selecting a timeslot that is out of bounds of ROLLING_WINDOW
   * But for the booking that happen through API, we absolutely need to check the ROLLING_WINDOW limits.
   */
  _skipRollingWindowCheck,
}: Pick<
  EventType,
  "periodType" | "periodDays" | "periodCountCalendarDays" | "periodStartDate" | "periodEndDate"
> & {
  allDatesWithBookabilityStatusInBookerTz: Record<string, { isBookable: boolean }> | null;
  organizerUtcOffset: number;
  bookerUtcOffset: number;
  _skipRollingWindowCheck?: boolean;
}): PeriodLimits {
  const currentTime = dayjs();
  const currentTimeInOrganizerTz = currentTime.utcOffset(organizerUtcOffset);
  const currentTimeInBookerTz = currentTime.utcOffset(bookerUtcOffset);
  periodDays = periodDays || 0;
  const log = logger.getSubLogger({ prefix: ["calculatePeriodLimits"] });
  log.debug(
    safeStringify({
      periodType,
      periodDays,
      periodCountCalendarDays,
      periodStartDate: periodStartDate,
      periodEndDate: periodEndDate,
      currentTime: currentTimeInOrganizerTz.format(),
    })
  );

  switch (periodType) {
    case PeriodType.ROLLING: {
      // We use booker's timezone to calculate the end of the rolling period. This is because we want earliest possible timeslot to be available to be booked which could be on an earlier day as per booker's timezone.
      // Simply put, rolling is a relative period from the current time, so this is important.
      const rollingEndDay = periodCountCalendarDays
        ? currentTimeInBookerTz.add(periodDays, "days")
        : currentTimeInBookerTz.businessDaysAdd(periodDays);
      // The future limit talks in terms of days so we take the end of the day here to consider the entire day
      return {
        endOfRollingPeriodEndDayInBookerTz: rollingEndDay.endOf("day"),
        startOfRangeStartDayInOrganizerTz: null,
        endOfRangeEndDayInOrganizerTz: null,
      };
    }

    case PeriodType.ROLLING_WINDOW: {
      if (_skipRollingWindowCheck) {
        return {
          endOfRollingPeriodEndDayInBookerTz: null,
          startOfRangeStartDayInOrganizerTz: null,
          endOfRangeEndDayInOrganizerTz: null,
        };
      }

      if (!allDatesWithBookabilityStatusInBookerTz) {
        throw new Error("`allDatesWithBookabilityStatus` is required");
      }

      const endOfRollingPeriodEndDayInBookerTz = getRollingWindowEndDate({
        startDateInBookerTz: currentTimeInBookerTz,
        daysNeeded: periodDays,
        allDatesWithBookabilityStatusInBookerTz,
        countNonBusinessDays: periodCountCalendarDays,
      });

      return {
        endOfRollingPeriodEndDayInBookerTz,
        startOfRangeStartDayInOrganizerTz: null,
        endOfRangeEndDayInOrganizerTz: null,
      };
    }

    case PeriodType.RANGE: {
      // The future limit talks in terms of days so we take the start of the day for starting range and endOf the day for ending range
      // We use organizer's timezone to calculate the range. This is because in case of range the start and end date objects are determined by the organizer.
      // This is in contrast with ROLLING/ROLLING_WINDOW where number of days is available and not the specific date objects.
      const startOfRangeStartDayInOrganizerTz = dayjs(periodStartDate)
        .utcOffset(organizerUtcOffset)
        .startOf("day");
      const endOfRangeEndDayInOrganizerTz = dayjs(periodEndDate).utcOffset(organizerUtcOffset).endOf("day");

      return {
        endOfRollingPeriodEndDayInBookerTz: null,
        startOfRangeStartDayInOrganizerTz,
        endOfRangeEndDayInOrganizerTz,
      };
    }
  }

  return {
    endOfRollingPeriodEndDayInBookerTz: null,
    startOfRangeStartDayInOrganizerTz: null,
    endOfRangeEndDayInOrganizerTz: null,
  };
}

export function getRollingWindowEndDate({
  startDateInBookerTz,
  daysNeeded,
  allDatesWithBookabilityStatusInBookerTz,
  countNonBusinessDays,
}: {
  /**
   * It should be provided in the same utcOffset as the dates in `allDatesWithBookabilityStatus`
   * This is because we do a lookup by day in `allDatesWithBookabilityStatus`
   */
  startDateInBookerTz: dayjs.Dayjs;
  daysNeeded: number;
  allDatesWithBookabilityStatusInBookerTz: Record<string, { isBookable: boolean }>;
  countNonBusinessDays: boolean | null;
}) {
  const log = logger.getSubLogger({ prefix: ["getRollingWindowEndDate"] });
  log.debug("called:", safeStringify({ startDay: startDateInBookerTz.format(), daysNeeded }));
  let counter = 1;
  let rollingEndDay;
  const startOfStartDayInOrganizerTz = startDateInBookerTz.startOf("day");
  // It helps to break out of the loop if we don't find enough bookable days.
  const maxDaysToCheck = ROLLING_WINDOW_PERIOD_MAX_DAYS_TO_CHECK;

  let bookableDaysCount = 0;

  let startOfIterationDay = startOfStartDayInOrganizerTz;
  // Add periodDays to currentDate, skipping non-bookable days.
  while (bookableDaysCount < daysNeeded) {
    // What if we don't find any bookable days. We should break out of the loop after a certain number of days.
    if (counter > maxDaysToCheck) {
      break;
    }

    const onlyDateOfIterationDay = startOfIterationDay.format("YYYY-MM-DD");

    const isBookable = !!allDatesWithBookabilityStatusInBookerTz[onlyDateOfIterationDay]?.isBookable;

    if (isBookable) {
      bookableDaysCount++;
      rollingEndDay = startOfIterationDay;
    }

    log.silly(
      `Loop Iteration: ${counter}`,
      safeStringify({
        iterationDayBeginning: startOfIterationDay.format(),
        isBookable,
        bookableDaysCount,
        rollingEndDay: rollingEndDay?.format(),
        allDatesWithBookabilityStatusInBookerTz,
      })
    );

    startOfIterationDay = countNonBusinessDays
      ? startOfIterationDay.add(1, "days")
      : startOfIterationDay.businessDaysAdd(1);

    counter++;
  }

  /**
   * We can't just return null(if rollingEndDay couldn't be obtained) and allow days farther than ROLLING_WINDOW_PERIOD_MAX_DAYS_TO_CHECK to be booked as that would mean there is no future limit
   * The future limit talks in terms of days so we take the end of the day here to consider the entire day
   */
  const endOfLastDayOfWindowInOrganizerTz = (rollingEndDay ?? startOfIterationDay).endOf("day");
  log.debug("Returning rollingEndDay", endOfLastDayOfWindowInOrganizerTz.format());

  return endOfLastDayOfWindowInOrganizerTz;
}

/**
 * To be used when we work on Timeslots(and not Dates) to check boundaries
 * It ensures that the time isn't in the past and also checks if the time is within the minimum booking notice.
 */
export function isTimeOutOfBounds({
  time,
  minimumBookingNotice,
}: {
  time: dayjs.ConfigType;
  minimumBookingNotice?: number;
}) {
  const date = dayjs(time);

  guardAgainstBookingInThePast(date.toDate());

  if (minimumBookingNotice) {
    const minimumBookingStartDate = dayjs().add(minimumBookingNotice, "minutes");
    if (date.isBefore(minimumBookingStartDate)) {
      return true;
    }
  }

  return false;
}

type PeriodLimits = {
  endOfRollingPeriodEndDayInBookerTz: dayjs.Dayjs | null;
  startOfRangeStartDayInOrganizerTz: dayjs.Dayjs | null;
  endOfRangeEndDayInOrganizerTz: dayjs.Dayjs | null;
};

export function isTimeViolatingFutureLimit({
  time,
  periodLimits,
}: {
  time: dayjs.ConfigType;
  periodLimits: PeriodLimits;
}) {
  const log = logger.getSubLogger({ prefix: ["isTimeViolatingFutureLimit"] });
  // Because we are just going to compare times, we need not convert the time to a particular timezone
  // date.isAfter/isBefore are timezone neutral
  const dateInSystemTz = dayjs(time);
  if (periodLimits.endOfRollingPeriodEndDayInBookerTz) {
    const isAfterRollingEndDay = dateInSystemTz.isAfter(periodLimits.endOfRollingPeriodEndDayInBookerTz);
    log.debug("rollingEndDayCheck", {
      formattedDate: dateInSystemTz.format(),
      isAfterRollingEndDay,
      endOfRollingPeriodEndDayInBookerTz: periodLimits.endOfRollingPeriodEndDayInBookerTz.format(),
    });
    return isAfterRollingEndDay;
  }

  if (periodLimits.startOfRangeStartDayInOrganizerTz && periodLimits.endOfRangeEndDayInOrganizerTz) {
    const isBeforeRangeStart = dateInSystemTz.isBefore(periodLimits.startOfRangeStartDayInOrganizerTz);
    const isAfterRangeEnd = dateInSystemTz.isAfter(periodLimits.endOfRangeEndDayInOrganizerTz);
    log.debug("rangeCheck", {
      formattedDate: dateInSystemTz.format(),
      isAfterRangeEnd,
      isBeforeRangeStart,
      startOfRangeStartDayInOrganizerTz: periodLimits.startOfRangeStartDayInOrganizerTz.format(),
      endOfRangeEndDayInOrganizerTz: periodLimits.endOfRangeEndDayInOrganizerTz.format(),
    });
    return isBeforeRangeStart || isAfterRangeEnd;
  }
  return false;
}

export default function isOutOfBounds(
  time: dayjs.ConfigType,
  {
    periodType,
    periodDays,
    periodCountCalendarDays,
    periodStartDate,
    periodEndDate,
    organizerUtcOffset,
    bookerUtcOffset,
  }: Pick<
    EventType,
    "periodType" | "periodDays" | "periodCountCalendarDays" | "periodStartDate" | "periodEndDate"
  > & {
    organizerUtcOffset: number;
    bookerUtcOffset: number;
  },
  minimumBookingNotice?: number
) {
  return (
    isTimeOutOfBounds({ time, minimumBookingNotice }) ||
    isTimeViolatingFutureLimit({
      time,
      periodLimits: calculatePeriodLimits({
        periodType,
        periodDays,
        periodCountCalendarDays,
        periodStartDate,
        periodEndDate,
        // Temporary till we find a way to provide allDatesWithBookabilityStatus in handleNewBooking without re-computing availability for the booked timeslot
        allDatesWithBookabilityStatusInBookerTz: null,
        _skipRollingWindowCheck: true,
        organizerUtcOffset,
        bookerUtcOffset,
      }),
    })
  );
}

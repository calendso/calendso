import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@lib/prisma";
import {
  EventType,
  User,
  SchedulingType,
  Credential,
  SelectedCalendar,
  Booking,
  Prisma,
} from "@prisma/client";
import { CalendarEvent, getBusyCalendarTimes } from "@lib/calendarClient";
import { v5 as uuidv5 } from "uuid";
import short from "short-uuid";
import { getBusyVideoTimes } from "@lib/videoClient";
import EventAttendeeMail from "@lib/emails/EventAttendeeMail";
import { getEventName } from "@lib/event";
import dayjs from "dayjs";
import logger from "@lib/logger";
import EventManager, { CreateUpdateResult, EventResult } from "@lib/events/EventManager";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import dayjsBusinessDays from "dayjs-business-days";
import { Exception } from "handlebars";
import EventOrganizerRequestMail from "@lib/emails/EventOrganizerRequestMail";

dayjs.extend(dayjsBusinessDays);
dayjs.extend(utc);
dayjs.extend(isBetween);
dayjs.extend(timezone);

const translator = short();
const log = logger.getChildLogger({ prefix: ["[api] book:user"] });

function isAvailable(busyTimes, time, length) {
  // Check for conflicts
  let t = true;

  if (Array.isArray(busyTimes) && busyTimes.length > 0) {
    busyTimes.forEach((busyTime) => {
      const startTime = dayjs(busyTime.start);
      const endTime = dayjs(busyTime.end);

      // Check if time is between start and end times
      if (dayjs(time).isBetween(startTime, endTime, null, "[)")) {
        t = false;
      }

      // Check if slot end time is between start and end time
      if (dayjs(time).add(length, "minutes").isBetween(startTime, endTime)) {
        t = false;
      }

      // Check if startTime is between slot
      if (startTime.isBetween(dayjs(time), dayjs(time).add(length, "minutes"))) {
        t = false;
      }
    });
  }

  return t;
}

function isOutOfBounds(
  time: dayjs.ConfigType,
  { periodType, periodDays, periodCountCalendarDays, periodStartDate, periodEndDate, timeZone }
): boolean {
  const date = dayjs(time);

  switch (periodType) {
    case "rolling": {
      const periodRollingEndDay = periodCountCalendarDays
        ? dayjs().tz(timeZone).add(periodDays, "days").endOf("day")
        : dayjs().tz(timeZone).businessDaysAdd(periodDays, "days").endOf("day");
      return date.endOf("day").isAfter(periodRollingEndDay);
    }

    case "range": {
      const periodRangeStartDay = dayjs(periodStartDate).tz(timeZone).endOf("day");
      const periodRangeEndDay = dayjs(periodEndDate).tz(timeZone).endOf("day");
      return date.endOf("day").isBefore(periodRangeStartDay) || date.endOf("day").isAfter(periodRangeEndDay);
    }

    case "unlimited":
    default:
      return false;
  }
}

export async function handleLegacyConfirmationMail(
  results: Array<EventResult>,
  eventType: EventType,
  evt: CalendarEvent,
  hashUID: string
): Promise<{ error: Exception; message: string | null }> {
  if (results.length === 0 && !eventType.requiresConfirmation) {
    // Legacy as well, as soon as we have a separate email integration class. Just used
    // to send an email even if there is no integration at all.
    try {
      const mail = new EventAttendeeMail(evt, hashUID);
      await mail.sendEmail();
    } catch (e) {
      return { error: e, message: "Booking failed" };
    }
  }
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const eventTypeId = parseInt(req.body.eventTypeId as string);

  log.debug(`Booking eventType ${eventTypeId} started`);

  const isTimeInPast = (time) => {
    return dayjs(time).isBefore(new Date(), "day");
  };

  if (isTimeInPast(req.body.start)) {
    const error = {
      errorCode: "BookingDateInPast",
      message: "Attempting to create a meeting in the past.",
    };

    log.error(`Booking ${eventTypeId} failed`, error);
    return res.status(400).json(error);
  }

  const eventType: EventType = await prisma.eventType.findUnique({
    where: {
      id: eventTypeId,
    },
    select: {
      organizers: {
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          timeZone: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
        },
      },
      title: true,
      length: true,
      eventName: true,
      schedulingType: true,
      periodType: true,
      periodStartDate: true,
      periodEndDate: true,
      periodDays: true,
      periodCountCalendarDays: true,
      requiresConfirmation: true,
    },
  });

  let organizers: User[] = eventType.organizers;

  if (eventType.schedulingType === SchedulingType.ROUND_ROBIN) {
    const selectedOrganizers = req.body.organizers || [];
    // one of these things that can probably be done better
    // prisma is not well documented.
    organizers = await Promise.all(
      selectedOrganizers.map(async (username) => {
        const user = await prisma.user.findUnique({
          where: {
            username,
          },
          select: {
            bookings: {
              where: {
                startTime: {
                  gt: new Date(),
                },
              },
              select: {
                id: true,
              },
            },
          },
        });
        return {
          username,
          bookingCount: user.bookings.length,
        };
      })
    ).then((bookingCounts) => {
      const sorted = bookingCounts.sort((a, b) => (a.bookingCount > b.bookingCount ? 1 : -1));
      return [organizers.find((organizer) => organizer.username === sorted[0].username)];
    });
  }

  const invitee = [{ email: req.body.email, name: req.body.name, timeZone: req.body.timeZone }];
  const guests = req.body.guests.map((guest) => {
    const g = {
      email: guest,
      name: "",
      timeZone: req.body.timeZone,
    };
    return g;
  });
  const attendeesList = [...invitee, ...guests];

  let seed = `${eventTypeId}:${dayjs(req.body.start).utc().format()}`;
  if (eventType.schedulingType === SchedulingType.ROUND_ROBIN) {
    // round-robin explicitly means double-booking of this event type, so make the username part of the UID
    seed += ":" + organizers[0].username;
  }

  const uid = translator.fromUUID(uuidv5(seed, uuidv5.URL));

  const evt: CalendarEvent = {
    type: eventType.title,
    title: getEventName(req.body.name, eventType.title, eventType.eventName),
    description: req.body.notes,
    startTime: req.body.start,
    endTime: req.body.end,
    organizer:
      organizers.length > 1
        ? {
            name: eventType.team.name,
            attendees: organizers,
          }
        : {
            name: organizers[0].name,
            email: organizers[0].email,
            timeZone: organizers[0].timeZone,
          },
    attendees: attendeesList,
    location: req.body.location, // Will be processed by the EventManager later.
  };

  const bookingCreateInput: Prisma.BookingCreateInput = {
    uid: uid,
    title: evt.title,
    startTime: dayjs(evt.startTime).toDate(),
    endTime: dayjs(evt.endTime).toDate(),
    description: evt.description,
    confirmed: !eventType.requiresConfirmation,
    location: evt.location,
    eventType: {
      connect: {
        id: eventTypeId,
      },
    },
    attendees: {
      createMany: {
        data: evt.attendees,
      },
    },
    organizers: {
      connect: organizers.map((user: User) => ({ id: user.id })),
    },
  };

  if (eventType.team) {
    bookingCreateInput.team = {
      connect: {
        id: eventType.team.id,
      },
    };
  }

  let booking: Booking | null;
  try {
    booking = await prisma.booking.create({
      data: bookingCreateInput,
    });
  } catch (e) {
    log.error(`Booking ${eventTypeId} failed`, "Error when saving booking to db", e.message);
    if (e.code === "P2002") {
      return res.status(409).json({ message: "booking.conflict" });
    }
    return res.status(500).end();
  }

  const legacyMailError = await handleLegacyConfirmationMail([], eventType, evt, uid);
  if (legacyMailError) {
    log.error("Sending legacy event mail failed", legacyMailError.error);
    log.error(`Booking ${eventTypeId} failed`);
    res.status(500).json({ message: legacyMailError.message });
  }

  let results: EventResult[] = [];
  let referencesToCreate = [];

  for (const currentUser of await Promise.all(
    organizers.map((organizer) =>
      prisma.user.findUnique({
        where: {
          id: organizer.id,
        },
        select: {
          id: true,
          credentials: true,
          timeZone: true,
          email: true,
          username: true,
          name: true,
          bufferTime: true,
        },
      })
    )
  )) {
    // this sorts out organizer emails during collective events
    if (eventType.schedulingType === SchedulingType.COLLECTIVE) {
      evt.organizer = currentUser;
    }

    const selectedCalendars: SelectedCalendar[] = await prisma.selectedCalendar.findMany({
      where: {
        userId: currentUser.id,
      },
    });
    const credentials: Credential[] = currentUser.credentials;

    if (credentials) {
      const calendarBusyTimes = await getBusyCalendarTimes(
        credentials,
        req.body.start,
        req.body.end,
        selectedCalendars
      );

      const videoBusyTimes = await getBusyVideoTimes(credentials);
      calendarBusyTimes.push(...videoBusyTimes);

      const bufferedBusyTimes = calendarBusyTimes.map((a) => ({
        start: dayjs(a.start).subtract(currentUser.bufferTime, "minute").toString(),
        end: dayjs(a.end).add(currentUser.bufferTime, "minute").toString(),
      }));

      let isAvailableToBeBooked = true;
      try {
        isAvailableToBeBooked = isAvailable(bufferedBusyTimes, req.body.start, eventType.length);
      } catch {
        log.debug({
          message: "Unable set isAvailableToBeBooked. Using true. ",
        });
      }

      if (!isAvailableToBeBooked) {
        const error = {
          errorCode: "BookingUserUnAvailable",
          message: `${currentUser.name} is unavailable at this time.`,
        };

        log.debug(`Booking ${currentUser.name} failed`, error);
      }

      let timeOutOfBounds = false;

      try {
        timeOutOfBounds = isOutOfBounds(req.body.start, {
          periodType: eventType.periodType,
          periodDays: eventType.periodDays,
          periodEndDate: eventType.periodEndDate,
          periodStartDate: eventType.periodStartDate,
          periodCountCalendarDays: eventType.periodCountCalendarDays,
          timeZone: currentUser.timeZone,
        });
      } catch {
        log.debug({
          message: "Unable set timeOutOfBounds. Using false. ",
        });
      }

      if (timeOutOfBounds) {
        const error = {
          errorCode: "BookingUserUnAvailable",
          message: `${currentUser.name} is unavailable at this time.`,
        };

        log.debug(`Booking ${currentUser.name} failed`, error);
        res.status(400).json(error);
      }
    }

    // Initialize EventManager with credentials
    const eventManager = new EventManager(credentials);
    const rescheduleUid = req.body.rescheduleUid;
    if (rescheduleUid) {
      // Use EventManager to conditionally use all needed integrations.
      const updateResults: CreateUpdateResult = await eventManager.update(evt, rescheduleUid);

      if (results.length > 0 && results.every((res) => !res.success)) {
        const error = {
          errorCode: "BookingReschedulingMeetingFailed",
          message: "Booking Rescheduling failed",
        };

        log.error(`Booking ${currentUser.name} failed`, error, results);
      }

      results = updateResults.results;
      referencesToCreate = updateResults.referencesToCreate;
    } else if (!eventType.requiresConfirmation) {
      // Use EventManager to conditionally use all needed integrations.
      const createResults: CreateUpdateResult = await eventManager.create(evt);

      if (results.length > 0 && results.every((res) => !res.success)) {
        const error = {
          errorCode: "BookingCreatingMeetingFailed",
          message: "Booking failed",
        };

        log.error(`Booking ${currentUser.username} failed`, error, results);
      }

      results = createResults.results;
      referencesToCreate = createResults.referencesToCreate;
    }

    if (eventType.requiresConfirmation) {
      await new EventOrganizerRequestMail(evt, uid).sendEmail();
    }

    log.debug(`Booking ${currentUser.username} completed`);
  }

  await prisma.booking.update({
    where: {
      uid: booking.uid,
    },
    data: {
      references: {
        createMany: {
          data: referencesToCreate,
        },
      },
    },
  });

  // booking succesfull
  return res.status(201).json(booking);
}

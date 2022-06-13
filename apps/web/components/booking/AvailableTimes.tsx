import { ExclamationIcon } from "@heroicons/react/solid";
import { SchedulingType } from "@prisma/client";
import dayjs, { Dayjs } from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FC, useEffect, useState } from "react";

import { nameOfDay } from "@calcom/lib/weekday";

import classNames from "@lib/classNames";
import { timeZone } from "@lib/clock";
import { useLocale } from "@lib/hooks/useLocale";
import { useSlots } from "@lib/hooks/useSlots";

import Loader from "@components/Loader";

type AvailableTimesProps = {
  timeFormat: string;
  minimumBookingNotice: number;
  beforeBufferTime: number;
  afterBufferTime: number;
  eventTypeId: number;
  eventLength: number;
  recurringCount: number | undefined;
  eventTypeSlug: string;
  slotInterval: number | null;
  date: Dayjs;
  users: {
    username: string | null;
  }[];
  schedulingType: SchedulingType | null;
  seatsPerTimeSlot?: number | null;
  slots?: { time: string }[];
};

const AvailableTimes: FC<AvailableTimesProps> = ({
  slots = [],
  date,
  eventTypeId,
  eventTypeSlug,
  recurringCount,
  timeFormat,
  schedulingType,
  seatsPerTimeSlot,
}) => {
  const { t, i18n } = useLocale();
  const router = useRouter();
  const { rescheduleUid } = router.query;

  const [brand, setBrand] = useState("#292929");

  useEffect(() => {
    setBrand(getComputedStyle(document.documentElement).getPropertyValue("--brand-color").trim());
  }, []);

  return (
    <div className="mt-8 flex flex-col text-center sm:mt-0 sm:w-1/3 sm:pl-4 md:-mb-5">
      <div className="mb-4 text-left text-lg font-light text-gray-600">
        <span className="text-bookingdarker w-1/2 dark:text-white">
          <strong>{nameOfDay(i18n.language, Number(date.format("d")))}</strong>
          <span className="text-bookinglight">
            {date.format(", D ")}
            {date.toDate().toLocaleString(i18n.language, { month: "long" })}
          </span>
        </span>
      </div>
      <div className="flex-grow overflow-y-auto md:h-[364px]">
        {slots?.length > 0 &&
          slots.map((slot) => {
            type BookingURL = {
              pathname: string;
              query: Record<string, string | number | string[] | undefined>;
            };
            const bookingUrl: BookingURL = {
              pathname: "book",
              query: {
                ...router.query,
                date: dayjs(slot.time).format(),
                type: eventTypeId,
                slug: eventTypeSlug,
                /** Treat as recurring only when a count exist and it's not a rescheduling workflow */
                count: recurringCount && !rescheduleUid ? recurringCount : undefined,
              },
            };

            if (rescheduleUid) {
              bookingUrl.query.rescheduleUid = rescheduleUid as string;
            }

            if (schedulingType === SchedulingType.ROUND_ROBIN) {
              bookingUrl.query.user = slot.users;
            }

            // If event already has an attendee add booking id
            if (slot.bookingUid) {
              bookingUrl.query.bookingUid = slot.bookingUid;
            }

            return (
              <div key={dayjs(slot.time).format()}>
                {/* Current there is no way to disable Next.js Links */}
                {seatsPerTimeSlot && slot.attendees && slot.attendees >= seatsPerTimeSlot ? (
                  <div
                    className={classNames(
                      "text-primary-500 mb-2 block rounded-sm border bg-white py-4 font-medium opacity-25  dark:border-transparent dark:bg-gray-600 dark:text-neutral-200 ",
                      brand === "#fff" || brand === "#ffffff" ? "border-brandcontrast" : "border-brand"
                    )}>
                    {dayjs(slot.time).format(timeFormat)}
                    {!!seatsPerTimeSlot && <p className={`text-sm`}>{t("booking_full")}</p>}
                  </div>
                ) : (
                  <Link href={bookingUrl}>
                    <a
                      className={classNames(
                        "text-primary-500 hover:bg-brand hover:text-brandcontrast dark:hover:bg-darkmodebrand dark:hover:text-darkmodebrandcontrast mb-2 block rounded-sm border bg-white py-4 font-medium hover:text-white dark:border-transparent dark:bg-gray-600 dark:text-neutral-200 dark:hover:border-black",
                        brand === "#fff" || brand === "#ffffff" ? "border-brandcontrast" : "border-brand"
                      )}
                      data-testid="time">
                      {dayjs.tz(slot.time, timeZone()).format(timeFormat)}
                      {!!seatsPerTimeSlot && (
                        <p
                          className={`${
                            slot.attendees && slot.attendees / seatsPerTimeSlot >= 0.8
                              ? "text-rose-600"
                              : slot.attendees && slot.attendees / seatsPerTimeSlot >= 0.33
                              ? "text-yellow-500"
                              : "text-emerald-400"
                          } text-sm`}>
                          {slot.attendees ? seatsPerTimeSlot - slot.attendees : seatsPerTimeSlot} /{" "}
                          {!!seatsPerTimeSlot} {t("seats_available")}
                        </p>
                      )}
                    </a>
                  </Link>
                )}
              </div>
            );
          })}
        {!slots.length && (
          <div className="-mt-4 flex h-full w-full flex-col content-center items-center justify-center">
            <h1 className="my-6 text-xl text-black dark:text-white">{t("all_booked_today")}</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableTimes;

import { ClockIcon, CreditCardIcon, RefreshIcon, UserIcon, UsersIcon } from "@heroicons/react/solid";
import { SchedulingType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import React, { useMemo } from "react";
import { FormattedNumber, IntlProvider } from "react-intl";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { RecurringEvent } from "@calcom/types/Calendar";

import classNames from "@lib/classNames";

const eventTypeData = Prisma.validator<Prisma.EventTypeArgs>()({
  select: {
    id: true,
    length: true,
    price: true,
    currency: true,
    schedulingType: true,
    recurringEvent: true,
    description: true,
  },
});

type EventType = Prisma.EventTypeGetPayload<typeof eventTypeData>;

export type EventTypeDescriptionProps = {
  eventType: EventType;
  className?: string;
};

export const EventTypeDescription = ({ eventType, className }: EventTypeDescriptionProps) => {
  const { t } = useLocale();

  const recurringEvent: RecurringEvent = useMemo(
    () => (eventType.recurringEvent as RecurringEvent) || [],
    [eventType.recurringEvent]
  );

  return (
    <>
      <div
        className={classNames("flex flex-wrap text-neutral-500 dark:text-white sm:flex-nowrap", className)}>
        {eventType.description && (
          <h2 className="max-w-[280px] overflow-hidden text-ellipsis opacity-60 sm:max-w-[500px]">
            {eventType.description.substring(0, 100)}
            {eventType.description.length > 100 && "..."}
          </h2>
        )}
        <ul className="flex mt-2 flex-wrap sm:flex-nowrap">
          <li className="flex mr-4 items-center whitespace-nowrap">
            <ClockIcon className="mr-1.5 inline h-4 w-4 text-neutral-400" aria-hidden="true" />
            {eventType.length}m
          </li>
          {eventType.schedulingType ? (
            <li className="flex mr-4 items-center whitespace-nowrap">
              <UsersIcon className="mr-1.5 inline h-4 w-4 text-neutral-400" aria-hidden="true" />
              {eventType.schedulingType === SchedulingType.ROUND_ROBIN && t("round_robin")}
              {eventType.schedulingType === SchedulingType.COLLECTIVE && t("collective")}
            </li>
          ) : (
            <li className="flex mr-4 items-center whitespace-nowrap">
              <UserIcon className="mr-1.5 inline h-4 w-4 text-neutral-400" aria-hidden="true" />
              {t("1_on_1")}
            </li>
          )}
        </ul>
        <ul className="flex mt-2">
          {recurringEvent?.count && recurringEvent.count > 0 && (
            <li className="flex mr-4 items-center whitespace-nowrap">
              <RefreshIcon className="mr-1.5 inline h-4 w-4 text-neutral-400" aria-hidden="true" />
              {t("repeats_up_to", { count: recurringEvent.count })}
            </li>
          )}
          {eventType.price > 0 && (
            <li className="flex mr-4 items-center whitespace-nowrap">
              <CreditCardIcon className="mr-1.5 inline h-4 w-4 text-neutral-400" aria-hidden="true" />
              <IntlProvider locale="en">
                <FormattedNumber
                  value={eventType.price / 100.0}
                  style="currency"
                  currency={eventType.currency.toUpperCase()}
                />
              </IntlProvider>
            </li>
          )}
        </ul>
      </div>
    </>
  );
};

export default EventTypeDescription;

import type { Prisma } from "@prisma/client";
import { SchedulingType } from "@prisma/client";
import { useMemo } from "react";
import { FormattedNumber, IntlProvider } from "react-intl";
import type { z } from "zod";

import { classNames, parseRecurringEvent } from "@calcom/lib";
import getPaymentAppData from "@calcom/lib/getPaymentAppData";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { addListFormatting, md } from "@calcom/lib/markdownIt";
import type { baseEventTypeSelect } from "@calcom/prisma";
import type { EventTypeModel } from "@calcom/prisma/zod";
import { Badge } from "@calcom/ui";
import {
  FiClock,
  FiUsers,
  FiRefreshCw,
  FiCreditCard,
  FiClipboard,
  FiPlus,
  FiUser,
  FiLock,
} from "@calcom/ui/components/icon";

export type EventTypeDescriptionProps = {
  eventType: Pick<
    z.infer<typeof EventTypeModel>,
    Exclude<keyof typeof baseEventTypeSelect, "recurringEvent"> | "metadata"
  > & {
    recurringEvent: Prisma.JsonValue;
    seatsPerTimeSlot?: number;
  };
  className?: string;
  shortenDescription?: boolean;
  isPublic?: boolean;
};

export const EventTypeDescription = ({
  eventType,
  className,
  shortenDescription,
  isPublic,
}: EventTypeDescriptionProps) => {
  const { t } = useLocale();

  const recurringEvent = useMemo(
    () => parseRecurringEvent(eventType.recurringEvent),
    [eventType.recurringEvent]
  );

  const stripeAppData = getPaymentAppData(eventType);
  console.log({ isPublic });
  return (
    <>
      <div className={classNames("dark:text-darkgray-800 text-gray-500", className)}>
        {eventType.description && (
          <div
            className={classNames(
              "dark:text-darkgray-800 max-w-[280px] break-words py-1 text-sm text-gray-500 sm:max-w-[500px] [&_a]:text-blue-500 [&_a]:underline [&_a]:hover:text-blue-600",
              shortenDescription ? "line-clamp-4" : ""
            )}
            dangerouslySetInnerHTML={{
              __html: addListFormatting(md.render(eventType.description)),
            }}
          />
        )}
        <ul className="mt-2 flex flex-wrap space-x-2 rtl:space-x-reverse">
          {eventType.metadata?.managedEventConfig && !isPublic && (
            <Badge variant="blue" size="lg" StartIcon={FiLock}>
              {t("managed")}
            </Badge>
          )}
          {eventType.metadata?.multipleDuration ? (
            eventType.metadata.multipleDuration.map((dur, idx) => (
              <li key={idx}>
                <Badge variant="gray" size="lg" startIcon={FiClock}>
                  {dur}m
                </Badge>
              </li>
            ))
          ) : (
            <li>
              <Badge variant="gray" size="lg" startIcon={FiClock}>
                {eventType.length}m
              </Badge>
            </li>
          )}
          {eventType.schedulingType && eventType.schedulingType !== SchedulingType.MANAGED && (
            <li>
              <Badge variant="gray" size="lg" startIcon={FiUsers}>
                {eventType.schedulingType === SchedulingType.ROUND_ROBIN && t("round_robin")}
                {eventType.schedulingType === SchedulingType.COLLECTIVE && t("collective")}
              </Badge>
            </li>
          )}
          {recurringEvent?.count && recurringEvent.count > 0 && (
            <li className="hidden xl:block">
              <Badge variant="gray" size="lg" startIcon={FiRefreshCw}>
                {t("repeats_up_to", {
                  count: recurringEvent.count,
                })}
              </Badge>
            </li>
          )}
          {stripeAppData.price > 0 && (
            <li>
              <Badge variant="gray" size="lg" startIcon={FiCreditCard}>
                <IntlProvider locale="en">
                  <FormattedNumber
                    value={stripeAppData.price / 100.0}
                    style="currency"
                    currency={stripeAppData?.currency?.toUpperCase()}
                  />
                </IntlProvider>
              </Badge>
            </li>
          )}
          {eventType.requiresConfirmation && (
            <li className="hidden xl:block">
              <Badge variant="gray" size="lg" startIcon={FiClipboard}>
                {eventType.metadata?.requiresConfirmationThreshold
                  ? t("may_require_confirmation")
                  : t("requires_confirmation")}
              </Badge>
            </li>
          )}
          {/* TODO: Maybe add a tool tip to this? */}
          {eventType.requiresConfirmation || (recurringEvent?.count && recurringEvent.count) ? (
            <li className="block xl:hidden">
              <Badge variant="gray" size="lg" startIcon={FiPlus}>
                <p>{[eventType.requiresConfirmation, recurringEvent?.count].filter(Boolean).length}</p>
              </Badge>
            </li>
          ) : (
            <></>
          )}
          {eventType?.seatsPerTimeSlot ? (
            <li>
              <Badge variant="gray" size="lg" startIcon={FiUser}>
                <p>{t("event_type_seats", { numberOfSeats: eventType.seatsPerTimeSlot })} </p>
              </Badge>
            </li>
          ) : null}
        </ul>
      </div>
    </>
  );
};

export default EventTypeDescription;

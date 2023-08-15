import type { Prisma } from "@prisma/client";
import { useMemo, useState, useRef, useEffect } from "react";
import type { z } from "zod";

import { classNames, parseRecurringEvent } from "@calcom/lib";
import getPaymentAppData from "@calcom/lib/getPaymentAppData";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { baseEventTypeSelect } from "@calcom/prisma";
import { SchedulingType } from "@calcom/prisma/enums";
import type { EventTypeModel } from "@calcom/prisma/zod";
import { Badge } from "@calcom/ui";
import {
  Clock,
  Users,
  RefreshCw,
  CreditCard,
  Clipboard,
  Plus,
  User,
  Lock,
  ChevronsDown,
  ChevronsUp,
} from "@calcom/ui/components/icon";

export type EventTypeDescriptionProps = {
  eventType: Pick<
    z.infer<typeof EventTypeModel>,
    Exclude<keyof typeof baseEventTypeSelect, "recurringEvent"> | "metadata"
  > & {
    descriptionAsSafeHTML?: string | null;
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
  const { t, i18n } = useLocale();
  const [description, setDescription] = useState({
    isExpandable: false,
    shorten: shortenDescription || false,
  });
  const descriptionRef = useRef<HTMLDivElement>(null);

  const recurringEvent = useMemo(
    () => parseRecurringEvent(eventType.recurringEvent),
    [eventType.recurringEvent]
  );

  const paymentAppData = getPaymentAppData(eventType);

  useEffect(() => {
    if (descriptionRef.current && descriptionRef.current.clientHeight < descriptionRef.current.scrollHeight) {
      setDescription((prev) => ({ ...prev, isExpandable: true }));
    }
  }, []);

  return (
    <>
      <div className={classNames("text-subtle", className)}>
        {eventType.description && (
          <>
            <div
              className={classNames(
                "text-subtle max-w-[280px] break-words py-1 text-sm sm:max-w-[650px] [&_a]:text-blue-500 [&_a]:underline [&_a]:hover:text-blue-600",
                description.shorten ? "line-clamp-4" : ""
              )}
              dangerouslySetInnerHTML={{
                __html: eventType.descriptionAsSafeHTML || "",
              }}
              ref={descriptionRef}
            />
            {description.isExpandable ? (
              <div
                className="flex items-center text-sm font-semibold focus:outline-none"
                onClick={(e) => {
                  e.preventDefault();
                  setDescription((prev) => ({ ...prev, shorten: !prev.shorten }));
                }}>
                {description.shorten ? (
                  <>
                    Show More <ChevronsDown className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    Show Less <ChevronsUp className="h-5 w-5" />
                  </>
                )}
              </div>
            ) : null}
          </>
        )}

        <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1">
          {eventType.metadata?.multipleDuration ? (
            eventType.metadata.multipleDuration.map((dur, idx) => (
              <li key={idx}>
                <Badge variant="gray" startIcon={Clock}>
                  {dur}m
                </Badge>
              </li>
            ))
          ) : (
            <li>
              <Badge variant="gray" startIcon={Clock}>
                {eventType.length}m
              </Badge>
            </li>
          )}
          {eventType.schedulingType && eventType.schedulingType !== SchedulingType.MANAGED && (
            <li>
              <Badge variant="gray" startIcon={Users}>
                {eventType.schedulingType === SchedulingType.ROUND_ROBIN && t("round_robin")}
                {eventType.schedulingType === SchedulingType.COLLECTIVE && t("collective")}
              </Badge>
            </li>
          )}
          {eventType.metadata?.managedEventConfig && !isPublic && (
            <Badge variant="gray" startIcon={Lock}>
              {t("managed")}
            </Badge>
          )}
          {recurringEvent?.count && recurringEvent.count > 0 && (
            <li className="hidden xl:block">
              <Badge variant="gray" startIcon={RefreshCw}>
                {t("repeats_up_to", {
                  count: recurringEvent.count,
                })}
              </Badge>
            </li>
          )}
          {paymentAppData.enabled && (
            <li>
              <Badge variant="gray" startIcon={CreditCard}>
                {new Intl.NumberFormat(i18n.language, {
                  style: "currency",
                  currency: paymentAppData.currency,
                }).format(paymentAppData.price / 100)}
              </Badge>
            </li>
          )}
          {eventType.requiresConfirmation && (
            <li className="hidden xl:block">
              <Badge variant="gray" startIcon={Clipboard}>
                {eventType.metadata?.requiresConfirmationThreshold
                  ? t("may_require_confirmation")
                  : t("requires_confirmation")}
              </Badge>
            </li>
          )}
          {/* TODO: Maybe add a tool tip to this? */}
          {eventType.requiresConfirmation || (recurringEvent?.count && recurringEvent.count) ? (
            <li className="block xl:hidden">
              <Badge variant="gray" startIcon={Plus}>
                <p>{[eventType.requiresConfirmation, recurringEvent?.count].filter(Boolean).length}</p>
              </Badge>
            </li>
          ) : (
            <></>
          )}
          {eventType?.seatsPerTimeSlot ? (
            <li>
              <Badge variant="gray" startIcon={User}>
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

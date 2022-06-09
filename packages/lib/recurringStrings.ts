import { TFunction } from "next-i18next";
import { Frequency as RRuleFrequency } from "rrule";

import { RecurringEvent } from "@calcom/types/Calendar";

export const getRecurringFreq = ({
  t,
  recurringEvent,
}: {
  t: TFunction;
  recurringEvent: RecurringEvent;
}): string => {
  if (recurringEvent.interval && recurringEvent.freq) {
    return t("every_for_freq", {
      freq: `${recurringEvent.interval > 1 ? recurringEvent.interval : ""} ${t(
        RRuleFrequency[recurringEvent.freq].toString().toLowerCase(),
        {
          count: recurringEvent.interval,
        }
      )}`,
    });
  }
  return "";
};

export const getEveryFreqFor = ({
  t,
  recurringEvent,
  recurringCount,
  recurringFreq,
}: {
  t: TFunction;
  recurringEvent: RecurringEvent;
  recurringCount?: number;
  recurringFreq?: string;
}): string => {
  if (recurringEvent.freq) {
    return `${recurringFreq || getRecurringFreq({ t, recurringEvent })} ${
      recurringCount || recurringEvent.count
    } ${t("occurrences", {
      count: recurringCount || recurringEvent.count,
    })}`;
  }
  return "";
};

import { I18n } from "next-i18next";
import { RRule } from "rrule";

import dayjs, { Dayjs } from "@calcom/dayjs";
import { RecurringEvent } from "@calcom/types/Calendar";

import { detectBrowserTimeFormat } from "@lib/timeFormat";

import { parseZone } from "./parseZone";

const processDate = (date: string | null | Dayjs, i18n: I18n) => {
  const parsedZone = parseZone(date);
  if (!parsedZone?.isValid()) return "Invalid date";
  const formattedTime = parsedZone?.format(detectBrowserTimeFormat);
  return formattedTime + ", " + dayjs(date).toDate().toLocaleString(i18n.language, { dateStyle: "full" });
};

export const parseDate = (date: string | null | Dayjs, i18n: I18n) => {
  if (!date) return ["No date"];
  return processDate(date, i18n);
};

export const parseRecurringDates = (
  {
    startDate,
    recurringEvent,
    recurringCount,
  }: { startDate: string | null | Dayjs; recurringEvent: RecurringEvent | null; recurringCount: number },
  i18n: I18n
): [string[], Date[]] => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { count, ...restRecurringEvent } = recurringEvent || {};
  const rule = new RRule({
    ...restRecurringEvent,
    count: recurringCount,
    dtstart: dayjs(startDate).toDate(),
  });
  const dateStrings = rule.all().map((r) => {
    return processDate(dayjs(r), i18n);
  });
  return [dateStrings, rule.all()];
};

import { shallow } from "zustand/shallow";

import type { Dayjs } from "@calcom/dayjs";
import dayjs from "@calcom/dayjs";
import { default as DatePickerComponent } from "@calcom/features/calendars/DatePicker";
import { useNonEmptyScheduleDays } from "@calcom/features/schedules";
import { weekdayToWeekIndex } from "@calcom/lib/date-fns";
import { useLocale } from "@calcom/lib/hooks/useLocale";

import { useBookerStore } from "../store";
import type { useEventReturnType, useScheduleForEventReturnType } from "../utils/event";

export const DatePicker = ({
  event,
  schedule,
}: {
  event: useEventReturnType;
  schedule: useScheduleForEventReturnType;
}) => {
  const { i18n } = useLocale();
  const [month, selectedDate] = useBookerStore((state) => [state.month, state.selectedDate], shallow);
  const [setSelectedDate, setMonth] = useBookerStore(
    (state) => [state.setSelectedDate, state.setMonth],
    shallow
  );
  const numberOfDaysToLoadOverride = parseInt(
    process.env.NEXT_PUBLIC_BOOKER_NUMBER_OF_DAYS_TO_LOAD ?? "0",
    0
  );
  const nonEmptyScheduleDays = useNonEmptyScheduleDays(schedule?.data?.slots);

  return (
    <DatePickerComponent
      isPending={schedule.isPending}
      onChange={(date: Dayjs | null) => {
        setSelectedDate(date === null ? date : date.format("YYYY-MM-DD"));
      }}
      onMonthChange={(date: Dayjs) => {
        setMonth(date.format("YYYY-MM"));
        setSelectedDate(date.format("YYYY-MM-DD"));
      }}
      includedDates={numberOfDaysToLoadOverride > 0 ? null : nonEmptyScheduleDays}
      locale={i18n.language}
      browsingDate={month ? dayjs(month) : undefined}
      selected={dayjs(selectedDate)}
      weekStart={weekdayToWeekIndex(event?.data?.users?.[0]?.weekStart)}
    />
  );
};

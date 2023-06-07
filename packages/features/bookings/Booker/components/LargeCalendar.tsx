import { useMemo } from "react";

import dayjs from "@calcom/dayjs";
import { Calendar } from "@calcom/features/calendars/weeklyview";
import type { CalendarAvailableTimeslots } from "@calcom/features/calendars/weeklyview/types/state";

import { useBookerStore } from "../store";
import { useScheduleForEvent } from "../utils/event";

export const LargeCalendar = () => {
  const selectedDate = useBookerStore((state) => state.selectedDate);
  const date = selectedDate || dayjs().format("YYYY-MM-DD");
  const setSelectedTimeslot = useBookerStore((state) => state.setSelectedTimeslot);
  const extraDays = 5;
  const schedule = useScheduleForEvent({
    prefetchNextMonth: !!extraDays && dayjs(date).month() !== dayjs(date).add(extraDays, "day").month(),
  });

  const availableSlots = useMemo(() => {
    if (!schedule.data) return [];
    const availableTimeslots: CalendarAvailableTimeslots = {};
    if (!schedule.data.slots) return schedule;
    for (const day in schedule.data.slots) {
      availableTimeslots[day] = schedule.data.slots[day].map((slot) => ({
        start: dayjs(slot.time).toDate(),
        end: dayjs(slot.time).add(30, "minutes").toDate(),
      }));
    }

    return availableTimeslots;
  }, [schedule]);

  console.log(schedule);
  console.log("slottssss", availableSlots);
  return (
    <div className="h-full">
      <Calendar
        availableTimeslots={availableSlots}
        startHour={8}
        endHour={17}
        events={[]}
        startDate={selectedDate ? new Date(selectedDate) : new Date()}
        endDate={dayjs(selectedDate).add(extraDays, "day").toDate()}
        onEmptyCellClick={(date) => setSelectedTimeslot(date)}
        gridCellsPerHour={2}
        hoverEventDuration={30}
        hideHeader
      />
    </div>
  );
};

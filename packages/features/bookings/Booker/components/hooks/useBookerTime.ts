import { useBookerStore } from "@calcom/features/bookings/Booker/store";

import { useTimePreferences } from "../../../lib/timePreferences";
import { getBookerTimezone } from "../../utils/getBookerTimezone";

export const useBookerTime = () => {
  const [timezoneFromBookerStore] = useBookerStore((state) => [state.timezone]);
  const { timezone: timezoneFromTimePreferences, timeFormat } = useTimePreferences();
  const timezone = getBookerTimezone({
    storeTimezone: timezoneFromBookerStore,
    bookerUserPreferredTimezone: timezoneFromTimePreferences,
  });

  return {
    timezone,
    timeFormat,
  };
};

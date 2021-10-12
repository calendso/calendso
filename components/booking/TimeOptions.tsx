// TODO: replace headlessui with radix-ui
import { Switch } from "@headlessui/react";
import { FC, useEffect, useState } from "react";
import TimezoneSelect, { ITimezoneOption } from "react-timezone-select";

import classNames from "@lib/classNames";
import { useLocale } from "@lib/hooks/useLocale";

import { is24h, timeZone } from "../../lib/clock";

type Props = {
  onSelectTimeZone: (selectedTimeZone: string) => void;
  onToggle24hClock: (is24hClock: boolean) => void;
};

const TimeOptions: FC<Props> = (props) => {
  const [selectedTimeZone, setSelectedTimeZone] = useState("");
  const [is24hClock, setIs24hClock] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    setIs24hClock(is24h());
    setSelectedTimeZone(timeZone());
  }, []);

  useEffect(() => {
    if (selectedTimeZone && timeZone() && selectedTimeZone !== timeZone()) {
      props.onSelectTimeZone(timeZone(selectedTimeZone));
    }
  }, [selectedTimeZone]);

  const handle24hClockToggle = (is24hClock: boolean) => {
    setIs24hClock(is24hClock);
    props.onToggle24hClock(is24h(is24hClock));
  };

  return selectedTimeZone !== "" ? (
    <div className="absolute z-10 w-full max-w-80 rounded-sm border border-gray-200 dark:bg-gray-700 dark:border-0 bg-white px-4 py-2">
      <div className="flex mb-4">
        <div className="w-1/2 dark:text-white text-gray-600 font-medium">{t("time_options")}</div>
        <div className="w-1/2">
          <Switch.Group as="div" className="flex items-center justify-end">
            <Switch.Label as="span" className="mr-3">
              <span className="text-sm dark:text-white text-gray-500">{t("am_pm")}</span>
            </Switch.Label>
            <Switch
              checked={is24hClock}
              onChange={handle24hClockToggle}
              className={classNames(
                is24hClock ? "bg-black" : "dark:bg-gray-600 bg-gray-200",
                "relative inline-flex flex-shrink-0 h-5 w-8 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              )}>
              <span className="sr-only">{t("use_setting")}</span>
              <span
                aria-hidden="true"
                className={classNames(
                  is24hClock ? "translate-x-3" : "translate-x-0",
                  "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                )}
              />
            </Switch>
            <Switch.Label as="span" className="ml-3">
              <span className="text-sm dark:text-white text-gray-500">{t("24_h")}</span>
            </Switch.Label>
          </Switch.Group>
        </div>
      </div>
      <TimezoneSelect
        id="timeZone"
        value={selectedTimeZone}
        onChange={(tz: ITimezoneOption) => setSelectedTimeZone(tz.value)}
        className="mb-2 shadow-sm focus:ring-black focus:border-black mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
      />
    </div>
  ) : null;
};

export default TimeOptions;

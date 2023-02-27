import type { UseFieldArrayRemove } from "react-hook-form";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { TimeRange, WorkingHours } from "@calcom/types/schedule";
import { Button, DialogTrigger, Tooltip } from "@calcom/ui";
import { FiEdit2, FiTrash2 } from "@calcom/ui/components/icon";

import DateOverrideInputDialog from "./DateOverrideInputDialog";

const DateOverrideList = ({
  items,
  remove,
  update,
  workingHours,
  excludedDates = [],
}: {
  remove: UseFieldArrayRemove;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: any;
  items: { ranges: TimeRange[]; id: string }[];
  workingHours: WorkingHours[];
  excludedDates?: string[];
}) => {
  const { t, i18n } = useLocale();
  if (!items.length) {
    return <></>;
  }

  const timeSpan = ({ start, end }: TimeRange) => {
    return (
      new Intl.DateTimeFormat(i18n.language, { hour: "numeric", minute: "numeric", hour12: true }).format(
        start
      ) +
      " - " +
      new Intl.DateTimeFormat(i18n.language, { hour: "numeric", minute: "numeric", hour12: true }).format(end)
    );
  };

  return (
    <ul className="rounded border border-gray-200" data-testid="date-overrides-list">
      {items.map((item, index) => (
        <li key={item.id} className="flex justify-between border-b px-5 py-4 last:border-b-0">
          <div>
            <h3 className="text-sm text-gray-900">
              {new Intl.DateTimeFormat("en-GB", {
                weekday: "short",
                month: "long",
                day: "numeric",
              }).format(item.ranges[0].start)}
            </h3>
            {item.ranges[0].end.getHours() === 0 && item.ranges[0].end.getMinutes() === 0 ? (
              <p className="text-xs text-gray-500">{t("unavailable")}</p>
            ) : (
              item.ranges.map((range, i) => (
                <p key={i} className="text-xs text-gray-500">
                  {timeSpan(range)}
                </p>
              ))
            )}
          </div>
          <div className="flex flex-row-reverse gap-5 space-x-2 rtl:space-x-reverse">
            <DateOverrideInputDialog
              excludedDates={excludedDates}
              workingHours={workingHours}
              value={item.ranges}
              onChange={(ranges) => {
                update(index, {
                  ranges,
                });
              }}
              Trigger={
                <DialogTrigger asChild>
                  <Button
                    tooltip={t("edit")}
                    className="text-gray-700"
                    color="minimal"
                    variant="icon"
                    StartIcon={FiEdit2}
                  />
                </DialogTrigger>
              }
            />
            <Tooltip content="Delete">
              <Button
                className="text-gray-700"
                color="destructive"
                variant="icon"
                StartIcon={FiTrash2}
                onClick={() => remove(index)}
              />
            </Tooltip>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default DateOverrideList;

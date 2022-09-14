import classNames from "classnames";
import { useCallback, useEffect, useMemo, useState, Fragment } from "react";
import {
  Controller,
  useFieldArray,
  UseFieldArrayRemove,
  useFormContext,
  FieldValues,
  FieldPath,
  FieldPathValue,
  FieldArrayWithId,
  FieldArrayPath,
  Control,
  ControllerRenderProps,
} from "react-hook-form";
import { GroupBase, Props } from "react-select";

import dayjs, { ConfigType, Dayjs } from "@calcom/dayjs";
import { defaultDayRange as DEFAULT_DAY_RANGE } from "@calcom/lib/availability";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { weekdayNames } from "@calcom/lib/weekday";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { TimeRange } from "@calcom/types/schedule";
import { Icon } from "@calcom/ui";
import Dropdown, { DropdownMenuContent, DropdownMenuTrigger } from "@calcom/ui/Dropdown";
import { Select, Switch } from "@calcom/ui/v2";
import Button from "@calcom/ui/v2/core/Button";

export type FieldPathByValue<TFieldValues extends FieldValues, TValue> = {
  [Key in FieldPath<TFieldValues>]: FieldPathValue<TFieldValues, Key> extends TValue ? Key : never;
}[FieldPath<TFieldValues>];

const ScheduleDay = <TFieldValues extends FieldValues>({
  name,
  weekday,
  control,
  CopyButton,
}: {
  name: string;
  weekday: string;
  control: Control<TFieldValues>;
  CopyButton: JSX.Element;
}) => {
  const { watch, setValue } = useFormContext();
  const watchDayRange = watch(name);

  return (
    <div className="mb-1 flex w-full flex-col py-1 sm:flex-row">
      {/* Label & switch container */}
      <div className="flex h-11 items-center justify-between">
        <div>
          <label className="flex flex-row items-center space-x-2">
            <div>
              <Switch
                defaultChecked={watchDayRange.length > 0}
                checked={!!watchDayRange.length}
                onCheckedChange={(isChecked) => {
                  setValue(name, isChecked ? [DEFAULT_DAY_RANGE] : []);
                }}
              />
            </div>
            <span className="inline-block min-w-[88px] text-sm capitalize">{weekday}</span>
          </label>
        </div>
        <div className="inline sm:hidden">
          <div className="flex items-center">{CopyButton}</div>
        </div>
      </div>
      <div className="flex sm:ml-2">
        <DayRanges control={control} name={name} />
        {!!watchDayRange.length && <div className="mt-1">{CopyButton}</div>}
      </div>
      <div className="my-2 h-[1px] w-full bg-gray-200 sm:hidden" />
    </div>
  );
};

const CopyButton = ({
  getValuesFromDayRange,
  weekStart,
}: {
  getValuesFromDayRange: string;
  weekStart: number;
}) => {
  const { t } = useLocale();
  const fieldArrayName = getValuesFromDayRange.substring(0, getValuesFromDayRange.lastIndexOf("."));
  const { setValue, getValues } = useFormContext();
  return (
    <Dropdown>
      <DropdownMenuTrigger asChild>
        <Button type="button" tooltip={t("duplicate")} color="minimal" size="icon" StartIcon={Icon.FiCopy} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <CopyTimes
          weekStart={weekStart}
          disabled={parseInt(getValuesFromDayRange.replace(fieldArrayName + ".", ""), 10)}
          onClick={(selected) => {
            selected.forEach((day) => setValue(`${fieldArrayName}.${day}`, getValues(getValuesFromDayRange)));
          }}
        />
      </DropdownMenuContent>
    </Dropdown>
  );
};

const Schedule = <
  TFieldValues extends FieldValues,
  TPath extends FieldPathByValue<TFieldValues, TimeRange[][]>
>({
  name,
  control,
  weekStart = 0,
}: {
  name: TPath;
  control: Control<TFieldValues>;
  weekStart?: number;
}) => {
  const { i18n } = useLocale();

  return (
    <>
      {/* First iterate for each day */}
      {weekdayNames(i18n.language, weekStart, "long").map((weekday, num) => {
        const weekdayIndex = (num + weekStart) % 7;
        const dayRangeName = `${name}.${weekdayIndex}` as const;
        return (
          <ScheduleDay
            name={dayRangeName}
            key={weekday}
            weekday={weekday}
            control={control}
            CopyButton={<CopyButton weekStart={weekStart} getValuesFromDayRange={dayRangeName} />}
          />
        );
      })}
    </>
  );
};

const DayRanges = <
  TFieldValues extends FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>
>({
  name,
  control,
}: {
  name: TFieldArrayName;
  control: Control<TFieldValues>;
}) => {
  const { t } = useLocale();

  const { remove, fields, append } = useFieldArray({
    control,
    name,
  });

  return (
    <div>
      {fields.map((field, index: number) => (
        <Fragment key={field.id}>
          <div className="mb-2 flex first:mt-1">
            <Controller name={`${name}.${index}`} render={({ field }) => <TimeRangeField {...field} />} />
            {index === 0 && (
              <div className="hidden sm:inline">
                <Button
                  tooltip={t("add_time_availability")}
                  className=" text-neutral-400"
                  type="button"
                  color="minimal"
                  size="icon"
                  StartIcon={Icon.FiPlus}
                  onClick={() => {
                    const nextRange = getNextRange(fields[fields.length - 1]);
                    if (nextRange) append(nextRange);
                  }}
                />
              </div>
            )}
            {index !== 0 && <RemoveTimeButton index={index} remove={remove} />}
          </div>
        </Fragment>
      ))}
    </div>
  );
};

const RemoveTimeButton = ({
  index,
  remove,
  className,
}: {
  index: number | number[];
  remove: UseFieldArrayRemove;
  className?: string;
}) => {
  return (
    <Button
      type="button"
      size="icon"
      color="minimal"
      StartIcon={Icon.FiTrash}
      onClick={() => remove(index)}
      className={className}
    />
  );
};

const TimeRangeField = ({ className, value, onChange }: { className?: string } & ControllerRenderProps) => {
  // this is a controlled component anyway given it uses LazySelect, so keep it RHF agnostic.
  return (
    <div className={classNames("mx-1", className)}>
      <LazySelect
        className="inline-block h-9 w-[100px]"
        value={value.start}
        max={value.end}
        onChange={(option) => {
          onChange({ ...value, start: new Date(option?.value as number) });
        }}
      />
      <span className="mx-2 w-2 self-center"> - </span>
      <LazySelect
        className="inline-block w-[100px] rounded-md"
        value={value.end}
        min={value.start}
        onChange={(option) => {
          onChange({ ...value, end: new Date(option?.value as number) });
        }}
      />
    </div>
  );
};

const LazySelect = ({
  value,
  min,
  max,
  ...props
}: Omit<Props<IOption, false, GroupBase<IOption>>, "value"> & {
  value: ConfigType;
  min?: ConfigType;
  max?: ConfigType;
}) => {
  // Lazy-loaded options, otherwise adding a field has a noticeable redraw delay.
  const { options, filter } = useOptions();

  useEffect(() => {
    filter({ current: value });
  }, [filter, value]);

  return (
    <Select
      options={options}
      onMenuOpen={() => {
        if (min) filter({ offset: min });
        if (max) filter({ limit: max });
      }}
      value={options.find((option) => option.value === dayjs(value).toDate().valueOf())}
      onMenuClose={() => filter({ current: value })}
      components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null }}
      {...props}
    />
  );
};

interface IOption {
  readonly label: string;
  readonly value: number;
}

/**
 * Creates an array of times on a 15 minute interval from
 * 00:00:00 (Start of day) to
 * 23:45:00 (End of day with enough time for 15 min booking)
 */
/** Begin Time Increments For Select */
const INCREMENT = 15;
const useOptions = () => {
  // Get user so we can determine 12/24 hour format preferences
  const query = useMeQuery();
  const { timeFormat } = query.data || { timeFormat: null };

  const [filteredOptions, setFilteredOptions] = useState<IOption[]>([]);

  const options = useMemo(() => {
    const end = dayjs().utc().endOf("day");
    let t: Dayjs = dayjs().utc().startOf("day");

    const options: IOption[] = [];
    while (t.isBefore(end)) {
      options.push({
        value: t.toDate().valueOf(),
        label: dayjs(t)
          .utc()
          .format(timeFormat === 12 ? "h:mma" : "HH:mm"),
      });
      t = t.add(INCREMENT, "minutes");
    }
    return options;
  }, [timeFormat]);

  const filter = useCallback(
    ({ offset, limit, current }: { offset?: ConfigType; limit?: ConfigType; current?: ConfigType }) => {
      if (current) {
        const currentOption = options.find((option) => option.value === dayjs(current).toDate().valueOf());
        if (currentOption) setFilteredOptions([currentOption]);
      } else
        setFilteredOptions(
          options.filter((option) => {
            const time = dayjs(option.value);
            return (!limit || time.isBefore(limit)) && (!offset || time.isAfter(offset));
          })
        );
    },
    [options]
  );

  return { options: filteredOptions, filter };
};

const getNextRange = (field?: FieldArrayWithId) => {
  const nextRangeStart = dayjs((field as unknown as TimeRange).end);
  const nextRangeEnd = dayjs(nextRangeStart).add(1, "hour");

  if (nextRangeEnd.isBefore(nextRangeStart.endOf("day"))) {
    return {
      start: nextRangeStart.toDate(),
      end: nextRangeEnd.toDate(),
    };
  }
};

const CopyTimes = ({
  disabled,
  onClick,
  weekStart,
}: {
  disabled: number;
  onClick: (selected: number[]) => void;
  weekStart: number;
}) => {
  const [selected, setSelected] = useState<number[]>([]);
  const { i18n, t } = useLocale();

  return (
    <div className="m-4 space-y-2 py-4">
      <p className="h6 text-xs font-medium uppercase text-neutral-400">Copy times to</p>
      <ol className="space-y-2">
        {weekdayNames(i18n.language, weekStart).map((weekday, num) => (
          <li key={weekday}>
            <label className="flex w-full items-center justify-between">
              <span className="px-1">{weekday}</span>
              <input
                value={num}
                defaultChecked={disabled === num}
                disabled={disabled === num}
                onChange={(e) => {
                  if (e.target.checked && !selected.includes(num)) {
                    setSelected(selected.concat([num]));
                  } else if (!e.target.checked && selected.includes(num)) {
                    setSelected(selected.slice(selected.indexOf(num), 1));
                  }
                }}
                type="checkbox"
                className="inline-block rounded-[4px] border-gray-300 text-neutral-900 focus:ring-neutral-500 disabled:text-neutral-400"
              />
            </label>
          </li>
        ))}
      </ol>
      <div className="pt-2">
        <Button className="w-full justify-center" color="primary" onClick={() => onClick(selected)}>
          {t("apply")}
        </Button>
      </div>
    </div>
  );
};

export default Schedule;

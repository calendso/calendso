import React, { Dispatch, SetStateAction } from "react";
import { components, GroupBase, OptionProps } from "react-select";
import { Props } from "react-select";

import Select from "@calcom/ui/form/Select";

import { useLocale } from "@lib/hooks/useLocale";

export type Option = {
  value: string;
  label: string;
};

const InputOption = ({
  isDisabled,
  isFocused,
  isSelected,
  children,
  innerProps,
  ...rest
}: OptionProps<any, boolean, GroupBase<any>>) => {
  const style = {
    alignItems: "center",
    backgroundColor: isFocused ? "rgba(244, 245, 246, var(--tw-bg-opacity))" : "transparent",
    color: "inherit",
    display: "flex ",
  };

  const props = {
    ...innerProps,
    style,
  };

  return (
    <components.Option
      {...rest}
      isDisabled={isDisabled}
      isFocused={isFocused}
      isSelected={isSelected}
      innerProps={props}>
      <input
        type="checkbox"
        className="text-primary-600 focus:ring-primary-500 mr-2 h-4 w-4 rounded border-gray-300"
        checked={isSelected}
        readOnly
      />
      {children}
    </components.Option>
  );
};

type MultiSelectionCheckboxesProps = {
  options: { label: string; value: string }[];
  setSelected: Dispatch<SetStateAction<Option[]>>;
  selected: Option[];
  setValue: (s: Option[]) => unknown;
};

const MultiValue = ({ index, getValue }: { index: number; getValue: any }) => {
  const { t } = useLocale();

  return <>{!index && <div>{t("nr_event_type", { count: getValue().length })}</div>}</>;
};

export default function MultiSelectCheckboxes({
  options,
  isLoading,
  selected,
  setSelected,
  setValue,
}: Omit<Props, "options"> & MultiSelectionCheckboxesProps) {
  const additonalComponents = { MultiValue };

  return (
    <Select
      value={selected}
      onChange={(s: any) => {
        setSelected(s);
        setValue(s);
      }}
      options={options}
      isMulti
      className="w-64 text-sm"
      isSearchable={false}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      isLoading={isLoading}
      components={{
        ...additonalComponents,
        Option: InputOption,
      }}
    />
  );
}

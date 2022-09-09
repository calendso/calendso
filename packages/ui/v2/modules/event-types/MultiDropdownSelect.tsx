import autoAnimate from "@formkit/auto-animate";
import React, { useEffect, useRef } from "react";
import { components, GroupBase, Props, ValueContainerProps } from "react-select";

import { Icon } from "@calcom/ui/Icon";

// import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Select } from "../..";

const LimitedChipsContainer = <Option, IsMulti extends boolean, Group extends GroupBase<Option>>({
  children,
  ...props
}: ValueContainerProps<Option, IsMulti, Group>) => {
  if (!props.hasValue) {
    return <components.ValueContainer {...props}>{children as React.ReactNode[]}</components.ValueContainer>;
  }
  const CHIPS_LIMIT = 2;
  // @ts-expect-error: @see children is an array but identified as object resulting in the error
  const [chips, other] = children;
  const overflowCounter = chips.slice(CHIPS_LIMIT).length;
  const displayChips = chips.slice(overflowCounter, overflowCounter + CHIPS_LIMIT);
  return (
    <components.ValueContainer {...props}>
      {displayChips}
      <span className="flex items-center justify-center rounded-md bg-gray-100 py-[5px] px-2 text-[14px] font-medium leading-4 text-gray-700">
        {overflowCounter > 0 && (
          <>
            <Icon.FiPlus className="mr-1 inline h-3 w-3 stroke-[3px]" /> {overflowCounter} more
          </>
        )}
      </span>
      {other}
    </components.ValueContainer>
  );
};

export const MultiDropdownSelect = ({ options = [], value = [], ...props }: Props) => {
  // const { t } = useLocale();
  const animationRef = useRef(null);

  useEffect(() => {
    animationRef.current && autoAnimate(animationRef.current);
  }, [animationRef]);

  return (
    <Select
      styles={{
        multiValue: (styles) => {
          return {
            ...styles,
            backgroundColor: "#F3F4F6",
            color: "#374151",
            borderRadius: "6px",
            padding: "5px 8px",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "500",
            margin: "0px",
            lineHeight: "16px",
          };
        },
        multiValueLabel: (styles) => ({
          ...styles,
          paddingLeft: "0px",
          fontSize: "14px",
          padding: "0",
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "#4B5563",
          padding: "0",
          ":hover": {
            background: "transparent",
          },
        }),
        control: (base) => ({
          ...base,
          // Brute force to remove focus outline of input
          "& .cal-multiselect__input": {
            borderWidth: 0,
            boxShadow: "none",
            caretColor: "transparent",
          },
        }),
        valueContainer: (base) => ({
          ...base,
          display: "flex",
          gap: "4px",
          paddingLeft: "5px",
          padding: "0px",
          height: "36px",
        }),
      }}
      className="cal-multiselect"
      classNamePrefix="cal-multiselect"
      placeholder="Select"
      defaultValue={value}
      options={options}
      hideSelectedOptions={false}
      isMulti
      components={{ ValueContainer: LimitedChipsContainer }}
      {...props}
    />
  );
};

export default MultiDropdownSelect;

import { useMemo } from "react";
import BaseSelect, {
  allTimezones,
  ITimezoneOption,
  ITimezone,
  Props as SelectProps,
} from "react-timezone-select";

import { getReactSelectProps } from "@calcom/ui/v2/core/form/Select";

function TimezoneSelect({ className, ...props }: SelectProps) {
  const reactSelectProps = useMemo(() => {
    return getReactSelectProps({ className });
  }, [className]);

  return (
    <BaseSelect
      {...reactSelectProps}
      timezones={{
        ...allTimezones,
        "America/Asuncion": "Asuncion",
      }}
      {...props}
    />
  );
}

export default TimezoneSelect;
export type { ITimezone, ITimezoneOption };

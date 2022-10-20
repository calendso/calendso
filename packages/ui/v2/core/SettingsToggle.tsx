import { useAutoAnimate } from "@formkit/auto-animate/react";
import React, { ReactNode } from "react";

import Switch from "./Switch";
import { Label } from "./form";

type Props = {
  children?: ReactNode;
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

function SettingsToggle({ checked, onCheckedChange, description, title, children }: Props) {
  const [animateRef] = useAutoAnimate<HTMLDivElement>();

  return (
    <>
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
        <fieldset className="block flex-col sm:flex">
          <div className="flex space-x-3">
            <Switch fitToHeight={true} checked={checked} onCheckedChange={onCheckedChange} />

            <div className="">
              <Label className="text-sm font-semibold leading-none text-black">{title}</Label>
              {description && <p className="-mt-2 text-sm leading-normal text-gray-600">{description}</p>}
            </div>
          </div>
          {children && (
            <div className="mt-4 lg:ml-14" ref={animateRef}>
              {checked && children}
            </div>
          )}
        </fieldset>
      </div>
    </>
  );
}

export default SettingsToggle;

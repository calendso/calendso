import React from "react";

import { Label } from "../../inputs/Label";
import Item from "./Item";
import { Option } from "./type";

interface GroupItemProps {
  item: Option & { options: Option[] }; // We know options exist here
  index?: number;
  hocused: boolean;
}

function GroupItem({ item, index: tabIndex, hocused }: GroupItemProps) {
  return (
    <>
      {item.options.length > 0 && (
        <>
          <Label>{item.label}</Label>

          {item.options.map((item, index) => (
            <Item key={index} item={item} index={tabIndex} hocused={hocused} />
          ))}
        </>
      )}
    </>
  );
}

export default GroupItem;

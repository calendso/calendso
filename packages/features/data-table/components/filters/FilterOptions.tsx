import type { FilterableColumn } from "../../lib/types";
import { MultiSelectFilterOptions } from "./MultiSelectFilterOptions";
import { TextFilterOptions } from "./TextFilterOptions";

export type FilterOptionsProps = {
  column: FilterableColumn;
};

export function FilterOptions({ column }: FilterOptionsProps) {
  if (column.type === "text") {
    return <TextFilterOptions column={column} />;
  } else if (column.type === "select") {
    return <MultiSelectFilterOptions column={column} />;
  } else {
    return null;
  }
}

import type { TextFilterValue } from "./types";

export const textFilter = (cellValue: string, filterValue: TextFilterValue) => {
  switch (filterValue.data.operator) {
    case "equals":
      return cellValue.toLowerCase() === (filterValue.data.value || "").toLowerCase();
    case "notEquals":
      return cellValue.toLowerCase() !== (filterValue.data.value || "").toLowerCase();
    case "contains":
      return cellValue.toLowerCase().includes((filterValue.data.value || "").toLowerCase());
    case "notContains":
      return !cellValue.toLowerCase().includes((filterValue.data.value || "").toLowerCase());
    case "startsWith":
      return cellValue.toLowerCase().startsWith((filterValue.data.value || "").toLowerCase());
    case "endsWith":
      return cellValue.toLowerCase().endsWith((filterValue.data.value || "").toLowerCase());
    case "isEmpty":
      return cellValue.trim() === "";
    case "isNotEmpty":
      return cellValue.trim() !== "";
    default:
      return false;
  }
};

export const isTextFilterValue = (filterValue: unknown): filterValue is TextFilterValue => {
  return (
    typeof filterValue === "object" &&
    filterValue !== null &&
    "type" in filterValue &&
    filterValue.type === "text"
  );
};

export const isSelectFilterValue = (filterValue: unknown): filterValue is SelectFilterValue => {
  return Array.isArray(filterValue) && filterValue.every((item) => typeof item === "string");
};

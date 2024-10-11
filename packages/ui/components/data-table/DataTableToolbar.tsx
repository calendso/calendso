"use client";

import type { Table } from "@tanstack/react-table";
import { useEffect, useState, forwardRef } from "react";

import { useDebounce } from "@calcom/lib/hooks/useDebounce";
import { useLocale } from "@calcom/lib/hooks/useLocale";

import type { ButtonProps } from "../button";
import { Button } from "../button";
import { Input } from "../form";

interface DataTableToolbarProps {
  children: React.ReactNode;
}

const Root = forwardRef<HTMLDivElement, DataTableToolbarProps>(function DataTableToolbar({ children }, ref) {
  return (
    <div ref={ref} className="grid w-full items-center gap-2 py-4" style={{ gridArea: "header" }}>
      {children}
    </div>
  );
});

interface SearchBarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  onSearch?: (value: string) => void;
}

function SearchBarComponent<TData>(
  { table, searchKey, onSearch }: SearchBarProps<TData>,
  ref: React.Ref<HTMLInputElement>
) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    onSearch?.(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  if (onSearch) {
    return (
      <Input
        ref={ref}
        className="max-w-64 mb-0 mr-auto rounded-md"
        placeholder="Search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value.trim())}
      />
    );
  }

  if (!searchKey) {
    console.error("searchKey is required if onSearch is not provided");
    return null;
  }

  return (
    <Input
      ref={ref}
      className="max-w-64 mb-0 mr-auto rounded-md"
      placeholder="Search"
      value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
      onChange={(event) => {
        return table.getColumn(searchKey)?.setFilterValue(event.target.value.trim());
      }}
    />
  );
}

const SearchBar = forwardRef(SearchBarComponent) as <TData>(
  props: SearchBarProps<TData> & { ref?: React.Ref<HTMLInputElement> }
) => ReturnType<typeof SearchBarComponent>;

interface ClearFiltersButtonProps<TData> {
  table: Table<TData>;
}

function ClearFiltersButtonComponent<TData>(
  { table }: ClearFiltersButtonProps<TData>,
  ref: React.Ref<HTMLButtonElement>
) {
  const { t } = useLocale();
  const isFiltered = table.getState().columnFilters.length > 0;
  if (!isFiltered) return null;
  return (
    <Button
      ref={ref}
      color="minimal"
      EndIcon="x"
      onClick={() => table.resetColumnFilters()}
      className="h-8 px-2 lg:px-3">
      {t("clear")}
    </Button>
  );
}

const ClearFiltersButton = forwardRef(ClearFiltersButtonComponent) as <TData>(
  props: ClearFiltersButtonProps<TData> & { ref?: React.Ref<HTMLButtonElement> }
) => ReturnType<typeof ClearFiltersButtonComponent>;

function CTAComponent(
  { children, onClick, color = "primary", ...rest }: ButtonProps,
  ref: React.Ref<HTMLButtonElement>
) {
  return (
    <Button ref={ref} color={color} onClick={onClick} {...rest}>
      {children}
    </Button>
  );
}

const CTA = forwardRef(CTAComponent) as (
  props: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }
) => ReturnType<typeof CTAComponent>;

export const DataTableToolbar = { Root, SearchBar, ClearFiltersButton, CTA };

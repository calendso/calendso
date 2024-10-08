import type { Table } from "@tanstack/react-table";
import { parseAsString, useQueryState, parseAsArrayOf } from "nuqs";
import { useState } from "react";

import classNames from "@calcom/lib/classNames";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc";
import {
  Alert,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Icon,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@calcom/ui";

import type { User } from "../UserListTable";

interface Props {
  table: Table<User>;
}

function useSelectedAttributes() {
  const [selectedAttribute, setSelectedAttribute] = useQueryState("a", parseAsString);
  const utils = trpc.useUtils();
  const attributeData = utils.viewer.attributes.list.getData();
  const foundAttribute = attributeData?.find((attr) => attr.id === selectedAttribute);

  return {
    selectedAttribute,
    setSelectedAttribute,
    foundAttributeInCache: foundAttribute,
  };
}

function useSelectedAttributeOption() {
  return useQueryState("ao", parseAsArrayOf(parseAsString).withDefault([]));
}

function SelectedAttributeToAssign() {
  const { t } = useLocale();
  const [selectedAttributeOption, setSelectedAttributeOption] = useSelectedAttributeOption();
  const { selectedAttribute, setSelectedAttribute } = useSelectedAttributes();
  const utils = trpc.useUtils();
  const attributeData = utils.viewer.attributes.list.getData();
  const foundAttribute = attributeData?.find((attr) => attr.id === selectedAttribute);

  if (!foundAttribute) {
    setSelectedAttribute(null);
    return null;
  }

  function getTranslateableStringFromType(type: string) {
    switch (type) {
      case "SINGLE_SELECT":
        return "single_select";
      case "MULTI_SELECT":
        return "multi_select";
      case "TEXT":
        return "text";
      case "NUMBER":
        return "number";
      default:
        return undefined;
    }
  }
  const translateableType = getTranslateableStringFromType(foundAttribute.type);

  const isSelectable = foundAttribute.type === "SINGLE_SELECT" || foundAttribute.type === "MULTI_SELECT";

  return (
    <CommandList>
      <div className="flex flex items-center items-center gap-2 border-b px-3 py-2">
        <span className="block">{foundAttribute.name}</span>
        {translateableType && <span className="text-muted block text-xs">({t(translateableType)})</span>}
      </div>
      <CommandGroup>
        {isSelectable ? (
          <>
            {foundAttribute.options.map((option) => {
              return (
                <CommandItem
                  key={option.id}
                  className="hover:cursor-pointer"
                  onSelect={() => {
                    if (foundAttribute.type === "SINGLE_SELECT") {
                      setSelectedAttributeOption([option.id]);
                    } else {
                      setSelectedAttributeOption((prev) => {
                        if (prev.includes(option.id)) {
                          return prev.filter((id) => id !== option.id);
                        }
                        return [...prev, option.id];
                      });
                    }
                  }}>
                  <span>{option.value}</span>
                  <div
                    className={classNames(
                      "ml-auto flex h-4 w-4 items-center justify-center rounded-sm border"
                    )}>
                    {selectedAttributeOption?.includes(option.id) ? (
                      <Icon name="check" className={classNames("h-4 w-4")} />
                    ) : null}
                  </div>
                </CommandItem>
              );
            })}
          </>
        ) : (
          <>
            <CommandItem>
              <Input
                value={selectedAttributeOption[0]}
                type={foundAttribute.type === "TEXT" ? "text" : "number"}
                onChange={(e) => {
                  setSelectedAttributeOption([e.target.value]);
                }}
              />
            </CommandItem>
          </>
        )}
      </CommandGroup>
    </CommandList>
  );
}

export function MassAssignAttributesBulkAction({ table }: Props) {
  const { selectedAttribute, setSelectedAttribute, foundAttributeInCache } = useSelectedAttributes();
  const [_, setSelectedAttributeOption] = useSelectedAttributeOption();
  const [showMultiSelectWarning, setShowMultiSelectWarning] = useState(false);
  const { t } = useLocale();
  const { data, isLoading } = trpc.viewer.attributes.list.useQuery();

  function Content() {
    if (!selectedAttribute) {
      return (
        <>
          <CommandInput placeholder={t("search")} />
          <CommandList>
            <CommandEmpty>No attributes found</CommandEmpty>
            <CommandGroup>
              {data &&
                data.map((option) => {
                  return (
                    <CommandItem
                      key={option.id}
                      className="hover:cursor-pointer"
                      onSelect={() => {
                        setSelectedAttribute(option.id);
                      }}>
                      <span>{option.name}</span>
                      <div
                        className={classNames("ml-auto flex h-4 w-4 items-center justify-center rounded-sm")}>
                        <Icon name="chevron-right" className={classNames("h-4 w-4")} />
                      </div>
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </>
      );
    }

    if (showMultiSelectWarning) {
      return (
        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden px-3 py-2">
          <Alert
            severity="warning"
            message="You are mass assigning to a multi select. This will assign the attribute to all selected users and
            will not override existing values."
          />
        </div>
      );
    }

    if (selectedAttribute) {
      return <SelectedAttributeToAssign />;
    }

    return null;
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button StartIcon="users">{t("mass_assign_attributes")}</Button>
        </PopoverTrigger>
        {/* We dont really use shadows much - but its needed here  */}
        <PopoverContent className="p-0 shadow-md" align="start" sideOffset={12}>
          <Command>
            <Content />
          </Command>
          <div className="my-1.5 flex w-full justify-end gap-2 p-1.5">
            {selectedAttribute ? (
              <>
                <Button
                  color="secondary"
                  className="rounded-md"
                  size="sm"
                  onClick={() => {
                    setSelectedAttribute(null);
                    setSelectedAttributeOption([]);
                    setShowMultiSelectWarning(false);
                  }}>
                  {t("clear")}
                </Button>
                <Button
                  className="rounded-md"
                  size="sm"
                  onClick={() => {
                    if (
                      foundAttributeInCache &&
                      foundAttributeInCache.type === "MULTI_SELECT" &&
                      !showMultiSelectWarning
                    ) {
                      setShowMultiSelectWarning(true);
                    } else {
                      setShowMultiSelectWarning(false);
                    }
                  }}>
                  {t("apply")}
                </Button>
              </>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}

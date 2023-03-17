import { SchedulingType } from "@prisma/client";
import type { EventTypeSetupProps, EventTypeSetup, FormValues } from "pages/event-types/[type]";
import { useEffect, useRef } from "react";
import type { ComponentProps } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import type { Options } from "react-select";

import type { CheckedSelectOption } from "@calcom/features/eventtypes/components/CheckedTeamSelect";
import CheckedTeamSelect from "@calcom/features/eventtypes/components/CheckedTeamSelect";
import type { ChildrenEventType } from "@calcom/features/eventtypes/components/ChildrenEventTypeSelect";
import ChildrenEventTypeSelect from "@calcom/features/eventtypes/components/ChildrenEventTypeSelect";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Label, Select } from "@calcom/ui";

interface IUserToValue {
  id: number | null;
  name: string | null;
  username: string | null;
  email: string;
}

const mapUserToValue = ({ id, name, username, email }: IUserToValue) => ({
  value: `${id || ""}`,
  label: `${name || ""}`,
  avatar: `${WEBAPP_URL}/${username}/avatar.png`,
  email,
});

const mapMemberToChildrenOption = (
  member: EventTypeSetupProps["teamMembers"][number],
  slug: string,
  children: EventTypeSetup["children"]
) => {
  const existentChildren = children.find((ch) => ch.owner?.id === member.id);
  return {
    slug,
    hidden: existentChildren?.hidden ?? false,
    created: !!existentChildren,
    owner: {
      id: member.id,
      name: member.name ?? "",
      username: member.username ?? "",
      membership: member.membership,
      eventTypeSlugs: member.eventTypes ?? [],
    },
    value: `${member.id ?? ""}`,
    label: member.name ?? "",
  };
};

const sortByLabel = (a: ReturnType<typeof mapUserToValue>, b: ReturnType<typeof mapUserToValue>) => {
  if (a.label < b.label) {
    return -1;
  }
  if (a.label > b.label) {
    return 1;
  }
  return 0;
};

const ChildrenEventTypesList = ({
  options = [],
  value,
  onChange,
  ...rest
}: {
  value: ReturnType<typeof mapMemberToChildrenOption>[];
  onChange?: (options: ReturnType<typeof mapMemberToChildrenOption>[]) => void;
  options?: Options<ReturnType<typeof mapMemberToChildrenOption>>;
} & Omit<Partial<ComponentProps<typeof ChildrenEventTypeSelect>>, "onChange" | "value">) => {
  const { t } = useLocale();
  return (
    <div className="flex flex-col space-y-5">
      <div>
        <Label>{t("assign_to")}</Label>
        <ChildrenEventTypeSelect
          isOptionDisabled={(option) =>
            value && !!value.find((children) => children.owner.id.toString() === option.value)
          }
          onChange={(options) => {
            onChange &&
              onChange(
                options.map((option) => ({
                  ...option,
                }))
              );
          }}
          value={value}
          options={options}
          controlShouldRenderValue={false}
          {...rest}
        />
      </div>
    </div>
  );
};

const CheckedHostField = ({
  labelText,
  placeholder,
  options = [],
  isFixed,
  value,
  onChange,
  ...rest
}: {
  labelText: string;
  placeholder: string;
  isFixed: boolean;
  value: { isFixed: boolean; userId: number }[];
  onChange?: (options: { isFixed: boolean; userId: number }[]) => void;
  options?: Options<CheckedSelectOption>;
} & Omit<Partial<ComponentProps<typeof CheckedTeamSelect>>, "onChange" | "value">) => {
  return (
    <div className="flex flex-col space-y-5 bg-gray-50 p-4">
      <div>
        <Label>{labelText}</Label>
        <CheckedTeamSelect
          isOptionDisabled={(option) => !!value.find((host) => host.userId.toString() === option.value)}
          onChange={(options) => {
            onChange &&
              onChange(
                options.map((option) => ({
                  isFixed,
                  userId: parseInt(option.value, 10),
                }))
              );
          }}
          value={(value || [])
            .filter(({ isFixed: _isFixed }) => isFixed === _isFixed)
            .map(
              (host) =>
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                options.find((member) => member.value === host.userId.toString())!
            )
            .filter(Boolean)}
          controlShouldRenderValue={false}
          options={options}
          placeholder={placeholder}
          {...rest}
        />
      </div>
    </div>
  );
};

const RoundRobinHosts = ({
  teamMembers,
  value,
  onChange,
}: {
  value: { isFixed: boolean; userId: number }[];
  onChange: (hosts: { isFixed: boolean; userId: number }[]) => void;
  teamMembers: {
    value: string;
    label: string;
    avatar: string;
    email: string;
  }[];
}) => {
  const { t } = useLocale();
  return (
    <>
      <CheckedHostField
        options={teamMembers.sort(sortByLabel)}
        isFixed={true}
        onChange={(changeValue) => {
          onChange([...value.filter(({ isFixed }) => !isFixed), ...changeValue]);
        }}
        value={value}
        placeholder={t("add_fixed_hosts")}
        labelText={t("fixed_hosts")}
      />
      <CheckedHostField
        options={teamMembers.sort(sortByLabel)}
        onChange={(changeValue) => onChange([...value.filter(({ isFixed }) => isFixed), ...changeValue])}
        value={value}
        isFixed={false}
        placeholder={t("add_attendees")}
        labelText={t("round_robin_hosts")}
      />
    </>
  );
};

const ChildrenEventTypes = ({
  childrenEventTypeOptions,
}: {
  childrenEventTypeOptions: ReturnType<typeof mapMemberToChildrenOption>[];
}) => {
  const {
    resetField,
    getValues,
    formState: { submitCount },
  } = useFormContext<FormValues>();
  const initialValue = useRef<{
    submitCount: number;
    children: ChildrenEventType[];
  } | null>(null);

  useEffect(() => {
    // Handles init & out of date initial value after submission.
    if (!initialValue.current || initialValue.current?.submitCount !== submitCount) {
      initialValue.current = { children: getValues("children"), submitCount };
      return;
    }
  }, [resetField, getValues, submitCount]);

  return (
    <Controller<FormValues>
      name="children"
      render={({ field: { onChange, value } }) => {
        console.log({ value });
        return (
          <ChildrenEventTypesList value={value} options={childrenEventTypeOptions} onChange={onChange} />
        );
      }}
    />
  );
};

const Hosts = ({
  teamMembers,
}: {
  teamMembers: {
    value: string;
    label: string;
    avatar: string;
    email: string;
  }[];
}) => {
  const { t } = useLocale();
  const {
    control,
    resetField,
    getValues,
    formState: { submitCount },
  } = useFormContext<FormValues>();
  const schedulingType = useWatch({
    control,
    name: "schedulingType",
  });
  const initialValue = useRef<{
    hosts: FormValues["hosts"];
    schedulingType: SchedulingType | null;
    submitCount: number;
  } | null>(null);

  useEffect(() => {
    // Handles init & out of date initial value after submission.
    if (!initialValue.current || initialValue.current?.submitCount !== submitCount) {
      initialValue.current = { hosts: getValues("hosts"), schedulingType, submitCount };
      return;
    }
    resetField("hosts", {
      defaultValue: initialValue.current.schedulingType === schedulingType ? initialValue.current.hosts : [],
    });
  }, [schedulingType, resetField, getValues, submitCount]);

  return (
    <Controller<FormValues>
      name="hosts"
      render={({ field: { onChange, value } }) => {
        const schedulingTypeRender = {
          COLLECTIVE: (
            <CheckedHostField
              value={value}
              onChange={onChange}
              isFixed={true}
              options={teamMembers.sort(sortByLabel)}
              placeholder={t("add_attendees")}
              labelText={t("team")}
            />
          ),
          ROUND_ROBIN: (
            <>
              <RoundRobinHosts teamMembers={teamMembers} onChange={onChange} value={value} />
              {/*<TextField
        required
        type="number"
        label={t("minimum_round_robin_hosts_count")}
        defaultValue={1}
        {...formMethods.register("minimumHostCount")}
        addOnSuffix={<>{t("hosts")}</>}
                />*/}
            </>
          ),
          MANAGED: <></>,
        };
        return !!schedulingType ? schedulingTypeRender[schedulingType] : <></>;
      }}
    />
  );
};

export const EventTeamTab = ({
  team,
  teamMembers,
  eventType,
}: Pick<EventTypeSetupProps, "teamMembers" | "team" | "eventType">) => {
  const { t } = useLocale();

  const schedulingTypeOptions: {
    value: SchedulingType;
    label: string;
    // description: string;
  }[] = [
    {
      value: "COLLECTIVE",
      label: t("collective"),
      // description: t("collective_description"),
    },
    {
      value: "ROUND_ROBIN",
      label: t("round_robin"),
      // description: t("round_robin_description"),
    },
  ];
  const teamMembersOptions = teamMembers.map(mapUserToValue);
  const childrenEventTypeOptions = teamMembers.map((member) => {
    return mapMemberToChildrenOption(member, eventType.slug, eventType.children);
  });
  const isManagedEventType = eventType.schedulingType === SchedulingType.MANAGED;
  return (
    <div>
      {team && !isManagedEventType && (
        <div className="space-y-5">
          <div className="flex flex-col">
            <Label>{t("scheduling_type")}</Label>
            <Controller<FormValues>
              name="schedulingType"
              render={({ field: { value, onChange } }) => (
                <Select
                  options={schedulingTypeOptions}
                  value={schedulingTypeOptions.find((opt) => opt.value === value)}
                  className="w-full"
                  onChange={(val) => {
                    onChange(val?.value);
                  }}
                />
              )}
            />
          </div>
          <Hosts teamMembers={teamMembersOptions} />
        </div>
      )}
      {team && isManagedEventType && (
        <ChildrenEventTypes childrenEventTypeOptions={childrenEventTypeOptions} />
      )}
    </div>
  );
};

import { useState } from "react";

import type { ICalendarSwitchProps } from "@calcom/features/calendars/CalendarSwitch";
import { QueryCell } from "@calcom/lib";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { ButtonProps } from "@calcom/ui";
import { CalendarSwitchComponent, AppListCard, List, DisconnectIntegrationComponent } from "@calcom/ui";

import { useAddSelectedCalendar } from "../../hooks/calendars/useAddSelectedCalendar";
import { useDeleteCalendarCredentials } from "../../hooks/calendars/useDeleteCalendarCredentials";
import { useRemoveSelectedCalendar } from "../../hooks/calendars/useRemoveSelectedCalendar";
import { useConnectedCalendars } from "../../hooks/useConnectedCalendars";
import { AtomsWrapper } from "../../src/components/atoms-wrapper";
import { Switch } from "../../src/components/ui/switch";
import { useToast } from "../../src/components/ui/use-toast";
import { CalendarSettings } from "../CalendarSettings";
import { ConnectedCalendarSettings } from "../ConnectedCalendarSettings";

export const CalendarSettingsPlatformWrapper = () => {
  const { t } = useLocale();
  const query = useConnectedCalendars({});

  return (
    <AtomsWrapper>
      <div>
        <QueryCell
          query={query}
          success={({ data }) => {
            const destinationCalendarId = data.destinationCalendar.externalId;

            if (!data.connectedCalendars.length) {
              return null;
            }

            return (
              <div className="border-subtle mt-6 rounded-lg border">
                <CalendarSettings>
                  <CalendarSettingsHeading />
                  <List noBorderTreatment className="p-6 pt-2">
                    {data.connectedCalendars.map((connectedCalendar) => {
                      console.log(connectedCalendar.calendars, "each calendars of connected calendar");

                      return (
                        <ConnectedCalendarSettings
                          key={connectedCalendar.credentialId}
                          isConnectedCalendarPresent={!!connectedCalendar.calendars}
                          errorMessage={<span>{t("calendar_error")}</span>}
                          actions={
                            <div className="flex w-32 justify-end">
                              <PlatformDisconnectIntegration
                                credentialId={connectedCalendar.credentialId}
                                trashIcon
                                buttonProps={{ className: "border border-default" }}
                                slug={connectedCalendar.integration.slug}
                              />
                            </div>
                          }>
                          <AppListCard
                            shouldHighlight
                            slug={connectedCalendar.integration.slug}
                            title={connectedCalendar.integration.name}
                            logo={`https://app.cal.com${connectedCalendar.integration.logo}`}
                            description={
                              connectedCalendar.primary?.email ?? connectedCalendar.integration.description
                            }
                            className="border-subtle mt-4 rounded-lg border"
                            actions={
                              <div className="flex w-32 justify-end">
                                <PlatformDisconnectIntegration
                                  credentialId={connectedCalendar.credentialId}
                                  trashIcon
                                  buttonProps={{ className: "border border-default" }}
                                  slug={connectedCalendar.integration.slug}
                                />
                              </div>
                            }>
                            <div className="border-subtle border-t">
                              <p className="text-subtle px-5 pt-4 text-sm">
                                {t("toggle_calendars_conflict")}
                              </p>
                              <ul className="space-y-4 px-5 py-4">
                                {connectedCalendar.calendars?.map((cal) => {
                                  return (
                                    <PlatformCalendarSwitch
                                      key={cal.externalId}
                                      externalId={cal.externalId}
                                      title={cal.name || "Nameless calendar"}
                                      name={cal.name || "Nameless calendar"}
                                      type={connectedCalendar.integration.type}
                                      isChecked={cal.isSelected}
                                      destination={cal.externalId === destinationCalendarId}
                                      credentialId={cal.credentialId}
                                    />
                                  );
                                })}
                              </ul>
                            </div>
                          </AppListCard>
                        </ConnectedCalendarSettings>
                      );
                    })}
                  </List>
                </CalendarSettings>
              </div>
            );
          }}
        />
      </div>
    </AtomsWrapper>
  );
};

const CalendarSettingsHeading = () => {
  const { t } = useLocale();

  return (
    <div className="border-subtle border-b p-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-emphasis text-base font-semibold leading-5">{t("check_for_conflicts")}</h4>
          <p className="text-default text-sm leading-tight">{t("select_calendars")}</p>
        </div>
      </div>
    </div>
  );
};

const PlatformDisconnectIntegration = (props: {
  credentialId: number;
  label?: string;
  slug?: string;
  trashIcon?: boolean;
  isGlobal?: boolean;
  onSuccess?: () => void;
  buttonProps?: ButtonProps;
}) => {
  const { t } = useLocale();
  const { onSuccess, credentialId, slug } = props;
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const { mutate: deleteCalendarCredentials } = useDeleteCalendarCredentials({
    onSuccess: () => {
      toast({
        description: t("app_removed_successfully"),
      });
      setModalOpen(false);
      onSuccess && onSuccess();
    },
    onError: () => {
      toast({
        description: t("error_removing_app"),
      });
      setModalOpen(false);
    },
  });

  return (
    <DisconnectIntegrationComponent
      onDeletionConfirmation={async () => {
        slug &&
          (await deleteCalendarCredentials({
            calendar: slug.split("-")[0],
            id: credentialId,
          }));
      }}
      {...props}
      isModalOpen={modalOpen}
      onModalOpen={() => setModalOpen((prevValue) => !prevValue)}
    />
  );
};

const PlatformCalendarSwitch = (props: ICalendarSwitchProps) => {
  const { isChecked, title, credentialId, type, externalId } = props;
  const [checkedInternal, setCheckedInternal] = useState(isChecked);
  const { toast } = useToast();

  const { mutate: addSelectedCalendar, isPending: isAddingSelectedCalendar } = useAddSelectedCalendar({
    onError: (err) => {
      toast({
        description: `Something went wrong while adding calendar - ${title}. ${err}`,
      });
    },
  });
  const { mutate: removeSelectedCalendar, isPending: isRemovingSelectedCalendar } = useRemoveSelectedCalendar(
    {
      onError: (err) => {
        toast({
          description: `Something went wrong while removing calendar - ${title}. ${err}`,
        });
      },
    }
  );

  const toggleSelectedCalendars = async ({
    isOn,
    credentialId,
    integration,
    externalId,
  }: {
    isOn: boolean;
    credentialId: number;
    integration: string;
    externalId: string;
  }) => {
    if (isOn) {
      await addSelectedCalendar({ credentialId, integration, externalId });
    } else {
      await removeSelectedCalendar({ credentialId, integration, externalId });
    }
  };

  return (
    <CalendarSwitchComponent
      destination={props.destination}
      {...props}
      isChecked={checkedInternal}
      isLoading={isAddingSelectedCalendar || isRemovingSelectedCalendar}>
      <Switch
        checked={checkedInternal}
        id={externalId}
        onCheckedChange={async () => {
          setCheckedInternal((prevValue) => !prevValue);
          await toggleSelectedCalendars({
            isOn: !checkedInternal,
            credentialId,
            externalId,
            integration: type,
          });
        }}
      />
    </CalendarSwitchComponent>
  );
};

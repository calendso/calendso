import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import dayjs from "@calcom/dayjs";
import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useHasTeamPlan } from "@calcom/lib/hooks/useHasPaidPlan";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import {
  Button,
  DateRangePicker,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Select,
  showToast,
  Switch,
  TextArea,
  UpgradeTeamsBadge,
} from "@calcom/ui";

import { OutOfOfficeTab } from "./OutOfOfficeEntriesList";

export type BookingRedirectForm = {
  dateRange: { startDate: Date; endDate: Date };
  offset: number;
  toTeamUserId: number | null;
  reasonId: number;
  notes?: string;
  uuid?: string | null;
  forUserId: number | null;
};

export const CreateOrEditOutOfOfficeEntryModal = ({
  openModal,
  closeModal,
  currentlyEditingOutOfOfficeEntry,
  setOOOEntriesUpdated,
  setOOOEntriesAdded,
}: {
  openModal: boolean;
  closeModal: () => void;
  currentlyEditingOutOfOfficeEntry: BookingRedirectForm | null;
  setOOOEntriesUpdated: Dispatch<SetStateAction<number>> | null;
  setOOOEntriesAdded: Dispatch<SetStateAction<number>> | null;
}) => {
  const { t } = useLocale();

  const searchParams = useCompatSearchParams();
  const oooType = searchParams?.get("type") ?? OutOfOfficeTab.MINE;

  const { data: listMembers } = trpc.viewer.teams.listMembers.useQuery({});
  const me = useMeQuery();
  const forwardingToMemberListOptions: {
    value: number;
    label: string;
  }[] =
    listMembers
      ?.filter((member) => (oooType === "mine" ? me?.data?.id !== member.id : oooType === "team"))
      .map((member) => ({
        value: member.id,
        label: member.name || "",
      })) || [];

  const oooForMemberListOptions: {
    value: number;
    label: string;
  }[] =
    listMembers
      ?.filter((member) => me?.data?.id !== member.id)
      .map((member) => ({
        value: member.id,
        label: member.name || "",
      })) || [];

  type Option = { value: number; label: string };

  const { data: outOfOfficeReasonList } = trpc.viewer.outOfOfficeReasonList.useQuery();

  const reasonList = (outOfOfficeReasonList || []).map((reason) => ({
    label: `${reason.emoji} ${reason.userId === null ? t(reason.reason) : reason.reason}`,
    value: reason.id,
  }));

  const [profileRedirect, setProfileRedirect] = useState(!!currentlyEditingOutOfOfficeEntry?.toTeamUserId);

  const { hasTeamPlan } = useHasTeamPlan();

  const {
    handleSubmit,
    setValue,
    control,
    register,
    formState: { isSubmitting },
    getValues,
  } = useForm<BookingRedirectForm>({
    defaultValues: currentlyEditingOutOfOfficeEntry
      ? currentlyEditingOutOfOfficeEntry
      : {
          dateRange: {
            startDate: dayjs().utc().startOf("d").toDate(),
            endDate: dayjs().utc().add(1, "d").endOf("d").toDate(),
          },
          offset: dayjs().utcOffset(),
          toTeamUserId: null,
          reasonId: 1,
          forUserId: null,
        },
  });
  console.log(isSubmitting);

  const createOrEditOutOfOfficeEntry = trpc.viewer.outOfOfficeCreateOrUpdate.useMutation({
    onSuccess: () => {
      showToast(
        currentlyEditingOutOfOfficeEntry
          ? t("success_edited_entry_out_of_office")
          : t("success_entry_created"),
        "success"
      );
      if (setOOOEntriesUpdated) {
        setOOOEntriesUpdated((previousValue) => previousValue + 1);
      }
      if (setOOOEntriesAdded && !currentlyEditingOutOfOfficeEntry) {
        setOOOEntriesAdded((previousValue) => previousValue + 1);
      }
      closeModal();
    },
    onError: (error) => {
      showToast(t(error.message), "error");
    },
  });

  return (
    <Dialog open={openModal}>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}>
        <form
          id="create-or-edit-ooo-form"
          onSubmit={handleSubmit((data) => {
            createOrEditOutOfOfficeEntry.mutate(data);
          })}>
          <div className="h-full px-1">
            <DialogHeader
              title={
                currentlyEditingOutOfOfficeEntry
                  ? t("edit_an_out_of_office")
                  : oooType === "team"
                  ? t("create_ooo_dialog_team_title")
                  : t("create_an_out_of_office")
              }
            />

            {/* In case of Team, Select Member for whom OOO is created */}
            {oooType === "team" && (
              <div className="mb-4 mt-4 h-16">
                <p className="text-emphasis block text-sm font-medium">
                  {currentlyEditingOutOfOfficeEntry ? t("edit_ooo_team_label") : t("create_ooo_team_label")}
                </p>
                <Controller
                  control={control}
                  name="forUserId"
                  render={({ field: { onChange, value } }) => (
                    <Select<Option>
                      name="oooForUsername"
                      data-testid="oooFor_username_select"
                      value={oooForMemberListOptions.find((member) => member.value === value)}
                      placeholder={t("select_team_member")}
                      isSearchable
                      options={oooForMemberListOptions}
                      onChange={(selectedOption) => {
                        if (selectedOption?.value) {
                          onChange(selectedOption.value);
                        }
                      }}
                      isDisabled={!!currentlyEditingOutOfOfficeEntry}
                    />
                  )}
                />
              </div>
            )}

            <div>
              <p className="text-emphasis mb-1 block text-sm font-medium capitalize">{t("dates")}</p>
              <div>
                <Controller
                  name="dateRange"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <DateRangePicker
                      dates={{ startDate: value.startDate, endDate: value.endDate }}
                      onDatesChange={(values) => {
                        onChange(values);
                      }}
                    />
                  )}
                />
              </div>
            </div>

            {/* Reason Select */}
            <div className="mt-4 w-full">
              <div className="">
                <p className="text-emphasis block text-sm font-medium">{t("reason")}</p>
                <Controller
                  control={control}
                  name="reasonId"
                  render={({ field: { onChange, value } }) => (
                    <Select<Option>
                      className="mb-0 mt-1 text-white"
                      name="reason"
                      data-testid="reason_select"
                      value={reasonList.find((reason) => reason.value === value)}
                      placeholder={t("ooo_select_reason")}
                      options={reasonList}
                      onChange={(selectedOption) => {
                        if (selectedOption?.value) {
                          onChange(selectedOption.value);
                        }
                      }}
                    />
                  )}
                />
              </div>
            </div>

            {/* Notes input */}
            <div className="mt-4">
              <p className="text-emphasis block text-sm font-medium">{t("notes")}</p>
              <TextArea
                data-testid="notes_input"
                className="border-subtle mt-1 h-10 w-full rounded-lg border px-2"
                placeholder={t("additional_notes")}
                {...register("notes")}
                onChange={(e) => {
                  setValue("notes", e?.target.value);
                }}
              />
            </div>

            <div className="bg-muted my-4 rounded-xl p-5">
              <div className="flex flex-row">
                <Switch
                  disabled={!hasTeamPlan}
                  data-testid="profile-redirect-switch"
                  checked={profileRedirect}
                  id="profile-redirect-switch"
                  onCheckedChange={(state) => {
                    setProfileRedirect(state);
                    if (!state) {
                      setValue("toTeamUserId", null);
                    }
                  }}
                  label={hasTeamPlan ? t("redirect_team_enabled") : t("redirect_team_disabled")}
                />
                {!hasTeamPlan && (
                  <div className="mx-2" data-testid="upgrade-team-badge">
                    <UpgradeTeamsBadge />
                  </div>
                )}
              </div>

              {profileRedirect && (
                <div className="mt-4">
                  <div className="h-16">
                    <p className="text-emphasis block text-sm font-medium">{t("team_member")}</p>
                    <Controller
                      control={control}
                      name="toTeamUserId"
                      render={({ field: { onChange, value } }) => (
                        <Select<Option>
                          name="toTeamUsername"
                          data-testid="team_username_select"
                          value={forwardingToMemberListOptions.find((member) => member.value === value)}
                          placeholder={t("select_team_member")}
                          isSearchable
                          options={forwardingToMemberListOptions.filter(
                            (option) => option.value !== getValues("forUserId")
                          )}
                          onChange={(selectedOption) => {
                            if (selectedOption?.value) {
                              onChange(selectedOption.value);
                            }
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter showDivider noSticky>
            <div className="flex">
              <Button
                color="minimal"
                type="button"
                onClick={() => {
                  closeModal();
                }}
                className="mr-1">
                {t("cancel")}
              </Button>
              <Button
                form="create-or-edit-ooo-form"
                color="primary"
                type="submit"
                disabled={isSubmitting}
                data-testid="create-or-edit-entry-ooo-redirect">
                {currentlyEditingOutOfOfficeEntry ? t("save") : t("create")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

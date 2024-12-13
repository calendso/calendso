"use client";

import { revalidateSchedulePage } from "app/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AvailabilitySettings } from "@calcom/atoms/monorepo";
import type { BulkUpdatParams } from "@calcom/features/eventtypes/components/BulkEditDefaultForEventsModal";
import { withErrorFromUnknown } from "@calcom/lib/getClientErrorFromUnknown";
import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { HttpError } from "@calcom/lib/http-error";
import type { ScheduleRepository } from "@calcom/lib/server/repository/schedule";
import type { TravelScheduleRepository } from "@calcom/lib/server/repository/travelSchedule";
import { trpc } from "@calcom/trpc/react";
import useMeQuery from "@calcom/trpc/react/hooks/useMeQuery";
import { showToast } from "@calcom/ui";

type PageProps = {
  scheduleFetched: Awaited<ReturnType<typeof ScheduleRepository.findDetailedScheduleById>>;
  travelSchedules?: Awaited<ReturnType<typeof TravelScheduleRepository.findTravelSchedulesByUserId>>;
};

export const AvailabilitySettingsWebWrapper = ({
  scheduleFetched: schedule,
  travelSchedules: travelSchedulesProp,
}: PageProps) => {
  const searchParams = useCompatSearchParams();
  const { t } = useLocale();
  const router = useRouter();
  const utils = trpc.useUtils();
  const me = useMeQuery();
  const scheduleId = schedule.id;
  const fromEventType = searchParams?.get("fromEventType");
  const { timeFormat } = me.data || { timeFormat: null };

  const { data: travelSchedulesData } = trpc.viewer.getTravelSchedules.useQuery(undefined, {
    enabled: !travelSchedulesProp,
  });
  const travelSchedules = travelSchedulesProp ?? travelSchedulesData;

  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);
  const bulkUpdateDefaultAvailabilityMutation =
    trpc.viewer.availability.schedule.bulkUpdateToDefaultAvailability.useMutation();

  const { data: eventTypesQueryData, isFetching: isEventTypesFetching } =
    trpc.viewer.eventTypes.bulkEventFetch.useQuery();

  const bulkUpdateFunction = ({ eventTypeIds, callback }: BulkUpdatParams) => {
    bulkUpdateDefaultAvailabilityMutation.mutate(
      {
        eventTypeIds,
      },
      {
        onSuccess: async () => {
          await revalidateSchedulePage(scheduleId);
          utils.viewer.availability.list.invalidate();
          callback();
          showToast(t("success"), "success");
        },
      }
    );
  };

  const handleBulkEditDialogToggle = () => {
    utils.viewer.getUsersDefaultConferencingApp.invalidate();
  };

  const isDefaultSchedule = me.data?.defaultScheduleId === scheduleId;

  const updateMutation = trpc.viewer.availability.schedule.update.useMutation({
    onSuccess: async ({ prevDefaultId, currentDefaultId, ...data }) => {
      if (prevDefaultId && currentDefaultId && prevDefaultId !== currentDefaultId) {
        // check weather the default schedule has been changed by comparing  previous default schedule id and current default schedule id.
        // if not equal, invalidate previous default schedule id and refetch previous default schedule id.
        await Promise.all([revalidateSchedulePage(prevDefaultId), revalidateSchedulePage(scheduleId)]);
      } else {
        await revalidateSchedulePage(scheduleId);
      }
      utils.viewer.availability.list.invalidate();
      showToast(
        t("availability_updated_successfully", {
          scheduleName: data.schedule.name,
        }),
        "success"
      );
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      }
    },
  });

  const deleteMutation = trpc.viewer.availability.schedule.delete.useMutation({
    onError: withErrorFromUnknown((err) => {
      showToast(err.message, "error");
    }),
    onSettled: () => {
      utils.viewer.availability.list.invalidate();
    },
    onSuccess: () => {
      showToast(t("schedule_deleted_successfully"), "success");
      router.push("/availability");
    },
  });

  return (
    <AvailabilitySettings
      schedule={schedule}
      travelSchedules={isDefaultSchedule ? travelSchedules || [] : []}
      isDeleting={deleteMutation.isPending}
      isLoading={false}
      isSaving={updateMutation.isPending}
      enableOverrides={true}
      timeFormat={timeFormat}
      weekStart={me.data?.weekStart || "Sunday"}
      backPath={fromEventType ? true : "/availability"}
      handleDelete={() => {
        scheduleId && deleteMutation.mutate({ scheduleId });
      }}
      handleSubmit={async ({ dateOverrides, ...values }) => {
        scheduleId &&
          updateMutation.mutate({
            scheduleId,
            dateOverrides: dateOverrides.flatMap((override) => override.ranges),
            ...values,
          });
      }}
      bulkUpdateModalProps={{
        isOpen: isBulkUpdateModalOpen,
        setIsOpen: setIsBulkUpdateModalOpen,
        save: bulkUpdateFunction,
        isSaving: bulkUpdateDefaultAvailabilityMutation.isPending,
        eventTypes: eventTypesQueryData?.eventTypes,
        isEventTypesFetching,
        handleBulkEditDialogToggle: handleBulkEditDialogToggle,
      }}
    />
  );
};

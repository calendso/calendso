import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

import { useOrgBranding } from "@calcom/ee/organizations/context/provider";
import { getLayout } from "@calcom/features/MainLayout";
import { NewScheduleButton, ScheduleListItem } from "@calcom/features/schedules";
import { ShellMain } from "@calcom/features/shell/Shell";
import { AvailabilitySliderTable } from "@calcom/features/timezone-buddy/components/AvailabilitySliderTable";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { HttpError } from "@calcom/lib/http-error";
import type { RouterOutputs } from "@calcom/trpc/react";
import { trpc } from "@calcom/trpc/react";
import { EmptyScreen, showToast, ToggleGroup } from "@calcom/ui";
import { Clock } from "@calcom/ui/components/icon";

import { withQuery } from "@lib/QueryCell";

import PageWrapper from "@components/PageWrapper";
import SkeletonLoader from "@components/availability/SkeletonLoader";

export function AvailabilityList({ schedules }: RouterOutputs["viewer"]["availability"]["list"]) {
  const { t } = useLocale();
  const utils = trpc.useContext();

  const meQuery = trpc.viewer.me.useQuery();

  const router = useRouter();

  const deleteMutation = trpc.viewer.availability.schedule.delete.useMutation({
    onMutate: async ({ scheduleId }) => {
      await utils.viewer.availability.list.cancel();
      const previousValue = utils.viewer.availability.list.getData();
      if (previousValue) {
        const filteredValue = previousValue.schedules.filter(({ id }) => id !== scheduleId);
        utils.viewer.availability.list.setData(undefined, { ...previousValue, schedules: filteredValue });
      }

      return { previousValue };
    },

    onError: (err, variables, context) => {
      if (context?.previousValue) {
        utils.viewer.availability.list.setData(undefined, context.previousValue);
      }
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      }
    },
    onSettled: () => {
      utils.viewer.availability.list.invalidate();
    },
    onSuccess: () => {
      showToast(t("schedule_deleted_successfully"), "success");
    },
  });

  const updateMutation = trpc.viewer.availability.schedule.update.useMutation({
    onSuccess: async ({ schedule }) => {
      await utils.viewer.availability.list.invalidate();
      showToast(
        t("availability_updated_successfully", {
          scheduleName: schedule.name,
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

  const duplicateMutation = trpc.viewer.availability.schedule.duplicate.useMutation({
    onSuccess: async ({ schedule }) => {
      await router.push(`/availability/${schedule.id}`);
      showToast(t("schedule_created_successfully", { scheduleName: schedule.name }), "success");
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      }
    },
  });

  // Adds smooth delete button - item fades and old item slides into place

  const [animationParentRef] = useAutoAnimate<HTMLUListElement>();

  return (
    <>
      {schedules.length === 0 ? (
        <div className="flex justify-center">
          <EmptyScreen
            Icon={Clock}
            headline={t("new_schedule_heading")}
            description={t("new_schedule_description")}
            className="w-full"
            buttonRaw={<NewScheduleButton />}
          />
        </div>
      ) : (
        <div className="border-subtle bg-default mb-16 overflow-hidden rounded-md border">
          <ul className="divide-subtle divide-y" data-testid="schedules" ref={animationParentRef}>
            {schedules.map((schedule) => (
              <ScheduleListItem
                displayOptions={{
                  hour12: meQuery.data?.timeFormat ? meQuery.data.timeFormat === 12 : undefined,
                  timeZone: meQuery.data?.timeZone,
                }}
                key={schedule.id}
                schedule={schedule}
                isDeletable={schedules.length !== 1}
                updateDefault={updateMutation.mutate}
                deleteFunction={deleteMutation.mutate}
                duplicateFunction={duplicateMutation.mutate}
              />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WithQuery = withQuery(trpc.viewer.availability.list as any);

export default function AvailabilityPage() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const orgBranding = useOrgBranding();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams ?? undefined);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );
  return (
    <div>
      <ShellMain
        heading={t("availability")}
        hideHeadingOnMobile
        subtitle={t("configure_availability")}
        CTA={
          <div className="flex gap-2">
            {orgBranding && (
              <ToggleGroup
                className="hidden md:block"
                defaultValue={searchParams?.get("type") ?? "mine"}
                onValueChange={(value) => {
                  router.push(`${pathname}?${createQueryString("type", value)}`);
                }}
                options={[
                  { value: "mine", label: t("my_availability") },
                  { value: "team", label: t("team_availability") },
                ]}
              />
            )}
            <NewScheduleButton />
          </div>
        }>
        {searchParams?.get("type") === "team" && orgBranding ? (
          <AvailabilitySliderTable />
        ) : (
          <WithQuery
            success={({ data }) => <AvailabilityList {...data} />}
            customLoader={<SkeletonLoader />}
          />
        )}
      </ShellMain>
    </div>
  );
}

AvailabilityPage.getLayout = getLayout;

AvailabilityPage.PageWrapper = PageWrapper;

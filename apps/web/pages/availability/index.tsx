import { ClockIcon } from "@heroicons/react/outline";
import { DotsHorizontalIcon, TrashIcon } from "@heroicons/react/solid";
import { Availability } from "@prisma/client";
import Link from "next/link";
import React from "react";

import { availabilityAsString } from "@calcom/lib/availability";
import { Button } from "@calcom/ui";

import { QueryCell } from "@lib/QueryCell";
import { HttpError } from "@lib/core/http/error";
import { useLocale } from "@lib/hooks/useLocale";
import showToast from "@lib/notification";
import { inferQueryOutput, trpc } from "@lib/trpc";

import Shell from "@components/Shell";
import { NewScheduleButton } from "@components/availability/NewScheduleButton";
import Dropdown, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/Dropdown";

const CreateFirstScheduleView = () => {
  const { t } = useLocale();

  return (
    <div className="md:py-20">
      <div className="mx-auto block text-center md:max-w-screen-sm">
        <ClockIcon className="inline w-12 text-neutral-400" />
        <h3 className="mt-2 text-xl font-bold text-neutral-900">{t("new_schedule_heading")}</h3>
        <p className="text-md mt-1 mb-2 text-neutral-600">{t("new_schedule_description")}</p>
        <NewScheduleButton name="first-new-schedule" />
      </div>
    </div>
  );
};

export function AvailabilityList({ schedules }: inferQueryOutput<"viewer.availability.list">) {
  const { t, i18n } = useLocale();
  const deleteMutation = trpc.useMutation("viewer.availability.schedule.delete", {
    onSuccess: async () => {
      showToast(t("schedule_deleted_successfully"), "success");
      window.location.reload();
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      }
    },
  });
  return (
    <div className="-mx-4 mb-16 overflow-hidden rounded-sm border border-gray-200 bg-white sm:mx-0">
      {schedules.length === 0 && <CreateFirstScheduleView />}
      <ul className="divide-y divide-neutral-200" data-testid="schedules">
        {schedules.map((schedule) => (
          <li key={schedule.id}>
            <div className="flex items-center justify-between py-5 hover:bg-neutral-50">
              <div className="group flex w-full items-center justify-between hover:bg-neutral-50 sm:px-6">
                <Link href={"/availability/" + schedule.id}>
                  <a className="flex-grow truncate text-sm" title={schedule.name}>
                    <div>
                      <span className="truncate font-medium text-neutral-900">{schedule.name}</span>
                      {schedule.isDefault && (
                        <span className="ml-2 inline items-center rounded-sm bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800">
                          {t("default")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {schedule.availability.map((availability: Availability) => (
                        <>
                          {availabilityAsString(availability, i18n.language)}
                          <br />
                        </>
                      ))}
                    </p>
                  </a>
                </Link>
              </div>
              <Dropdown>
                <DropdownMenuTrigger className="group mr-5 h-10 w-10 border border-transparent p-0 text-neutral-400 hover:border-gray-200">
                  <DotsHorizontalIcon className="h-5 w-5 group-hover:text-gray-800" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Button
                      onClick={() =>
                        deleteMutation.mutate({
                          scheduleId: schedule.id,
                        })
                      }
                      type="button"
                      color="minimal"
                      className="w-full font-normal"
                      StartIcon={TrashIcon}>
                      {t("delete_schedule")}
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </Dropdown>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AvailabilityPage() {
  const { t } = useLocale();
  const query = trpc.useQuery(["viewer.availability.list"]);
  return (
    <div>
      <Shell heading={t("availability")} subtitle={t("configure_availability")} CTA={<NewScheduleButton />}>
        <QueryCell query={query} success={({ data }) => <AvailabilityList {...data} />} />
      </Shell>
    </div>
  );
}

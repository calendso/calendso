import type { PageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";

import type { AvailabilitySettingsProps } from "@calcom/atoms/availability/AvailabilitySettings";
import { AUTH_OPTIONS } from "@calcom/features/auth/lib/next-auth-options";
import { ScheduleRepository } from "@calcom/lib/server/repository/schedule";
import { TravelScheduleRepository } from "@calcom/lib/server/repository/travelSchedule";

import PageWrapper from "@components/PageWrapperAppDir";

import { AvailabilitySettingsWebWrapper } from "~/availability/[schedule]/schedule-view";

export const generateMetadata = async ({ params }: PageProps) => {
  const scheduleId = params?.schedule ? Number(params.schedule) : -1;
  const schedule = await ScheduleRepository.findScheduleById({ id: scheduleId });

  if (!schedule) {
    return await _generateMetadata(
      (t) => t("availability"),
      () => ""
    );
  }

  return await _generateMetadata(
    (t) => (schedule.name ? `${schedule.name} | ${t("availability")}` : t("availability")),
    () => ""
  );
};

const Page = async ({ params }: PageProps) => {
  const h = headers();
  const nonce = h.get("x-nonce") ?? undefined;
  const session = await getServerSession(AUTH_OPTIONS);
  const userId = session?.user?.id ?? -1;
  const scheduleId = params?.schedule ? Number(params.schedule) : -1;
  const [schedule, travelSchedules] = await Promise.all([
    ScheduleRepository.findScheduleById({ id: scheduleId }),
    TravelScheduleRepository.findTravelSchedulesByUserId(userId),
  ]);
  return (
    <PageWrapper
      getLayout={null}
      requiresLicense={false}
      nonce={nonce}
      themeBasis={null}
      isBookingPage={false}>
      <AvailabilitySettingsWebWrapper
        schedule={schedule as unknown as AvailabilitySettingsProps["schedule"]}
        travelSchedules={travelSchedules}
      />
    </PageWrapper>
  );
};

export default Page;

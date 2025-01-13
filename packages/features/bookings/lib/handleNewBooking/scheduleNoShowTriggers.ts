import dayjs from "@calcom/dayjs";
import type { ProcessWorkflowStepParams } from "@calcom/ee/workflows/lib/processWorkflowStep";
import type { Workflow } from "@calcom/features/ee/workflows/lib/types";
import tasker from "@calcom/features/tasker";
import getWebhooks from "@calcom/features/webhooks/lib/getWebhooks";
import { WebhookTriggerEvents, WorkflowTriggerEvents } from "@calcom/prisma/enums";

interface ScheduleNoShowTriggersArgs extends ProcessWorkflowStepParams {
  booking: {
    startTime: Date;
    id: number;
  };
  triggerForUser?: number | true | null;
  organizerUser: { id: number | null };
  eventTypeId: number | null;
  teamId?: number | null;
  orgId?: number | null;
  oAuthClientId?: string | null;
  workflows: Workflow[];
  isDryRun?: boolean;
  isNotConfirmed?: boolean;
  isFirstRecurringEvent?: boolean;
}

export const scheduleNoShowTriggers = async (args: ScheduleNoShowTriggersArgs) => {
  const {
    booking,
    triggerForUser,
    organizerUser,
    eventTypeId,
    teamId,
    orgId,
    oAuthClientId,
    workflows,
    isDryRun = false,
    isNotConfirmed = false,
    calendarEvent,
    emailAttendeeSendToOverride = "",
    smsReminderNumber,
    hideBranding,
    seatReferenceUid,
  } = args;

  if (isDryRun || isNotConfirmed) return;

  // Add task for automatic no show in cal video
  const noShowPromises: Promise<any>[] = [];

  const subscribersHostsNoShowStarted = await getWebhooks({
    userId: triggerForUser ? organizerUser.id : null,
    eventTypeId,
    triggerEvent: WebhookTriggerEvents.AFTER_HOSTS_CAL_VIDEO_NO_SHOW,
    teamId,
    orgId,
    oAuthClientId,
  });

  noShowPromises.push(
    ...subscribersHostsNoShowStarted.map((webhook) => {
      if (booking?.startTime && webhook.time && webhook.timeUnit) {
        const scheduledAt = dayjs(booking.startTime)
          .add(webhook.time, webhook.timeUnit.toLowerCase() as dayjs.ManipulateType)
          .toDate();
        return tasker.create(
          "triggerHostNoShowWebhook",
          {
            triggerEvent: WebhookTriggerEvents.AFTER_HOSTS_CAL_VIDEO_NO_SHOW,
            bookingId: booking.id,
            // Prevents null values from being serialized
            webhook: { ...webhook, time: webhook.time, timeUnit: webhook.timeUnit },
          },
          { scheduledAt }
        );
      }
      return Promise.resolve();
    })
  );

  const subscribersGuestsNoShowStarted = await getWebhooks({
    userId: triggerForUser ? organizerUser.id : null,
    eventTypeId,
    triggerEvent: WebhookTriggerEvents.AFTER_GUESTS_CAL_VIDEO_NO_SHOW,
    teamId,
    orgId,
    oAuthClientId,
  });

  noShowPromises.push(
    ...subscribersGuestsNoShowStarted.map((webhook) => {
      if (booking?.startTime && webhook.time && webhook.timeUnit) {
        const scheduledAt = dayjs(booking.startTime)
          .add(webhook.time, webhook.timeUnit.toLowerCase() as dayjs.ManipulateType)
          .toDate();

        return tasker.create(
          "triggerGuestNoShowWebhook",
          {
            triggerEvent: WebhookTriggerEvents.AFTER_GUESTS_CAL_VIDEO_NO_SHOW,
            bookingId: booking.id,
            // Prevents null values from being serialized
            webhook: { ...webhook, time: webhook.time, timeUnit: webhook.timeUnit },
          },
          { scheduledAt }
        );
      }

      return Promise.resolve();
    })
  );

  const workflowHostsNoShow = workflows.filter(
    (workflow) => workflow.trigger === WebhookTriggerEvents.AFTER_HOSTS_CAL_VIDEO_NO_SHOW
  );

  noShowPromises.push(
    ...workflowHostsNoShow.map((workflow) => {
      if (booking?.startTime && workflow.time && workflow.timeUnit) {
        const scheduledAt = dayjs(booking.startTime)
          .add(workflow.time, workflow.timeUnit.toLowerCase() as dayjs.ManipulateType)
          .toDate();

        return tasker.create(
          "triggerHostNoShowWorkflow",
          {
            triggerEvent: WorkflowTriggerEvents.AFTER_HOSTS_CAL_VIDEO_NO_SHOW,
            bookingId: booking.id,
            // Prevents null values from being serialized
            workflow: { ...workflow, time: workflow.time, timeUnit: workflow.timeUnit },
            calendarEvent,
            emailAttendeeSendToOverride,
            smsReminderNumber,
            hideBranding,
            seatReferenceUid,
          },
          { scheduledAt }
        );
      }

      return Promise.resolve();
    })
  );

  const workflowGuestsNoShow = workflows.filter(
    (workflow) => workflow.trigger === WebhookTriggerEvents.AFTER_GUESTS_CAL_VIDEO_NO_SHOW
  );

  noShowPromises.push(
    ...workflowGuestsNoShow.map((workflow) => {
      if (booking?.startTime && workflow.time && workflow.timeUnit) {
        const scheduledAt = dayjs(booking.startTime)
          .add(workflow.time, workflow.timeUnit.toLowerCase() as dayjs.ManipulateType)
          .toDate();

        return tasker.create(
          "triggerGuestNoShowWorkflow",
          {
            triggerEvent: WorkflowTriggerEvents.AFTER_HOSTS_CAL_VIDEO_NO_SHOW,
            bookingId: booking.id,
            // Prevents null values from being serialized
            workflow: { ...workflow, time: workflow.time, timeUnit: workflow.timeUnit },
            calendarEvent,
            emailAttendeeSendToOverride,
            smsReminderNumber,
            hideBranding,
            seatReferenceUid,
          },
          { scheduledAt }
        );
      }

      return Promise.resolve();
    })
  );

  await Promise.all(noShowPromises);
};

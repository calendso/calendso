import type { Workflow, WorkflowsOnEventTypes, WorkflowStep } from "@prisma/client";
import { WorkflowActions, WorkflowTriggerEvents } from "@prisma/client";

import { SENDER_ID, SENDER_NAME } from "@calcom/lib/constants";
import type { CalendarEvent } from "@calcom/types/Calendar";

import { scheduleEmailReminder } from "./emailReminderManager";
import { scheduleSMSReminder } from "./smsReminderManager";

export interface ScheduleWorkflowRemindersArgs {
  workflows: (WorkflowsOnEventTypes & {
    workflow: Workflow & {
      steps: WorkflowStep[];
    };
  })[];
  smsReminderNumber: string | null;
  calendarEvent: CalendarEvent & { metadata?: { videoCallUrl: string | undefined } };
  requiresConfirmation?: boolean;
  isRescheduleEvent?: boolean;
  isFirstRecurringEvent?: boolean;
}

export const scheduleWorkflowReminders = async (args: ScheduleWorkflowRemindersArgs) => {
  const {
    workflows,
    smsReminderNumber,
    calendarEvent: evt,
    requiresConfirmation = false,
    isRescheduleEvent = false,
    isFirstRecurringEvent = false,
  } = args;
  if (workflows.length > 0 && !requiresConfirmation) {
    for (const workflowReference of workflows) {
      if (workflowReference.workflow.steps.length === 0) continue;

      const workflow = workflowReference.workflow;
      if (
        workflow.trigger === WorkflowTriggerEvents.BEFORE_EVENT ||
        (workflow.trigger === WorkflowTriggerEvents.NEW_EVENT &&
          !isRescheduleEvent &&
          isFirstRecurringEvent) ||
        (workflow.trigger === WorkflowTriggerEvents.RESCHEDULE_EVENT && isRescheduleEvent) ||
        workflow.trigger === WorkflowTriggerEvents.AFTER_EVENT
      ) {
        for (const step of workflow.steps) {
          if (step.action === WorkflowActions.SMS_ATTENDEE || step.action === WorkflowActions.SMS_NUMBER) {
            const sendTo = step.action === WorkflowActions.SMS_ATTENDEE ? smsReminderNumber : step.sendTo;
            await scheduleSMSReminder(
              evt,
              sendTo,
              workflow.trigger,
              step.action,
              {
                time: workflow.time,
                timeUnit: workflow.timeUnit,
              },
              step.reminderBody || "",
              step.id,
              step.template,
              step.sender || SENDER_ID,
              workflow.userId,
              workflow.teamId,
              step.numberVerificationPending
            );
          } else if (
            step.action === WorkflowActions.EMAIL_ATTENDEE ||
            step.action === WorkflowActions.EMAIL_HOST
          ) {
            let sendTo = "";

            switch (step.action) {
              case WorkflowActions.EMAIL_HOST:
                sendTo = evt.organizer?.email || "";
                break;
              case WorkflowActions.EMAIL_ATTENDEE:
                sendTo = evt.attendees?.[0]?.email || "";
                break;
            }

            await scheduleEmailReminder(
              evt,
              workflow.trigger,
              step.action,
              {
                time: workflow.time,
                timeUnit: workflow.timeUnit,
              },
              sendTo,
              step.emailSubject || "",
              step.reminderBody || "",
              step.id,
              step.template,
              step.sender || SENDER_NAME
            );
          }
        }
      }
    }
  }
};

export const sendCancelledReminders = async (
  workflows: (WorkflowsOnEventTypes & {
    workflow: Workflow & {
      steps: WorkflowStep[];
    };
  })[],
  smsReminderNumber: string | null,
  evt: CalendarEvent
) => {
  if (workflows.length > 0) {
    workflows
      .filter((workflowRef) => workflowRef.workflow.trigger === WorkflowTriggerEvents.EVENT_CANCELLED)
      .forEach((workflowRef) => {
        const workflow = workflowRef.workflow;
        workflow.steps.forEach(async (step) => {
          if (step.action === WorkflowActions.SMS_ATTENDEE || step.action === WorkflowActions.SMS_NUMBER) {
            const sendTo = step.action === WorkflowActions.SMS_ATTENDEE ? smsReminderNumber : step.sendTo;
            await scheduleSMSReminder(
              evt,
              sendTo,
              workflow.trigger,
              step.action,
              {
                time: workflow.time,
                timeUnit: workflow.timeUnit,
              },
              step.reminderBody || "",
              step.id,
              step.template,
              step.sender || SENDER_ID,
              workflow.userId,
              workflow.teamId,
              step.numberVerificationPending
            );
          } else if (
            step.action === WorkflowActions.EMAIL_ATTENDEE ||
            step.action === WorkflowActions.EMAIL_HOST
          ) {
            let sendTo = "";

            switch (step.action) {
              case WorkflowActions.EMAIL_HOST:
                sendTo = evt.organizer.email;
                break;
              case WorkflowActions.EMAIL_ATTENDEE:
                sendTo = evt.attendees[0].email;
                break;
            }
            scheduleEmailReminder(
              evt,
              workflow.trigger,
              step.action,
              {
                time: workflow.time,
                timeUnit: workflow.timeUnit,
              },
              sendTo,
              step.emailSubject || "",
              step.reminderBody || "",
              step.id,
              step.template,
              step.sender || SENDER_NAME
            );
          }
        });
      });
  }
};

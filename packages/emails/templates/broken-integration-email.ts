import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import timezone from "dayjs/plugin/timezone";
import toArray from "dayjs/plugin/toArray";
import utc from "dayjs/plugin/utc";
import { createEvent, DateArray, Person } from "ics";
import { TFunction } from "next-i18next";
import rrule from "rrule";

import { getRichDescription } from "@calcom/lib/CalEventParser";
import type { CalendarEvent } from "@calcom/types/Calendar";

import { renderEmail } from "..";
import BaseEmail from "./_base-email";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(toArray);

export default class BrokenIntegrationEmail extends BaseEmail {
  type: string;
  calEvent: CalendarEvent;
  t: TFunction;

  constructor(calEvent: CalendarEvent, type: string) {
    super();
    this.name = "SEND_BROKEN_INTEGRATION";
    this.calEvent = calEvent;
    this.t = this.calEvent.organizer.language.translate;
    this.type = type;
  }

  protected getNodeMailerPayload(): Record<string, unknown> {
    const toAddresses = [this.calEvent.organizer.email];
    if (this.calEvent.team) {
      this.calEvent.team.members.forEach((member) => {
        const memberAttendee = this.calEvent.attendees.find((attendee) => attendee.name === member);
        if (memberAttendee) {
          toAddresses.push(memberAttendee.email);
        }
      });
    }

    return {
      from: `Cal.com <${this.getMailerOptions().from}>`,
      to: toAddresses.join(","),
      subject: `[Action Required] ${this.t("confirmed_event_type_subject", {
        eventType: this.calEvent.type,
        name: this.calEvent.attendees[0].name,
        date: this.getFormattedDate(),
      })}`,
      html: renderEmail("BrokenIntegrationEmail", {
        calEvent: this.calEvent,
        attendee: this.calEvent.organizer,
        type: this.type,
      }),
      text: this.getTextBody(),
    };
  }

  protected getTextBody(
    title = "",
    subtitle = "emailed_you_and_any_other_attendees",
    extraInfo = "",
    callToAction = ""
  ): string {
    return `
${this.t(
  title || this.calEvent.recurringEvent?.count ? "new_event_scheduled_recurring" : "new_event_scheduled"
)}
${this.t(subtitle)}
${extraInfo}
${getRichDescription(this.calEvent)}
${callToAction}
`.trim();
  }

  protected getTimezone(): string {
    return this.calEvent.organizer.timeZone;
  }

  protected getOrganizerStart(format: string) {
    return this.getRecipientTime(this.calEvent.startTime, format);
  }

  protected getOrganizerEnd(format: string) {
    return this.getRecipientTime(this.calEvent.endTime, format);
  }

  protected getFormattedDate() {
    return `${this.getOrganizerStart("h:mma")} - ${this.getOrganizerEnd("h:mma")}, ${this.t(
      this.getOrganizerStart("dddd").toLowerCase()
    )}, ${this.t(this.getOrganizerStart("MMMM").toLowerCase())} ${this.getOrganizerStart("D, YYYY")}`;
  }
}

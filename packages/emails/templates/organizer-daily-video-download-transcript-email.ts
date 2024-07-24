import type { TFunction } from "next-i18next";

import { EMAIL_FROM_NAME } from "@calcom/lib/constants";
import { TimeFormat } from "@calcom/lib/timeFormat";
import type { CalendarEvent } from "@calcom/types/Calendar";

import { renderEmail } from "..";
import BaseEmail from "./_base-email";

export default class OrganizerDailyVideoDownloadTranscriptEmail extends BaseEmail {
  calEvent: CalendarEvent;
  transcriptDownloadLinks: Array<string>;
  t: TFunction;

  constructor(calEvent: CalendarEvent, transcriptDownloadLinks: string[]) {
    super();
    this.name = "SEND_TRANSCRIPT_DOWNLOAD_LINK";
    this.calEvent = calEvent;
    this.transcriptDownloadLinks = transcriptDownloadLinks;
    this.t = this.calEvent.organizer.language.translate;
  }
  protected async getNodeMailerPayload(): Promise<Record<string, unknown>> {
    return {
      to: `${this.calEvent.organizer.email}>`,
      from: `${EMAIL_FROM_NAME} <${this.getMailerOptions().from}>`,
      replyTo: [...this.calEvent.attendees.map(({ email }) => email), this.calEvent.organizer.email],
      subject: `${this.t("download_transcript_email_subject", {
        title: this.calEvent.title,
        date: this.getFormattedDate(),
      })}`,
      html: await renderEmail("DailyVideoDownloadTranscriptEmail", {
        title: this.calEvent.title,
        date: this.getFormattedDate(),
        transcriptDownloadLinks: this.transcriptDownloadLinks,
        language: this.t,
        name: this.calEvent.organizer.name,
      }),
    };
  }

  protected getTimezone(): string {
    return this.calEvent.organizer.timeZone;
  }

  protected getOrganizerStart(format: string) {
    return this.getFormattedRecipientTime({ time: this.calEvent.startTime, format });
  }

  protected getOrganizerEnd(format: string) {
    return this.getFormattedRecipientTime({ time: this.calEvent.endTime, format });
  }

  protected getLocale(): string {
    return this.calEvent.organizer.language.locale;
  }

  protected getFormattedDate() {
    const organizerTimeFormat = this.calEvent.organizer.timeFormat || TimeFormat.TWELVE_HOUR;

    return `${this.getOrganizerStart(organizerTimeFormat)} - ${this.getOrganizerEnd(
      organizerTimeFormat
    )}, ${this.t(this.getOrganizerStart("dddd").toLowerCase())}, ${this.t(
      this.getOrganizerStart("MMMM").toLowerCase()
    )} ${this.getOrganizerStart("D, YYYY")}`;
  }
}

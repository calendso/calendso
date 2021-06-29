import dayjs, { Dayjs } from "dayjs";
import EventMail from "./EventMail";

import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { EmailTemplateType } from "@prisma/client";
import { eventPlaceholders } from "../event";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);

export default class EventAttendeeMail extends EventMail {
  /**
   * Returns the email text as HTML representation.
   *
   * @protected
   */
  protected getHtmlRepresentation(): string {
    const template = this.emailTemplates.find((e) => e.type == EmailTemplateType.ATTENDEE);
    if (template) {
      let body = template.body;
      eventPlaceholders.forEach((placeholder) => {
        body = body.split(placeholder.variable).join(placeholder.getValue(this.calEvent, this.uid));
      });
      return body;
    }
    return this.getDefaultHtmlRepresentation();
  }

  protected getSubject(): string {
    const template = this.emailTemplates.find((e) => e.type == EmailTemplateType.ATTENDEE);
    if (template) {
      let subject = template.subject;
      eventPlaceholders.forEach((placeholder) => {
        subject = subject.split(placeholder.variable).join(placeholder.getValue(this.calEvent, this.uid));
      });
      return subject;
    }
    return this.getDefaultSubject();
  }

  protected getDefaultHtmlRepresentation(): string {
    return (
      `
    <div>
      Hi ${this.calEvent.attendees[0].name},<br />
      <br />
      Your ${this.calEvent.type} with ${this.calEvent.organizer.name} at ${this.getInviteeStart().format(
        "h:mma"
      )} 
      (${this.calEvent.attendees[0].timeZone}) on ${this.getInviteeStart().format(
        "dddd, LL"
      )} is scheduled.<br />
      <br />` +
      this.getAdditionalBody() +
      (this.calEvent.location ? `<strong>Location:</strong> ${this.calEvent.location}<br /><br />` : "") +
      `<strong>Additional notes:</strong><br />
      ${this.calEvent.description}<br />
      ` +
      this.getAdditionalFooter() +
      `
    </div>
  `
    );
  }

  private getDefaultSubject() {
    return `Confirmed: ${this.calEvent.type} with ${
      this.calEvent.organizer.name
    } on ${this.getInviteeStart().format("dddd, LL")}`;
  }

  /**
   * Returns the payload object for the nodemailer.
   *
   * @protected
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  protected getNodeMailerPayload(): Object {
    return {
      to: `${this.calEvent.attendees[0].name} <${this.calEvent.attendees[0].email}>`,
      from: `${this.calEvent.organizer.name} <${this.getMailerOptions().from}>`,
      replyTo: this.calEvent.organizer.email,
      subject: this.getSubject(),
      html: this.getHtmlRepresentation(),
      text: this.getPlainTextRepresentation(),
    };
  }

  protected printNodeMailerError(error: string): void {
    console.error("SEND_BOOKING_CONFIRMATION_ERROR", this.calEvent.attendees[0].email, error);
  }

  /**
   * Returns the inviteeStart value used at multiple points.
   *
   * @private
   */
  protected getInviteeStart(): Dayjs {
    return <Dayjs>dayjs(this.calEvent.startTime).tz(this.calEvent.attendees[0].timeZone);
  }
}

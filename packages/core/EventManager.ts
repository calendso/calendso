import { Credential, DestinationCalendar } from "@prisma/client";
import async from "async";
import merge from "lodash/merge";
import { v5 as uuidv5 } from "uuid";

import { FAKE_DAILY_CREDENTIAL } from "@calcom/app-store/dailyvideo/lib/VideoApiAdapter";
import getApps from "@calcom/app-store/utils";
import prisma from "@calcom/prisma";
import type { AdditionalInformation, CalendarEvent, NewCalendarEventType } from "@calcom/types/Calendar";
import type { Event } from "@calcom/types/Event";
import type {
  CreateUpdateResult,
  EventResult,
  PartialBooking,
  PartialReference,
} from "@calcom/types/EventManager";

import { createEvent, updateEvent } from "./CalendarManager";
import { LocationType } from "./location";
import { createMeeting, updateMeeting } from "./videoClient";

export const isZoom = (location: string): boolean => {
  return location === "integrations:zoom";
};

export const isDaily = (location: string): boolean => {
  return location === "integrations:daily";
};

export const isHuddle01 = (location: string): boolean => {
  return location === "integrations:huddle01";
};

export const isTandem = (location: string): boolean => {
  return location === "integrations:tandem";
};

export const isTeams = (location: string): boolean => {
  return location === "integrations:office365_video";
};

export const isJitsi = (location: string): boolean => {
  return location === "integrations:jitsi";
};

export const isDedicatedIntegration = (location: string): boolean => {
  return (
    isZoom(location) ||
    isDaily(location) ||
    isHuddle01(location) ||
    isTandem(location) ||
    isJitsi(location) ||
    isTeams(location)
  );
};

export const getLocationRequestFromIntegration = (location: string) => {
  if (
    /** TODO: Handle this dynamically */
    location === LocationType.GoogleMeet.valueOf() ||
    location === LocationType.Zoom.valueOf() ||
    location === LocationType.Daily.valueOf() ||
    location === LocationType.Jitsi.valueOf() ||
    location === LocationType.Huddle01.valueOf() ||
    location === LocationType.Tandem.valueOf() ||
    location === LocationType.Teams.valueOf()
  ) {
    const requestId = uuidv5(location, uuidv5.URL);

    return {
      conferenceData: {
        createRequest: {
          requestId: requestId,
        },
      },
      location,
    };
  }

  return null;
};

export const processLocation = (event: CalendarEvent): CalendarEvent => {
  // If location is set to an integration location
  // Build proper transforms for evt object
  // Extend evt object with those transformations
  if (event.location?.includes("integration")) {
    const maybeLocationRequestObject = getLocationRequestFromIntegration(event.location);

    event = merge(event, maybeLocationRequestObject);
  }

  return event;
};

type EventManagerUser = {
  credentials: Credential[];
  destinationCalendar: DestinationCalendar | null;
};

export default class EventManager {
  calendarCredentials: Credential[];
  videoCredentials: Credential[];

  /**
   * Takes an array of credentials and initializes a new instance of the EventManager.
   *
   * @param user
   */
  constructor(user: EventManagerUser) {
    const appCredentials = getApps(user.credentials).flatMap((app) => app.credentials);
    this.calendarCredentials = appCredentials.filter((cred) => cred.type.endsWith("_calendar"));
    this.videoCredentials = appCredentials.filter((cred) => cred.type.endsWith("_video"));
  }

  /**
   * Takes a CalendarEvent and creates all necessary integration entries for it.
   * When a video integration is chosen as the event's location, a video integration
   * event will be scheduled for it as well.
   *
   * @param event
   */
  public async create(event: CalendarEvent): Promise<CreateUpdateResult> {
    const evt = processLocation(event);
    const isDedicated = evt.location ? isDedicatedIntegration(evt.location) : null;

    const results: Array<EventResult<Exclude<Event, AdditionalInformation>>> = [];
    // If and only if event type is a dedicated meeting, create a dedicated video meeting.
    if (isDedicated) {
      const result = await this.createVideoEvent(evt);
      if (result.createdEvent) {
        evt.videoCallData = result.createdEvent;
      }

      results.push(result);
    }

    // Create the calendar event with the proper video call data
    results.push(...(await this.createAllCalendarEvents(evt)));

    const referencesToCreate = results.map((result) => {
      return {
        type: result.type,
        uid: result.createdEvent?.id?.toString() ?? "",
        meetingId: result.createdEvent?.id?.toString(),
        meetingPassword: result.createdEvent?.password,
        meetingUrl: result.createdEvent?.url,
        externalCalendarId: evt.destinationCalendar?.externalId,
        credentialId: evt.destinationCalendar?.credentialId,
      };
    });

    return {
      results,
      referencesToCreate,
    };
  }

  public async updateLocation(event: CalendarEvent, booking: PartialBooking): Promise<CreateUpdateResult> {
    const evt = processLocation(event);
    const isDedicated = evt.location ? isDedicatedIntegration(evt.location) : null;

    const results: Array<EventResult<Exclude<Event, AdditionalInformation>>> = [];
    // If and only if event type is a dedicated meeting, create a dedicated video meeting.
    if (isDedicated) {
      const result = await this.createVideoEvent(evt);
      if (result.createdEvent) {
        evt.videoCallData = result.createdEvent;
      }

      results.push(result);
    }

    // Update the calendar event with the proper video call data
    const calendarReference = booking.references.find((reference) => reference.type.includes("_calendar"));
    if (calendarReference) {
      results.push(...(await this.updateAllCalendarEvents(evt, booking)));
    }

    const referencesToCreate = results.map((result) => {
      return {
        type: result.type,
        uid: result.createdEvent?.id?.toString() ?? "",
        meetingId: result.createdEvent?.id?.toString(),
        meetingPassword: result.createdEvent?.password,
        meetingUrl: result.createdEvent?.url,
        externalCalendarId: evt.destinationCalendar?.externalId,
        credentialId: evt.destinationCalendar?.credentialId,
      };
    });

    return {
      results,
      referencesToCreate,
    };
  }

  /**
   * Takes a calendarEvent and a rescheduleUid and updates the event that has the
   * given uid using the data delivered in the given CalendarEvent.
   *
   * @param event
   */
  public async reschedule(
    event: CalendarEvent,
    rescheduleUid: string,
    newBookingId?: number,
    rescheduleReason?: string
  ): Promise<CreateUpdateResult> {
    const evt = processLocation(event);

    if (!rescheduleUid) {
      throw new Error("You called eventManager.update without an `rescheduleUid`. This should never happen.");
    }

    // Get details of existing booking.
    const booking = await prisma.booking.findFirst({
      where: {
        uid: rescheduleUid,
      },
      select: {
        id: true,
        userId: true,
        references: {
          // NOTE: id field removed from select as we don't require for deletingMany
          // but was giving error on recreate for reschedule, probably because promise.all() didn't finished
          select: {
            type: true,
            uid: true,
            meetingId: true,
            meetingPassword: true,
            meetingUrl: true,
            externalCalendarId: true,
            credentialId: true,
          },
        },
        destinationCalendar: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new Error("booking not found");
    }

    // Add reschedule reason to new booking
    await prisma.booking.update({
      where: {
        id: newBookingId,
      },
      data: {
        cancellationReason: rescheduleReason,
      },
    });

    const isDedicated = evt.location ? isDedicatedIntegration(evt.location) : null;
    const results: Array<EventResult<Event>> = [];
    // If and only if event type is a dedicated meeting, update the dedicated video meeting.
    if (isDedicated) {
      const result = await this.updateVideoEvent(evt, booking);
      const [updatedEvent] = Array.isArray(result.updatedEvent) ? result.updatedEvent : [result.updatedEvent];
      if (updatedEvent) {
        evt.videoCallData = updatedEvent;
        evt.location = updatedEvent.url;
      }
      results.push(result);
    }

    // Update all calendar events.
    results.push(...(await this.updateAllCalendarEvents(evt, booking)));

    const bookingPayment = booking?.payment;

    // Updating all payment to new
    if (bookingPayment && newBookingId) {
      const paymentIds = bookingPayment.map((payment) => payment.id);
      await prisma.payment.updateMany({
        where: {
          id: {
            in: paymentIds,
          },
        },
        data: {
          bookingId: newBookingId,
        },
      });
    }

    // Now we can delete the old booking and its references.
    const bookingReferenceDeletes = prisma.bookingReference.deleteMany({
      where: {
        bookingId: booking.id,
      },
    });
    const attendeeDeletes = prisma.attendee.deleteMany({
      where: {
        bookingId: booking.id,
      },
    });

    const bookingDeletes = prisma.booking.delete({
      where: {
        id: booking.id,
      },
    });

    // Wait for all deletions to be applied.
    await Promise.all([bookingReferenceDeletes, attendeeDeletes, bookingDeletes]);

    return {
      results,
      referencesToCreate: [...booking.references],
    };
  }

  public async updateCalendarAttendees(event: CalendarEvent, booking: PartialBooking) {
    await this.updateAllCalendarEvents(event, booking);
  }

  /**
   * Creates event entries for all calendar integrations given in the credentials.
   * When noMail is true, no mails will be sent. This is used when the event is
   * a video meeting because then the mail containing the video credentials will be
   * more important than the mails created for these bare calendar events.
   *
   * When the optional uid is set, it will be used instead of the auto generated uid.
   *
   * @param event
   * @param noMail
   * @private
   */
  private async createAllCalendarEvents(event: CalendarEvent) {
    /** Can I use destinationCalendar here? */
    /* How can I link a DC to a cred? */
    if (event.destinationCalendar) {
      if (event.destinationCalendar.credentialId) {
        const credential = await prisma.credential.findFirst({
          where: {
            id: event.destinationCalendar.credentialId,
          },
        });

        if (credential) {
          return [await createEvent(credential, event)];
        }
      }

      const destinationCalendarCredentials = this.calendarCredentials.filter(
        (c) => c.type === event.destinationCalendar?.integration
      );
      return Promise.all(destinationCalendarCredentials.map(async (c) => await createEvent(c, event)));
    }

    /**
     *  Not ideal but, if we don't find a destination calendar,
     * fallback to the first connected calendar
     */
    const [credential] = this.calendarCredentials;
    if (!credential) {
      return [];
    }
    return [await createEvent(credential, event)];
  }

  /**
   * Checks which video integration is needed for the event's location and returns
   * credentials for that - if existing.
   * @param event
   * @private
   */

  private getVideoCredential(event: CalendarEvent): Credential | undefined {
    if (!event.location) {
      return undefined;
    }

    /** @fixme potential bug since Google Meet are saved as `integrations:google:meet` and there are no `google:meet` type in our DB */
    const integrationName = event.location.replace("integrations:", "");

    let videoCredential = this.videoCredentials
      // Whenever a new video connection is added, latest credentials are added with the highest ID.
      // Because you can't rely on having them in the higgest first order here, ensure this by sorting in DESC order
      .sort((a, b) => {
        return b.id - a.id;
      })
      .find((credential: Credential) => credential.type.includes(integrationName));

    /**
     * This might happen if someone tries to use a location with a missing credential, so we fallback to Cal Video.
     * @todo remove location from event types that has missing credentials
     * */
    if (!videoCredential) videoCredential = FAKE_DAILY_CREDENTIAL;

    return videoCredential;
  }

  /**
   * Creates a video event entry for the selected integration location.
   *
   * When optional uid is set, it will be used instead of the auto generated uid.
   *
   * @param event
   * @private
   */
  private createVideoEvent(event: CalendarEvent) {
    const credential = this.getVideoCredential(event);

    if (credential) {
      return createMeeting(credential, event);
    } else {
      return Promise.reject(
        `No suitable credentials given for the requested integration name:${event.location}`
      );
    }
  }

  /**
   * Updates the event entries for all calendar integrations given in the credentials.
   * When noMail is true, no mails will be sent. This is used when the event is
   * a video meeting because then the mail containing the video credentials will be
   * more important than the mails created for these bare calendar events.
   *
   * @param event
   * @param booking
   * @private
   */
  private updateAllCalendarEvents(
    event: CalendarEvent,
    booking: PartialBooking
  ): Promise<Array<EventResult<NewCalendarEventType>>> {
    let calendarReference: PartialReference | undefined = undefined,
      credential;
    try {
      // Bookings should only have one calendar reference
      calendarReference = booking.references.filter((reference) => reference.type.includes("_calendar"))[0];
      if (!calendarReference) throw new Error("bookingRef");

      const { uid: bookingRefUid, externalCalendarId: bookingExternalCalendarId } = calendarReference;

      if (!bookingExternalCalendarId) throw new Error("externalCalendarId");

      const result = [];
      if (calendarReference.credentialId) {
        credential = this.calendarCredentials.filter(
          (credential) => credential.id === calendarReference?.credentialId
        )[0];
        result.push(updateEvent(credential, event, bookingRefUid, bookingExternalCalendarId));
      } else {
        const credentials = this.calendarCredentials.filter(
          (credential) => credential.type === calendarReference?.type
        );
        for (const credential of credentials) {
          result.push(updateEvent(credential, event, bookingRefUid, bookingExternalCalendarId));
        }
      }

      return Promise.all(result);
    } catch (error) {
      let message = `Tried to 'updateAllCalendarEvents' but there was no '{thing}' for '${credential?.type}', userId: '${credential?.userId}', bookingId: '${booking?.id}'`;
      if (error instanceof Error) message = message.replace("{thing}", error.message);
      console.error(message);
      return Promise.resolve([
        {
          type: calendarReference?.type || "calendar",
          success: false,
          uid: "",
          originalEvent: event,
        },
      ]);
    }
  }

  /**
   * Updates a single video event.
   *
   * @param event
   * @param booking
   * @private
   */
  private updateVideoEvent(event: CalendarEvent, booking: PartialBooking) {
    const credential = this.getVideoCredential(event);

    if (credential) {
      const bookingRef = booking ? booking.references.filter((ref) => ref.type === credential.type)[0] : null;
      return updateMeeting(credential, event, bookingRef);
    } else {
      return Promise.reject(
        `No suitable credentials given for the requested integration name:${event.location}`
      );
    }
  }

  /**
   * Update event to set a cancelled event placeholder on users calendar
   * remove if virtual calendar is already done and user availability its read from there
   * and not only in their calendars
   * @param event
   * @param booking
   * @public
   */
  public async updateAndSetCancelledPlaceholder(event: CalendarEvent, booking: PartialBooking) {
    await this.updateAllCalendarEvents(event, booking);
  }
}

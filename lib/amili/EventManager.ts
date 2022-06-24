/* eslint-disable @typescript-eslint/no-explicit-any */
import { CalendarEvent } from "@lib/calendarClient";
import { Credential } from "@prisma/client";
import { getLocationRequestFromIntegration } from "pages/api/book/[user]";
import _merge from "lodash.merge";
import { createMeeting } from "./videoClient";
import { createEvent } from "./calendarService";
import { createEvent as createEventGoogle } from "./googleCalendarService";

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

export interface PartialReference {
  id?: number;
  type: string;
  uid: string;
  meetingId?: string | null;
  meetingPassword?: string | null;
  meetingUrl?: string | null;
}

export interface EventResult {
  type: string;
  success: boolean;
  uid: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdEvent?: any;
  updatedEvent?: any;
  originalEvent: CalendarEvent;
}

export interface CreateUpdateResult {
  results: Array<EventResult>;
  referencesToCreate: Array<PartialReference>;
}

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

export const processLocation = (event: CalendarEvent): CalendarEvent => {
  // If location is set to an integration location
  // Build proper transforms for evt object
  // Extend evt object with those transformations
  if (event.location?.includes("integration")) {
    const maybeLocationRequestObject = getLocationRequestFromIntegration({ location: event.location });

    event = _merge(event, maybeLocationRequestObject);
  }

  return event;
};

export type DestinationCalendar = {
  id: number;
  integration: string;
  externalId: string;
  userId: number | null;
  bookingId: number | null;
  eventTypeId: number | null;
};

type EventManagerUser = {
  credentials: Credential[];
  destinationCalendar: DestinationCalendar | null;
};

export interface PartialReference {
  id?: number;
  type: string;
  uid: string;
  meetingId?: string | null;
  meetingPassword?: string | null;
  meetingUrl?: string | null;
}

export interface PartialBooking {
  id: number;
  references: Array<PartialReference>;
}

export default class EventManager {
  calendarCredentials: Credential[];
  videoCredentials: Credential[];

  /**
   * Takes an array of credentials and initializes a new instance of the EventManager.
   *
   * @param user
   */
  constructor(evt: EventManagerUser) {
    const appCredentials = evt.credentials;
    this.calendarCredentials = appCredentials.filter((cred) => cred.type.endsWith("_calendar"));
    this.videoCredentials = appCredentials.filter((cred) => cred.type.endsWith("_video"));
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

    const integrationName = event.location.replace("integrations:", "");

    return this.videoCredentials.find((credential: Credential) => credential.type.includes(integrationName));
  }

  /**
   * Creates a video event entry for the selected integration location.
   *
   * When optional uid is set, it will be used instead of the auto generated uid.
   *
   * @param event
   * @private
   */
  private createVideoEvent(event: CalendarEvent): Promise<any> {
    const credential = this.getVideoCredential(event);

    if (credential) {
      return createMeeting(credential, event);
    } else {
      return Promise.reject(
        `No suitable credentials given for the requested integration name:${event.location}`
      );
    }
  }

  private async createAllCalendarEvents(event: CalendarEvent): Promise<Array<EventResult>> {
    /** Can I use destinationCalendar here? */
    /* How can I link a DC to a cred? */
    if (event.destinationCalendar) {
      const destinationCalendarCredentials = this.calendarCredentials.filter(
        (c) => c.type === event.destinationCalendar?.integration
      );
      return Promise.all(
        destinationCalendarCredentials.map(async (c) => {
          const type = c.type;
          if (type === "office365_calendar") {
            return await createEvent(c, event);
          } else {
            return await createEventGoogle(c, event);
          }
        })
      );
    }

    /**
     *  Not ideal but, if we don't find a destination calendar,
     * fallback to the first connected calendar
     */
    const credentials = this.calendarCredentials;
    if (credentials.length === 0) {
      return [];
    }
    return Promise.all(
      credentials.map(async (c) => {
        const type = c.type;
        if (type === "office365_calendar") {
          return await createEvent(c, event);
        } else {
          return await createEventGoogle(c, event);
        }
      })
    );
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

    console.log("isDedicated", isDedicated);

    const results: EventResult[] = [];

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

    const referencesToCreate: Array<PartialReference> = results.map((result: EventResult) => {
      return {
        type: result.type,
        uid: result.createdEvent?.id?.toString() ?? "",
        meetingId: result.createdEvent?.id.toString(),
        meetingPassword: result.createdEvent?.password,
        meetingUrl: result.createdEvent?.url,
      };
    });

    return {
      results,
      referencesToCreate,
    };
  }
}

import { BookingsRepository_2024_08_13 } from "@/ee/bookings/2024-08-13/bookings.repository";
import { bookingResponsesSchema } from "@/ee/bookings/2024-08-13/services/output.service";
import { EventTypesRepository_2024_06_14 } from "@/ee/event-types/event-types_2024_06_14/event-types.repository";
import { OAuthClientRepository } from "@/modules/oauth-clients/oauth-client.repository";
import { OAuthFlowService } from "@/modules/oauth-clients/services/oauth-flow.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { Request } from "express";
import { DateTime } from "luxon";
import { NextApiRequest } from "next/types";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

import { X_CAL_CLIENT_ID } from "@calcom/platform-constants";
import {
  CreateBookingInput_2024_08_13,
  CreateInstantBookingInput_2024_08_13,
  CreateRecurringBookingInput_2024_08_13,
  GetBookingsInput_2024_08_13,
  RescheduleBookingInput_2024_08_13,
} from "@calcom/platform-types";

type BookingRequest = NextApiRequest & { userId: number | undefined } & OAuthRequestParams;

const DEFAULT_PLATFORM_PARAMS = {
  platformClientId: "",
  platformCancelUrl: "",
  platformRescheduleUrl: "",
  platformBookingUrl: "",
  arePlatformEmailsEnabled: false,
  platformBookingLocation: undefined,
};

type OAuthRequestParams = {
  platformClientId: string;
  platformRescheduleUrl: string;
  platformCancelUrl: string;
  platformBookingUrl: string;
  platformBookingLocation?: string;
  arePlatformEmailsEnabled: boolean;
};

export enum Frequency {
  "YEARLY",
  "MONTHLY",
  "WEEKLY",
  "DAILY",
  "HOURLY",
  "MINUTELY",
  "SECONDLY",
}

const recurringEventSchema = z.object({
  dtstart: z.string().optional(),
  interval: z.number().int().optional(),
  count: z.number().int().optional(),
  freq: z.nativeEnum(Frequency).optional(),
  until: z.string().optional(),
});

@Injectable()
export class InputBookingsService_2024_08_13 {
  private readonly logger = new Logger("InputBookingsService_2024_08_13");

  constructor(
    private readonly oAuthFlowService: OAuthFlowService,
    private readonly oAuthClientRepository: OAuthClientRepository,
    private readonly eventTypesRepository: EventTypesRepository_2024_06_14,
    private readonly bookingsRepository: BookingsRepository_2024_08_13
  ) {}

  async createNonRecurringBookingRequest(
    request: Request,
    body:
      | CreateBookingInput_2024_08_13
      | RescheduleBookingInput_2024_08_13
      | CreateInstantBookingInput_2024_08_13
  ): Promise<BookingRequest> {
    const bodyTransformed = await this.transformInputCreate(body);
    const oAuthClientId = request.get(X_CAL_CLIENT_ID);

    const newRequest = { ...request };
    const userId = (await this.createBookingRequestOwnerId(request)) ?? undefined;
    const oAuthParams = oAuthClientId
      ? await this.createBookingRequestOAuthClientParams(oAuthClientId)
      : DEFAULT_PLATFORM_PARAMS;

    const location = await this.getLocation(request, body);
    Object.assign(newRequest, { userId, ...oAuthParams, platformBookingLocation: location });

    newRequest.body = { ...bodyTransformed, noEmail: !oAuthParams.arePlatformEmailsEnabled };

    return newRequest as unknown as BookingRequest;
  }

  async createRecurringBookingRequest(
    request: Request,
    body: CreateRecurringBookingInput_2024_08_13
  ): Promise<BookingRequest> {
    // note(Lauris): update to this.transformInputCreate when rescheduling is implemented
    const bodyTransformed = await this.transformInputCreateRecurringBooking(body);
    const oAuthClientId = request.get(X_CAL_CLIENT_ID);

    const newRequest = { ...request };
    const userId = (await this.createBookingRequestOwnerId(request)) ?? undefined;
    const oAuthParams = oAuthClientId
      ? await this.createBookingRequestOAuthClientParams(oAuthClientId)
      : DEFAULT_PLATFORM_PARAMS;

    const location = await this.getLocation(request, body);
    Object.assign(newRequest, { userId, ...oAuthParams, platformBookingLocation: location });

    newRequest.body = (bodyTransformed as any[]).map((event) => ({
      ...event,
      noEmail: !oAuthParams.arePlatformEmailsEnabled,
    }));

    return newRequest as unknown as BookingRequest;
  }

  private async createBookingRequestOwnerId(req: Request): Promise<number | undefined> {
    try {
      const accessToken = req.get("Authorization")?.replace("Bearer ", "");
      if (accessToken) {
        return this.oAuthFlowService.getOwnerId(accessToken);
      }
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async createBookingRequestOAuthClientParams(clientId: string) {
    const params = DEFAULT_PLATFORM_PARAMS;
    try {
      const client = await this.oAuthClientRepository.getOAuthClient(clientId);
      if (client) {
        params.platformClientId = clientId;
        params.platformCancelUrl = client.bookingCancelRedirectUri ?? "";
        params.platformRescheduleUrl = client.bookingRescheduleRedirectUri ?? "";
        params.platformBookingUrl = client.bookingRedirectUri ?? "";
        params.arePlatformEmailsEnabled = client.areEmailsEnabled ?? false;
      }
      return params;
    } catch (err) {
      this.logger.error(err);
      return params;
    }
  }

  transformInputCreate(inputBooking: CreateBookingInput_2024_08_13 | RescheduleBookingInput_2024_08_13) {
    if ("rescheduleBookingUid" in inputBooking) {
      return this.transformInputRescheduleBooking(inputBooking);
    }

    return this.transformInputCreateBooking(inputBooking);
  }

  async transformInputCreateRecurringBooking(inputBooking: CreateRecurringBookingInput_2024_08_13) {
    const eventType = await this.eventTypesRepository.getEventTypeByIdWithOwnerAndTeam(
      inputBooking.eventTypeId
    );
    if (!eventType) {
      throw new NotFoundException(`Event type with id=${inputBooking.eventTypeId} not found`);
    }
    if (!eventType.recurringEvent) {
      throw new NotFoundException(`Event type with id=${inputBooking.eventTypeId} is not a recurring event`);
    }

    const occurrance = recurringEventSchema.parse(eventType.recurringEvent);
    const repeatsEvery = occurrance.interval;
    const repeatsTimes = occurrance.count;
    // note(Lauris): timeBetween 0=yearly, 1=monthly and 2=weekly
    const timeBetween = occurrance.freq;

    if (!repeatsTimes) {
      throw new Error("Repeats times is required");
    }

    const events = [];
    const recurringEventId = uuidv4();

    let startTime = DateTime.fromISO(inputBooking.start, { zone: "utc" }).setZone(
      inputBooking.attendee.timeZone
    );

    for (let i = 0; i < repeatsTimes; i++) {
      const endTime = startTime.plus({ minutes: eventType.length });

      events.push({
        start: startTime.toISO(),
        end: endTime.toISO(),
        eventTypeId: inputBooking.eventTypeId,
        eventTypeSlug: eventType.slug,
        recurringEventId,
        timeZone: inputBooking.attendee.timeZone,
        language: inputBooking.attendee.language || "en",
        metadata: inputBooking.metadata || {},
        hasHashedBookingLink: false,
        guests: inputBooking.guests,
        responses: inputBooking.bookingFieldsResponses
          ? {
              ...inputBooking.bookingFieldsResponses,
              name: inputBooking.attendee.name,
              email: inputBooking.attendee.email,
            }
          : { name: inputBooking.attendee.name, email: inputBooking.attendee.email },
        user: eventType.owner ? eventType.owner.username : eventType.team?.slug,
        schedulingType: eventType.schedulingType,
      });

      switch (timeBetween) {
        case 0: // Yearly
          startTime = startTime.plus({ years: repeatsEvery });
          break;
        case 1: // Monthly
          startTime = startTime.plus({ months: repeatsEvery });
          break;
        case 2: // Weekly
          startTime = startTime.plus({ weeks: repeatsEvery });
          break;
        default:
          throw new Error("Unsupported timeBetween value");
      }
    }

    return events;
  }

  async transformInputCreateBooking(inputBooking: CreateBookingInput_2024_08_13) {
    const eventType = await this.eventTypesRepository.getEventTypeByIdWithOwnerAndTeam(
      inputBooking.eventTypeId
    );
    if (!eventType) {
      throw new NotFoundException(`Event type with id=${inputBooking.eventTypeId} not found`);
    }

    const startTime = DateTime.fromISO(inputBooking.start, { zone: "utc" }).setZone(
      inputBooking.attendee.timeZone
    );
    const endTime = startTime.plus({ minutes: eventType.length });

    return {
      start: startTime.toISO(),
      end: endTime.toISO(),
      eventTypeId: inputBooking.eventTypeId,
      eventTypeSlug: eventType.slug,
      timeZone: inputBooking.attendee.timeZone,
      language: inputBooking.attendee.language || "en",
      metadata: inputBooking.metadata || {},
      hasHashedBookingLink: false,
      guests: inputBooking.guests,
      responses: inputBooking.bookingFieldsResponses
        ? {
            ...inputBooking.bookingFieldsResponses,
            name: inputBooking.attendee.name,
            email: inputBooking.attendee.email,
          }
        : { name: inputBooking.attendee.name, email: inputBooking.attendee.email },
      user: eventType.owner ? eventType.owner.username : eventType.team?.slug,
    };
  }

  async getLocation(
    request: Request,
    body:
      | CreateBookingInput_2024_08_13
      | RescheduleBookingInput_2024_08_13
      | CreateRecurringBookingInput_2024_08_13
  ) {
    if ("rescheduleBookingUid" in body) {
      const booking = await this.bookingsRepository.getByUid(body.rescheduleBookingUid);
      if (!booking) {
        throw new NotFoundException(`Booking with uid=${body.rescheduleBookingUid} not found`);
      }
      return booking.location;
    }

    return request.body.meetingUrl;
  }

  async transformInputRescheduleBooking(inputBooking: RescheduleBookingInput_2024_08_13) {
    const booking = await this.bookingsRepository.getByUidWithAttendees(inputBooking.rescheduleBookingUid);
    if (!booking) {
      throw new NotFoundException(`Booking with uid=${inputBooking.rescheduleBookingUid} not found`);
    }
    if (!booking.eventTypeId) {
      throw new NotFoundException(
        `Booking with uid=${inputBooking.rescheduleBookingUid} is missing event type`
      );
    }
    const eventType = await this.eventTypesRepository.getEventTypeByIdWithOwnerAndTeam(booking.eventTypeId);
    if (!eventType) {
      throw new NotFoundException(`Event type with id=${booking.eventTypeId} not found`);
    }

    const bookingResponses = bookingResponsesSchema.parse(booking.responses);
    const attendee = booking.attendees.find((attendee) => attendee.email === bookingResponses.email);

    if (!attendee) {
      throw new NotFoundException(
        `Attendee with e-mail ${bookingResponses.email} for booking with uid=${inputBooking.rescheduleBookingUid} not found`
      );
    }

    const startTime = DateTime.fromISO(inputBooking.start, { zone: "utc" }).setZone(attendee.timeZone);
    const endTime = startTime.plus({ minutes: eventType.length });

    return {
      start: startTime.toISO(),
      end: endTime.toISO(),
      eventTypeId: eventType.id,
      eventTypeSlug: eventType.slug,
      timeZone: attendee.timeZone,
      language: attendee.locale,
      metadata: booking.metadata || {},
      hasHashedBookingLink: false,
      guests: bookingResponses.guests,
      responses: bookingResponses,
      user: eventType.owner ? eventType.owner.username : eventType.team?.slug,
    };
  }

  transformGetBookingsFilters(queryParams: GetBookingsInput_2024_08_13) {
    return {
      attendeeEmail: queryParams.attendeeEmail,
      attendeeName: queryParams.attendeeName,
      afterStartDate: queryParams.afterStart,
      beforeEndDate: queryParams.beforeEnd,
      teamIds: queryParams.teamsIds || (queryParams.teamId ? [queryParams.teamId] : undefined),
      eventTypeIds:
        queryParams.eventTypeIds || (queryParams.eventTypeId ? [queryParams.eventTypeId] : undefined),
    };
  }

  transformGetBookingsSort(queryParams: GetBookingsInput_2024_08_13) {
    if (!queryParams.sortStart && !queryParams.sortEnd && !queryParams.sortCreated) {
      return undefined;
    }

    return {
      sortStart: queryParams.sortStart,
      sortEnd: queryParams.sortEnd,
      sortCreated: queryParams.sortCreated,
    };
  }
}

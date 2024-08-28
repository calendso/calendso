import { BookingsRepository_2024_08_13 } from "@/ee/bookings/2024-08-13/bookings.repository";
import { InputBookingsService_2024_08_13 } from "@/ee/bookings/2024-08-13/services/input.service";
import { OutputBookingsService_2024_08_13 } from "@/ee/bookings/2024-08-13/services/output.service";
import { EventTypesRepository_2024_06_14 } from "@/ee/event-types/event-types_2024_06_14/event-types.repository";
import { BillingService } from "@/modules/billing/services/billing.service";
import { PrismaReadService } from "@/modules/prisma/prisma-read.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";
import { Request } from "express";

import {
  handleNewBooking,
  handleNewRecurringBooking,
  getAllUserBookings,
  handleInstantMeeting,
  handleCancelBooking,
  handleMarkNoShow,
} from "@calcom/platform-libraries-1.2.3";
import {
  CreateBookingInput_2024_08_13,
  RescheduleBookingInput_2024_08_13,
  CreateBookingInput,
  CreateRecurringBookingInput_2024_08_13,
  GetBookingsInput_2024_08_13,
  CreateInstantBookingInput_2024_08_13,
  CancelBookingInput_2024_08_13,
  MarkAbsentBookingInput_2024_08_13,
} from "@calcom/platform-types";
import { PrismaClient } from "@calcom/prisma";
import { Booking } from "@calcom/prisma/client";

type BookingWithAttendeesAndEventType = Booking & {
  attendees: {
    name: string;
    email: string;
    timeZone: string;
    locale: string | null;
    noShow: boolean | null;
  }[];
  eventType: { id: number };
};

type CreatedBooking = {
  hostId: number;
  uid: string;
  start: string;
};

@Injectable()
export class BookingsService_2024_08_13 {
  constructor(
    private readonly inputService: InputBookingsService_2024_08_13,
    private readonly outputService: OutputBookingsService_2024_08_13,
    private readonly bookingsRepository: BookingsRepository_2024_08_13,
    private readonly eventTypesRepository: EventTypesRepository_2024_06_14,
    private readonly prismaReadService: PrismaReadService,
    private readonly billingService: BillingService
  ) {}

  async createBooking(request: Request, body: CreateBookingInput) {
    try {
      if ("instant" in body && body.instant) {
        return await this.createInstantBooking(request, body);
      }

      if (await this.isRecurring(body)) {
        return await this.createRecurringBooking(request, body);
      }

      return await this.createRegularBooking(request, body);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "no_available_users_found_error") {
          throw new BadRequestException("User either already has booking at this time or is not available");
        }
      }
      throw error;
    }
  }

  async createInstantBooking(request: Request, body: CreateInstantBookingInput_2024_08_13) {
    const bookingRequest = await this.inputService.createBookingRequest(request, body);
    const booking = await handleInstantMeeting(bookingRequest);

    const databaseBooking = await this.bookingsRepository.getByIdWithAttendees(booking.bookingId);
    if (!databaseBooking) {
      throw new Error(`Booking with id=${booking.bookingId} was not found in the database`);
    }

    return this.outputService.getOutputBooking(databaseBooking);
  }

  async isRecurring(body: CreateBookingInput) {
    const eventType = await this.eventTypesRepository.getEventTypeById(body.eventTypeId);
    return !!eventType?.recurringEvent;
  }

  async createRecurringBooking(request: Request, body: CreateRecurringBookingInput_2024_08_13) {
    const bookingRequest = await this.inputService.createRecurringBookingRequest(request, body);
    const bookings = await handleNewRecurringBooking(bookingRequest);
    const uid = bookings[0].recurringEventId;
    if (!uid) {
      throw new Error("Recurring booking was not created");
    }

    const recurringBooking = await this.bookingsRepository.getRecurringByUidWithAttendees(uid);
    return this.outputService.getOutputRecurringBookings(recurringBooking);
  }

  async createRegularBooking(request: Request, body: CreateBookingInput_2024_08_13) {
    const bookingRequest = await this.inputService.createBookingRequest(request, body);
    const booking = await handleNewBooking(bookingRequest);
    if (!booking.id) {
      throw new Error("Booking was not created");
    }

    const databaseBooking = await this.bookingsRepository.getByIdWithAttendees(booking.id);
    if (!databaseBooking) {
      throw new Error(`Booking with id=${booking.id} was not found in the database`);
    }

    return this.outputService.getOutputBooking(databaseBooking);
  }

  async getBooking(uid: string) {
    const booking = await this.bookingsRepository.getByUidWithAttendees(uid);

    if (booking) {
      const isRecurring = !!booking.recurringEventId;
      const isRescheduled = booking.rescheduled;
      if (isRescheduled) {
        const toReschedule = await this.bookingsRepository.getByFromReschedule(uid);
        if (!toReschedule) {
          throw new Error(`Booking with fromReschedule=${uid} was not found in the database`);
        }
        return this.outputService.getOutputRescheduledBooking(booking, toReschedule);
      }
      if (isRecurring) {
        return this.outputService.getOutputRecurringBooking(booking);
      }
      return this.outputService.getOutputBooking(booking);
    }

    const recurringBooking = await this.bookingsRepository.getRecurringByUidWithAttendees(uid);
    if (!recurringBooking.length) {
      throw new NotFoundException(`Booking with uid=${uid} was not found in the database`);
    }

    return this.outputService.getOutputRecurringBookings(recurringBooking);
  }

  async getBookings(queryParams: GetBookingsInput_2024_08_13, user: { email: string; id: number }) {
    const fetchedBookings: { bookings: BookingWithAttendeesAndEventType[] } = await getAllUserBookings({
      bookingListingByStatus: queryParams.status || [],
      skip: queryParams.skip ?? 0,
      take: queryParams.take ?? 100,
      // todo: add filters here like by eventtype id etc
      filters: this.inputService.transformGetBookingsFilters(queryParams),
      ctx: {
        user,
        prisma: this.prismaReadService.prisma as unknown as PrismaClient,
      },
      sort: this.inputService.transformGetBookingsSort(queryParams),
    });

    return fetchedBookings.bookings.map((booking) => {
      const formatted = {
        ...booking,
        eventTypeId: booking.eventType.id,
        startTime: new Date(booking.startTime),
        endTime: new Date(booking.endTime),
        absentHost: !!booking.noShowHost,
      };

      const isRecurring = !!formatted.recurringEventId;
      if (isRecurring) {
        return this.outputService.getOutputRecurringBooking(formatted);
      }
      return this.outputService.getOutputBooking(formatted);
    });
  }

  async rescheduleBooking(request: Request, bookingUid: string, body: RescheduleBookingInput_2024_08_13) {
    try {
      const bookingRequest = await this.inputService.createRescheduleBookingRequest(
        request,
        bookingUid,
        body
      );
      const booking = await handleNewBooking(bookingRequest);
      if (!booking.id) {
        throw new Error("Booking was not created");
      }

      const databaseBooking = await this.bookingsRepository.getByIdWithAttendees(booking.id);
      if (!databaseBooking) {
        throw new Error(`Booking with id=${booking.id} was not found in the database`);
      }

      if (databaseBooking.recurringEventId) {
        return this.outputService.getOutputRecurringBooking(databaseBooking);
      }
      return this.outputService.getOutputBooking(databaseBooking);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "no_available_users_found_error") {
          throw new BadRequestException("User either already has booking at this time or is not available");
        }
      }
      throw error;
    }
  }

  async cancelBooking(request: Request, bookingUid: string, body: CancelBookingInput_2024_08_13) {
    const bookingRequest = await this.inputService.createCancelBookingRequest(request, bookingUid, body);
    await handleCancelBooking(bookingRequest);
    return this.getBooking(bookingUid);
  }

  async markAbsent(bookingUid: string, bookingOwnerId: number, body: MarkAbsentBookingInput_2024_08_13) {
    const bodyTransformed = this.inputService.transformInputMarkAbsentBooking(body);

    await handleMarkNoShow({
      bookingUid,
      attendees: bodyTransformed.attendees,
      noShowHost: bodyTransformed.noShowHost,
      userId: bookingOwnerId,
    });

    const booking = await this.bookingsRepository.getByUidWithAttendees(bookingUid);

    if (!booking) {
      throw new Error(`Booking with uid=${bookingUid} was not found in the database`);
    }

    const isRecurring = !!booking.recurringEventId;
    if (isRecurring) {
      return this.outputService.getOutputRecurringBooking(booking);
    }
    return this.outputService.getOutputBooking(booking);
  }

  async billBookings(bookings: CreatedBooking[]) {
    for (const booking of bookings) {
      await this.billBooking(booking);
    }
  }

  async billBooking(booking: CreatedBooking) {
    await this.billingService.increaseUsageByUserId(booking.hostId, {
      uid: booking.uid,
      startTime: new Date(booking.start),
    });
  }

  async billRescheduledBooking(newBooking: CreatedBooking, oldBookingUid: string) {
    await this.billingService.increaseUsageByUserId(newBooking.hostId, {
      uid: newBooking.uid,
      startTime: new Date(newBooking.start),
      fromReschedule: oldBookingUid,
    });
  }
}

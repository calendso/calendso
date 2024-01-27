import { getBookingFieldsWithSystemFields } from "@calcom/features/bookings/lib/getBookingFields";
import prisma from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import { BookingStatus } from "@calcom/prisma/enums";
import { EventTypeMetaDataSchema } from "@calcom/prisma/zod-utils";

export const getEventTypesFromDB = async (id: number) => {
  const userSelect = {
    id: true,
    name: true,
    username: true,
    hideBranding: true,
    theme: true,
    brandColor: true,
    darkBrandColor: true,
    email: true,
    timeZone: true,
  };
  const eventType = await prisma.eventType.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      length: true,
      eventName: true,
      recurringEvent: true,
      requiresConfirmation: true,
      userId: true,
      successRedirectUrl: true,
      customInputs: true,
      locations: true,
      price: true,
      currency: true,
      bookingFields: true,
      disableGuests: true,
      timeZone: true,
      owner: {
        select: userSelect,
      },
      users: {
        select: userSelect,
      },
      hosts: {
        select: {
          user: {
            select: userSelect,
          },
        },
      },
      team: {
        select: {
          slug: true,
          name: true,
          hideBranding: true,
        },
      },
      workflows: {
        select: {
          workflow: {
            select: {
              id: true,
              steps: true,
            },
          },
        },
      },
      metadata: true,
      seatsPerTimeSlot: true,
      seatsShowAttendees: true,
      seatsShowAvailabilityCount: true,
      periodStartDate: true,
      periodEndDate: true,
    },
  });

  if (!eventType) {
    return eventType;
  }

  const metadata = EventTypeMetaDataSchema.parse(eventType.metadata);

  return {
    isDynamic: false,
    ...eventType,
    bookingFields: getBookingFieldsWithSystemFields(eventType),
    metadata,
  };
};

export const handleSeatsEventTypeOnBooking = async (
  eventType: {
    seatsPerTimeSlot?: number | null;
    seatsShowAttendees: boolean | null;
    seatsShowAvailabilityCount: boolean | null;
    [x: string | number | symbol]: unknown;
  },
  bookingInfo: Partial<
    Prisma.BookingGetPayload<{
      include: {
        attendees: { select: { name: true; email: true } };
        seatsReferences: { select: { referenceUid: true } };
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            username: true;
            timeZone: true;
          };
        };
      };
    }>
  >,
  seatReferenceUid?: string,
  userId?: number
) => {
  if (eventType?.seatsPerTimeSlot !== null) {
    // @TODO: right now bookings with seats doesn't save every description that its entered by every user
    delete bookingInfo.description;
  } else {
    return;
  }
  // @TODO: If handling teams, we need to do more check ups for this.
  if (bookingInfo?.user?.id === userId) {
    return;
  }

  if (!eventType.seatsShowAttendees) {
    const seatAttendee = await prisma.bookingSeat.findFirst({
      where: {
        referenceUid: seatReferenceUid,
      },
      include: {
        attendee: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (seatAttendee) {
      const attendee = bookingInfo?.attendees?.find((a) => {
        return a.email === seatAttendee.attendee?.email;
      });
      bookingInfo["attendees"] = attendee ? [attendee] : [];
    } else {
      bookingInfo["attendees"] = [];
    }
  }
  return bookingInfo;
};

export async function getRecurringBookings(recurringEventId: string | null) {
  if (!recurringEventId) return null;
  const recurringBookings = await prisma.booking.findMany({
    where: {
      recurringEventId,
      status: BookingStatus.ACCEPTED,
    },
    select: {
      startTime: true,
    },
  });
  return recurringBookings.map((obj) => obj.startTime.toString());
}

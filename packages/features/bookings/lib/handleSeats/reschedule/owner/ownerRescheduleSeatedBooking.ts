// eslint-disable-next-line no-restricted-imports
import { cloneDeep } from "lodash";
import { uuid } from "short-uuid";

import type EventManager from "@calcom/core/EventManager";
import { sendRescheduledEmails } from "@calcom/emails";
import { HttpError } from "@calcom/lib/http-error";
import prisma from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";

import { addVideoCallDataToEvt, findBookingQuery } from "../../../handleNewBooking";
import type { createLoggerWithEventDetails } from "../../../handleNewBooking";
import type {
  NewTimeSlotBooking,
  SeatedBooking,
  RescheduleSeatedBookingObject,
  HandleSeatsResultBooking,
} from "../../types";
import moveSeatedBookingToNewTimeSlot from "./moveSeatedBookingToNewTimeSlot";

const ownerRescheduleSeatedBooking = async (
  rescheduleSeatedBookingObject: RescheduleSeatedBookingObject,
  newTimeSlotBooking: NewTimeSlotBooking,
  seatedBooking: SeatedBooking,
  resultBooking: HandleSeatsResultBooking | null,
  eventManager: EventManager,
  loggerWithEventDetails: ReturnType<typeof createLoggerWithEventDetails>
) => {
  const {
    originalRescheduledBooking,
    tAttendees,
    rescheduleReason,
    rescheduleUid,
    eventType,
    noEmail,
    isConfirmedByDefault,
    additionalNotes,
    attendeeLanguage,
  } = rescheduleSeatedBookingObject;
  let { evt } = rescheduleSeatedBookingObject;
  // Moving forward in this block is the owner making changes to the booking. All attendees should be affected
  evt.attendees = originalRescheduledBooking.attendees.map((attendee) => {
    return {
      name: attendee.name,
      email: attendee.email,
      timeZone: attendee.timeZone,
      language: { translate: tAttendees, locale: attendee.locale ?? "en" },
    };
  });

  // If there is no booking during the new time slot then update the current booking to the new date
  if (!newTimeSlotBooking) {
    resultBooking = await moveSeatedBookingToNewTimeSlot(
      rescheduleSeatedBookingObject,
      seatedBooking,
      eventManager,
      loggerWithEventDetails
    );
  } else {
    // Merge two bookings together
    const attendeesToMove = [],
      attendeesToDelete = [];

    for (const attendee of seatedBooking.attendees) {
      // If the attendee already exists on the new booking then delete the attendee record of the old booking
      if (
        newTimeSlotBooking.attendees.some((newBookingAttendee) => newBookingAttendee.email === attendee.email)
      ) {
        attendeesToDelete.push(attendee.id);
        // If the attendee does not exist on the new booking then move that attendee record to the new booking
      } else {
        attendeesToMove.push({ id: attendee.id, seatReferenceId: attendee.bookingSeat?.id });
      }
    }

    // Confirm that the new event will have enough available seats
    if (
      !eventType.seatsPerTimeSlot ||
      attendeesToMove.length +
        newTimeSlotBooking.attendees.filter((attendee) => attendee.bookingSeat).length >
        eventType.seatsPerTimeSlot
    ) {
      throw new HttpError({ statusCode: 409, message: "Booking does not have enough available seats" });
    }

    const moveAttendeeCalls = [];
    for (const attendeeToMove of attendeesToMove) {
      moveAttendeeCalls.push(
        prisma.attendee.update({
          where: {
            id: attendeeToMove.id,
          },
          data: {
            bookingId: newTimeSlotBooking.id,
            bookingSeat: {
              upsert: {
                create: {
                  referenceUid: uuid(),
                  bookingId: newTimeSlotBooking.id,
                },
                update: {
                  bookingId: newTimeSlotBooking.id,
                },
              },
            },
          },
        })
      );
    }

    await Promise.all([
      ...moveAttendeeCalls,
      // Delete any attendees that are already a part of that new time slot booking
      prisma.attendee.deleteMany({
        where: {
          id: {
            in: attendeesToDelete,
          },
        },
      }),
    ]);

    const updatedNewBooking = await prisma.booking.findUnique({
      where: {
        id: newTimeSlotBooking.id,
      },
      include: {
        attendees: true,
        references: true,
      },
    });

    if (!updatedNewBooking) {
      throw new HttpError({ statusCode: 404, message: "Updated booking not found" });
    }

    // Update the evt object with the new attendees
    const updatedBookingAttendees = updatedNewBooking.attendees.map((attendee) => {
      const evtAttendee = {
        ...attendee,
        language: { translate: tAttendees, locale: attendeeLanguage ?? "en" },
      };
      return evtAttendee;
    });

    evt.attendees = updatedBookingAttendees;

    evt = addVideoCallDataToEvt(updatedNewBooking.references, evt);

    const copyEvent = cloneDeep(evt);

    const updateManager = await eventManager.reschedule(copyEvent, rescheduleUid, newTimeSlotBooking.id);

    const results = updateManager.results;

    const calendarResult = results.find((result) => result.type.includes("_calendar"));

    evt.iCalUID = Array.isArray(calendarResult?.updatedEvent)
      ? calendarResult?.updatedEvent[0]?.iCalUID
      : calendarResult?.updatedEvent?.iCalUID || undefined;

    if (noEmail !== true && isConfirmedByDefault) {
      // TODO send reschedule emails to attendees of the old booking
      loggerWithEventDetails.debug("Emails: Sending reschedule emails - handleSeats");
      await sendRescheduledEmails({
        ...copyEvent,
        additionalNotes, // Resets back to the additionalNote input and not the override value
        cancellationReason: `$RCH$${rescheduleReason ? rescheduleReason : ""}`, // Removable code prefix to differentiate cancellation from rescheduling for email
      });
    }

    // Update the old booking with the cancelled status
    await prisma.booking.update({
      where: {
        id: seatedBooking.id,
      },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });

    const foundBooking = await findBookingQuery(newTimeSlotBooking.id);

    resultBooking = { ...foundBooking };
  }
  return resultBooking;
};

export default ownerRescheduleSeatedBooking;

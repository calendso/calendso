import { SchedulingType } from "@prisma/client";
import { z } from "zod";

import { LocationType } from "@calcom/app-store/locations";
import EventManager from "@calcom/core/EventManager";
import dayjs from "@calcom/dayjs";
import { sendLocationChangeEmails } from "@calcom/emails";
import { parseRecurringEvent } from "@calcom/lib";
import logger from "@calcom/lib/logger";
import { getTranslation } from "@calcom/lib/server/i18n";
import type { AdditionalInformation, CalendarEvent } from "@calcom/types/Calendar";

import { TRPCError } from "@trpc/server";

import { createProtectedRouter } from "../../createRouter";
import { getCalendar } from "@calcom/app-store/_utils/getCalendar";
import { BookingReference } from "@calcom/prisma/client";

// Common data for all endpoints under webhook
const commonBookingSchema = z.object({
  bookingId: z.number(),
});

export const bookingsRouter = createProtectedRouter()
  .middleware(async ({ ctx, rawInput, next }) => {
    // Endpoints that just read the logged in user's data - like 'list' don't necessary have any input
    if (!rawInput) return next({ ctx: { ...ctx, booking: null } });
    const webhookIdAndEventTypeId = commonBookingSchema.safeParse(rawInput);
    if (!webhookIdAndEventTypeId.success) throw new TRPCError({ code: "PARSE_ERROR" });

    const { bookingId } = webhookIdAndEventTypeId.data;
    const booking = await ctx.prisma.booking.findFirst({
      where: {
        AND: [
          {
            id: bookingId
          }, {
            OR: [
              /* If user is organizer */
              { userId: ctx.user.id },
              /* Or part of a collective booking */
              {
                eventType: {
                  schedulingType: SchedulingType.COLLECTIVE,
                  users: {
                    some: {
                      id: ctx.user.id,
                    },
                  },
                },
              },
            ],
          }
        ],
      },
      include: {
        attendees: true,
        eventType: true,
        destinationCalendar: true,
        references: true,
        user: {
          include: {
            destinationCalendar: true,
            credentials: true,
          },
        },
      },
    });
    return next({ ctx: { ...ctx, booking } });
  })
  .middleware(async ({ ctx, next }) => {
    // So TS doesn't compain in the previous middleware.
    // This means the user doesn't have access to this booking
    if (!ctx.booking) throw new TRPCError({ code: "UNAUTHORIZED" });
    // Booking here is non-nullable anymore
    return next({ ctx: { ...ctx, booking: ctx.booking } });
  })
  .mutation("editLocation", {
    input: commonBookingSchema.extend({
      newLocation: z.string().transform((val) => val || LocationType.Daily),
    }),
    async resolve({ ctx, input }) {
      const { bookingId, newLocation: location } = input;
      const { booking } = ctx;

      try {
        const organizer = await ctx.prisma.user.findFirst({
          where: {
            id: booking.userId || 0,
          },
          select: {
            name: true,
            email: true,
            timeZone: true,
            locale: true,
          },
          rejectOnNotFound: true,
        });

        const tOrganizer = await getTranslation(organizer.locale ?? "en", "common");

        const attendeesListPromises = booking.attendees.map(async (attendee) => {
          return {
            name: attendee.name,
            email: attendee.email,
            timeZone: attendee.timeZone,
            language: {
              translate: await getTranslation(attendee.locale ?? "en", "common"),
              locale: attendee.locale ?? "en",
            },
          };
        });

        const attendeesList = await Promise.all(attendeesListPromises);

        const evt: CalendarEvent = {
          title: booking.title || "",
          type: (booking.eventType?.title as string) || booking?.title || "",
          description: booking.description || "",
          startTime: booking.startTime ? dayjs(booking.startTime).format() : "",
          endTime: booking.endTime ? dayjs(booking.endTime).format() : "",
          organizer: {
            email: organizer.email,
            name: organizer.name ?? "Nameless",
            timeZone: organizer.timeZone,
            language: { translate: tOrganizer, locale: organizer.locale ?? "en" },
          },
          attendees: attendeesList,
          uid: booking.uid,
          recurringEvent: parseRecurringEvent(booking.eventType?.recurringEvent),
          location,
          destinationCalendar: booking?.destinationCalendar || booking?.user?.destinationCalendar,
        };

        const eventManager = new EventManager(ctx.user);

        const updatedResult = await eventManager.updateLocation(evt, booking);
        const results = updatedResult.results;
        if (results.length > 0 && results.every((res) => !res.success)) {
          const error = {
            errorCode: "BookingUpdateLocationFailed",
            message: "Updating location failed",
          };
          logger.error(`Booking ${ctx.user.username} failed`, error, results);
        } else {
          await ctx.prisma.booking.update({
            where: {
              id: bookingId,
            },
            data: {
              location,
              references: {
                create: updatedResult.referencesToCreate,
              },
            },
          });

          const metadata: AdditionalInformation = {};
          if (results.length) {
            metadata.hangoutLink = results[0].updatedEvent?.hangoutLink;
            metadata.conferenceData = results[0].updatedEvent?.conferenceData;
            metadata.entryPoints = results[0].updatedEvent?.entryPoints;
          }
          try {
            await sendLocationChangeEmails({ ...evt, additionalInformation: metadata });
          } catch (error) {
            console.log("Error sending LocationChangeEmails");
          }
        }
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
      return { message: "Location updated" };
    },
  });

import prisma, { bookingMinimalSelect } from "@calcom/prisma";

export const getBooking = async (bookingId: number) => {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: {
      id: bookingId,
    },
    select: {
      ...bookingMinimalSelect,
      uid: true,
      location: true,
      isRecorded: true,
      eventTypeId: true,
      references: true,
      eventType: {
        select: {
          id: true,
          teamId: true,
          parentId: true,
          hosts: {
            select: {
              userId: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          users: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          timeZone: true,
          email: true,
          name: true,
          locale: true,
          destinationCalendar: true,
        },
      },
    },
  });

  if (!booking) {
    log.error(
      "Couldn't find Booking Id:",
      safeStringify({
        bookingId,
      })
    );

    throw new HttpError({
      message: `Booking of id ${bookingId} does not exist or does not contain daily video as location`,
      statusCode: 404,
    });
  }
  return booking;
};

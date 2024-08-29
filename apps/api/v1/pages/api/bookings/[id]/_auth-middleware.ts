import type { NextApiRequest } from "next";

import { HttpError } from "@calcom/lib/http-error";
import prisma from "@calcom/prisma";

import { getAccessibleUsers } from "~/lib/utils/retrieveScopedAccessibleUsers";
import { schemaQueryIdParseInt } from "~/lib/validations/shared/queryIdTransformParseInt";

async function authMiddleware(req: NextApiRequest) {
  const { userId, isSystemWideAdmin, isOrganizationOwnerOrAdmin, query } = req;
  if (isSystemWideAdmin) {
    return;
  }

  const { id } = schemaQueryIdParseInt.parse(query);
  if (isOrganizationOwnerOrAdmin) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (booking) {
      const bookingUserId = booking.userId;
      if (bookingUserId) {
        const accessibleUsersIds = await getAccessibleUsers({
          adminUserId: userId,
          memberUserIds: [bookingUserId],
        });
        if (accessibleUsersIds.length > 0) return;
      }
    }
  }

  // do -- if isTeamOwnerOrAdmin so that we allow team owner/admins access to these bookings

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
    },
  });

  if (!user) throw new HttpError({ statusCode: 404, message: "User not found" });

  const userWithBookingsAndTeamIds = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      bookings: {
        where: {
          OR: [
            {
              attendees: {
                some: {
                  email: user.email,
                },
              },
            },
            {
              eventType: {
                hosts: {
                  some: {
                    userId,
                  },
                },
              },
            },
          ],
        },
      },
      teams: {
        select: {
          teamId: true,
        },
      },
    },
  });

  const userBookingIds = userWithBookingsAndTeamIds?.bookings.map((booking) => booking.id);

  if (!userBookingIds?.includes(id)) {
    // const teamBookings = await prisma.booking.findUnique({
    //   where: {
    //     id: id,
    //     eventType: {
    //       team: {
    //         id: {
    //           in: userWithBookingsAndTeamIds?.teams.map((team) => team.teamId),
    //         },
    //       },
    //     },
    //   },
    // });

    throw new HttpError({ statusCode: 403, message: "You are not authorized" });
  }
}

export default authMiddleware;

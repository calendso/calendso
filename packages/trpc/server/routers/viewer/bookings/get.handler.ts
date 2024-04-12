import { parseRecurringEvent } from "@calcom/lib";
import getAllUserBookings from "@calcom/lib/bookings/getAllUserBookings";
import type { PrismaClient } from "@calcom/prisma";
import { bookingMinimalSelect } from "@calcom/prisma";
import type { Prisma } from "@calcom/prisma/client";
import type { BookingStatus } from "@calcom/prisma/enums";
import { EventTypeMetaDataSchema } from "@calcom/prisma/zod-utils";

import type { TrpcSessionUser } from "../../../trpc";
import type { TGetInputSchema } from "./get.schema";

type GetOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
    prisma: PrismaClient;
  };
  input: TGetInputSchema;
};

export const getHandler = async ({ ctx, input }: GetOptions) => {
  // using offset actually because cursor pagination requires a unique column
  // for orderBy, but we don't use a unique column in our orderBy
  const take = input.limit ?? 10;
  const skip = input.cursor ?? 0;
  const { prisma, user } = ctx;
  const bookingListingByStatus = input.filters.status;

  const { bookings, recurringInfo, nextCursor } = await getAllUserBookings({
    ctx: { user: { id: user.id, email: user.email }, prisma: prisma },
    bookingListingByStatus: bookingListingByStatus,
    take: take,
    skip: skip,
    filters: input.filters,
  });

  return {
    bookings,
    recurringInfo,
    nextCursor,
  };
};

const getUniqueBookings = <T extends { id: number }>(arr: T[]) => {
  const unique = new Set<number>();
  arr.forEach((booking) => {
    unique.add(booking.id);
  });
  return Array.from(unique.values());
};

export async function getBookings({
  user,
  prisma,
  passedBookingsStatusFilter,
  filters,
  orderBy,
  take,
  skip,
}: {
  user: { id: number; email: string };
  filters: TGetInputSchema["filters"];
  prisma: PrismaClient;
  passedBookingsStatusFilter: Prisma.BookingWhereInput;
  orderBy: Prisma.BookingOrderByWithAggregationInput;
  take: number;
  skip: number;
}) {
  // TODO: Fix record typing
  const bookingWhereInputFilters: Record<string, Prisma.BookingWhereInput> = {
    teamIds: {
      AND: [
        {
          eventType: {
            team: {
              id: {
                in: filters?.teamIds,
              },
            },
          },
        },
      ],
    },
    userIds: {
      AND: [
        {
          OR: [
            {
              eventType: {
                hosts: {
                  some: {
                    userId: {
                      in: filters?.userIds,
                    },
                  },
                },
              },
            },
            {
              userId: {
                in: filters?.userIds,
              },
            },
            {
              eventType: {
                users: {
                  some: {
                    id: {
                      in: filters?.userIds,
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    },
    eventTypeIds: {
      AND: [
        {
          eventTypeId: {
            in: filters?.eventTypeIds,
          },
        },
      ],
    },
  };
  const filtersCombined: Prisma.BookingWhereInput[] = !filters
    ? []
    : Object.keys(filters)
        .map((key) => bookingWhereInputFilters[key])
        // On prisma 5.4.2 passing undefined to where "AND" causes an error
        .filter(Boolean);
  const bookingSelect = {
    ...bookingMinimalSelect,
    uid: true,
    recurringEventId: true,
    location: true,
    eventType: {
      select: {
        slug: true,
        id: true,
        eventName: true,
        price: true,
        recurringEvent: true,
        currency: true,
        metadata: true,
        seatsShowAttendees: true,
        seatsShowAvailabilityCount: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
    status: true,
    paid: true,
    payment: {
      select: {
        paymentOption: true,
        amount: true,
        currency: true,
        success: true,
      },
    },
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
    rescheduled: true,
    references: true,
    isRecorded: true,
    seatsReferences: {
      where: {
        attendee: {
          email: user.email,
        },
      },
      select: {
        referenceUid: true,
        attendee: {
          select: {
            email: true,
          },
        },
      },
    },
  };

  const userBookingsFilter: Prisma.BookingWhereInput = {
    userId: user.id,
  };
  const userAttendingBookingsFilter: Prisma.BookingWhereInput = {
    attendees: {
      some: {
        email: user.email,
      },
    },
  };
  // all (collective + round-robin) team bookings should be visible to team-owner and team-admins
  const teamBookingsFilter: Prisma.BookingWhereInput = {
    eventType: {
      team: {
        members: {
          some: {
            userId: user.id,
            role: {
              in: ["ADMIN", "OWNER"],
            },
          },
        },
      },
    },
  };
  // all (collective + round-robin) team bookings should be visible to org-owner and org-admins
  const organizationBookingsFilter: Prisma.BookingWhereInput = {
    eventType: {
      team: {
        parent: {
          members: {
            some: {
              userId: user.id,
              role: {
                in: ["ADMIN", "OWNER"],
              },
            },
          },
        },
      },
    },
  };

  // all managed team bookings should be visible to team-owner and team-admins
  const teamManagedBookingsFilter: Prisma.BookingWhereInput = {
    eventType: {
      parent: {
        team: {
          members: {
            some: {
              userId: user.id,
              role: {
                in: ["ADMIN", "OWNER"],
              },
            },
          },
        },
      },
    },
  };

  // all managed team bookings should be visible to org-owner and org-admins
  const organizationManagedBookingsFilter: Prisma.BookingWhereInput = {
    eventType: {
      parent: {
        team: {
          parent: {
            members: {
              some: {
                userId: user.id,
                role: {
                  in: ["ADMIN", "OWNER"],
                },
              },
            },
          },
        },
      },
    },
  };

  // show personal booking to org-owner and org-admins
  const organizationPersonalBookingsFilter: Prisma.BookingWhereInput = {
    AND: [
      {
        user: {
          teams: {
            some: {
              team: {
                parentId: { gt: 0 },
              },
            },
          },
        },
      },
      {
        OR: [
          {
            user: {
              teams: {
                some: {
                  team: {
                    parent: {
                      members: {
                        some: {
                          userId: user.id,
                          role: {
                            in: ["ADMIN", "OWNER"],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          {
            user: {
              teams: {
                some: {
                  team: {
                    members: {
                      some: {
                        userId: user.id,
                        role: {
                          in: ["ADMIN", "OWNER"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        ],
      },
      // filter out all (collective + round-robin) event bookings
      {
        eventType: {
          teamId: null,
        },
      },
      // filter out all (managed) event bookings
      {
        eventType: {
          parentId: null,
        },
      },
    ],
  };

  const seatsReferenceFilter: Prisma.BookingWhereInput = {
    seatsReferences: {
      some: {
        attendee: {
          email: user.email,
        },
      },
    },
  };
  const [
    // Quering these in parallel to save time.
    // Note that because we are applying `take` to individual queries, we will usually get more bookings then we need. It is okay to have more bookings faster than having what we need slower
    bookingsQueryUserId,
    recurringInfoBasic,
    recurringInfoExtended,
    // We need all promises to be successful, so we are not using Promise.allSettled
  ] = await Promise.all([
    prisma.booking.findMany({
      where: {
        OR: [
          userBookingsFilter,
          userAttendingBookingsFilter,
          teamBookingsFilter,
          organizationBookingsFilter,
          teamManagedBookingsFilter,
          organizationManagedBookingsFilter,
          organizationPersonalBookingsFilter,
          seatsReferenceFilter,
        ],
        AND: [passedBookingsStatusFilter, ...filtersCombined],
      },
      orderBy,
      select: { id: true },
      take: take + 1,
      skip,
    }),
    prisma.booking.groupBy({
      by: ["recurringEventId"],
      _min: {
        startTime: true,
      },
      _count: {
        recurringEventId: true,
      },
      where: {
        recurringEventId: {
          not: { equals: null },
        },
        userId: user.id,
      },
    }),
    prisma.booking.groupBy({
      by: ["recurringEventId", "status", "startTime"],
      _min: {
        startTime: true,
      },
      where: {
        recurringEventId: {
          not: { equals: null },
        },
        userId: user.id,
      },
    }),
  ]);

  const recurringInfo = recurringInfoBasic.map(
    (
      info: (typeof recurringInfoBasic)[number]
    ): {
      recurringEventId: string | null;
      count: number;
      firstDate: Date | null;
      bookings: {
        [key: string]: Date[];
      };
    } => {
      const bookings = recurringInfoExtended.reduce(
        (prev, curr) => {
          if (curr.recurringEventId === info.recurringEventId) {
            prev[curr.status].push(curr.startTime);
          }
          return prev;
        },
        { ACCEPTED: [], CANCELLED: [], REJECTED: [], PENDING: [], AWAITING_HOST: [] } as {
          [key in BookingStatus]: Date[];
        }
      );
      return {
        recurringEventId: info.recurringEventId,
        count: info._count.recurringEventId,
        firstDate: info._min.startTime,
        bookings,
      };
    }
  );

  const plainBookings = getUniqueBookings(
    // It's going to mess up the orderBy as we are concatenating independent queries results
    bookingsQueryUserId
  );

  // Now enrich bookings with relation data. We could have queried the relation data along with the bookings, but that would cause unnecessary queries to the database.
  // Because Prisma is also going to query the select relation data sequentially, we are fine querying it separately here as it would be just 1 query instead of 4
  const bookings = (
    await prisma.booking.findMany({
      where: {
        id: {
          in: plainBookings,
        },
      },
      select: bookingSelect,
      // We need to get the sorted bookings here as well because plainBookings array is not correctly sorted
      orderBy,
    })
  ).map((booking) => {
    // If seats are enabled and the event is not set to show attendees, filter out attendees that are not the current user
    if (booking.seatsReferences.length && !booking.eventType?.seatsShowAttendees) {
      booking.attendees = booking.attendees.filter((attendee) => attendee.email === user.email);
    }
    return {
      ...booking,
      eventType: {
        ...booking.eventType,
        recurringEvent: parseRecurringEvent(booking.eventType?.recurringEvent),
        price: booking.eventType?.price || 0,
        currency: booking.eventType?.currency || "usd",
        metadata: EventTypeMetaDataSchema.parse(booking.eventType?.metadata || {}),
      },
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
    };
  });
  return { bookings, recurringInfo };
}

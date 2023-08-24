import { Prisma } from "@prisma/client";

import type { Dayjs } from "@calcom/dayjs";
import dayjs from "@calcom/dayjs";
import type { DateRange } from "@calcom/lib/date-ranges";
import { buildDateRanges } from "@calcom/lib/date-ranges";
import { prisma } from "@calcom/prisma";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../../trpc";
import type { TListTeamAvailaiblityScheme } from "./listTeamAvailability.schema";

type GetOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TListTeamAvailaiblityScheme;
};

async function getTeamMembers({
  teamId,
  teamIds,
  cursor,
  limit,
}: {
  teamId?: number;
  teamIds?: number[];
  cursor: number | null | undefined;
  limit: number;
}) {
  let whereQuery: Prisma.MembershipWhereInput = {
    teamId,
  };

  if (teamIds) {
    whereQuery = {
      teamId: {
        in: teamIds,
      },
    };
  }

  return await prisma.membership.findMany({
    where: {
      ...whereQuery,
      accepted: true,
    },
    select: {
      id: true,
      role: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          timeZone: true,
          defaultScheduleId: true,
        },
      },
    },
    cursor: cursor ? { id: cursor } : undefined,
    take: limit + 1, // We take +1 as itll be used for the next cursor
    orderBy: {
      id: "asc",
    },
    distinct: ["userId"],
  });
}

type Member = Awaited<ReturnType<typeof getTeamMembers>>[number];

async function buildMember(member: Member, dateFrom: Dayjs, dateTo: Dayjs) {
  if (!member.user.defaultScheduleId) {
    return {
      id: member.user.id,
      username: member.user.username,
      email: member.user.email,
      timeZone: member.user.timeZone,
      role: member.role,
      dateRanges: [] as DateRange[],
    };
  }

  const schedule = await prisma.schedule.findUnique({
    where: { id: member.user.defaultScheduleId },
    select: { availability: true, timeZone: true },
  });
  const timeZone = schedule?.timeZone || member.user.timeZone;

  const dateRanges = buildDateRanges({
    dateFrom,
    dateTo,
    timeZone,
    availability: schedule?.availability ?? [],
  });

  return {
    id: member.user.id,
    username: member.user.username,
    email: member.user.email,
    timeZone,
    role: member.role,
    dateRanges,
  };
}

async function getInfoForAllTeams({ ctx, input }: GetOptions) {
  const { cursor, limit } = input;

  // Get all teamIds for the user
  const teamIds = await prisma.membership
    .findMany({
      where: {
        userId: ctx.user.id,
      },
      select: {
        id: true,
      },
    })
    .then((memberships) => memberships.map((membership) => membership.id));

  if (!teamIds.length) {
    throw new TRPCError({ code: "NOT_FOUND", message: "User is not part of any organization or team." });
  }

  const getTotalMembers = await prisma.$queryRaw<{
    count: number;
  }>(Prisma.sql`
      SELECT
        COUNT(DISTINCT "userId") as "count"
      FROM "Membership"
      WHERE "teamId" IN (${Prisma.join(teamIds)})
`);

  const teamMembers = await getTeamMembers({
    teamIds,
    cursor,
    limit,
  });

  return {
    teamMembers,
    totalTeamMembers: getTotalMembers.count,
  };
}

export const listTeamAvailabilityHandler = async ({ ctx, input }: GetOptions) => {
  const { cursor, limit } = input;
  const teamId = input.teamId || ctx.user.organizationId;

  let teamMembers: Member[] = [];
  let totalTeamMembers = 0;

  if (!teamId) {
    // Get all users TODO:
    const teamAllInfo = await getInfoForAllTeams({ ctx, input });

    teamMembers = teamAllInfo.teamMembers;
    totalTeamMembers = teamAllInfo.totalTeamMembers;
  } else {
    const isMember = await prisma.membership.findFirst({
      where: {
        teamId,
        userId: ctx.user.id,
      },
    });

    if (!isMember) {
      teamMembers = [];
      totalTeamMembers = 0;
    } else {
      const { cursor, limit } = input;

      totalTeamMembers = await prisma.membership.count({
        where: {
          teamId: teamId,
        },
      });

      // I couldnt get this query to work direct on membership table
      teamMembers = await getTeamMembers({
        teamId,
        cursor,
        limit,
      });
    }
  }

  let nextCursor: typeof cursor | undefined = undefined;
  if (teamMembers && teamMembers.length > limit) {
    const nextItem = teamMembers.pop();
    nextCursor = nextItem!.id;
  }

  const dateFrom = dayjs(input.startDate).tz(input.loggedInUsersTz).subtract(1, "day");
  const dateTo = dayjs(input.endDate).tz(input.loggedInUsersTz).add(1, "day");

  const buildMembers = teamMembers?.map((member) => buildMember(member, dateFrom, dateTo));

  const members = await Promise.all(buildMembers);

  return {
    rows: members || [],
    nextCursor,
    meta: {
      totalRowCount: totalTeamMembers,
    },
  };
};

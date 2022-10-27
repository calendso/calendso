import { Prisma, UserPlan } from "@prisma/client";

import prisma, { minimalEventTypeSelect, baseEventTypeSelect } from "@calcom/prisma";
import { EventTypeMetaDataSchema } from "@calcom/prisma/zod-utils";

export type TeamWithMembers = Awaited<ReturnType<typeof getTeamWithMembers>>;

export async function getTeamEventsWithMembers() {
  const userSelect = Prisma.validator<Prisma.UserSelect>()({
    username: true,
    email: true,
  });

  const teamSelect = Prisma.validator<Prisma.TeamSelect>()({
    id: true,
    name: true,
    slug: true,
    eventTypes: {
      where: {
        hidden: false,
      },
      select: {
        users: {
          select: userSelect,
        },
        ...minimalEventTypeSelect,
      },
    },
  });

  const teams = await prisma.team.findMany({
    select: teamSelect,
  });

  return { teams };
}

export async function getTeamWithMembers(id?: number, slug?: string) {
  const userSelect = Prisma.validator<Prisma.UserSelect>()({
    username: true,
    email: true,
    name: true,
    id: true,
    plan: true,
    bio: true,
  });
  const teamSelect = Prisma.validator<Prisma.TeamSelect>()({
    id: true,
    name: true,
    slug: true,
    logo: true,
    bio: true,
    hideBranding: true,
    members: {
      select: {
        user: {
          select: userSelect,
        },
      },
    },
    eventTypes: {
      where: {
        hidden: false,
      },
      select: {
        users: {
          select: userSelect,
        },
        metadata: true,
        ...baseEventTypeSelect,
      },
    },
  });

  const team = await prisma.team.findUnique({
    where: id ? { id } : { slug },
    select: teamSelect,
  });

  if (!team) return null;
  const memberships = await prisma.membership.findMany({
    where: {
      teamId: team.id,
    },
  });

  const members = team.members.map((obj) => {
    const membership = memberships.find((membership) => obj.user.id === membership.userId);
    return {
      ...obj.user,
      isMissingSeat: obj.user.plan === UserPlan.FREE,
      role: membership?.role,
      accepted: membership?.accepted,
      disableImpersonation: membership?.disableImpersonation,
    };
  });

  const eventTypes = team.eventTypes.map((eventType) => ({
    ...eventType,
    metadata: EventTypeMetaDataSchema.parse(eventType.metadata),
  }));
  return { ...team, eventTypes, members };
}
// also returns team
export async function isTeamAdmin(userId: number, teamId: number) {
  return (
    (await prisma.membership.findFirst({
      where: {
        userId,
        teamId,
        OR: [{ role: "ADMIN" }, { role: "OWNER" }],
      },
    })) || false
  );
}
export async function isTeamOwner(userId: number, teamId: number) {
  return !!(await prisma.membership.findFirst({
    where: {
      userId,
      teamId,
      role: "OWNER",
    },
  }));
}

export async function isTeamMember(userId: number, teamId: number) {
  return !!(await prisma.membership.findFirst({
    where: {
      userId,
      teamId,
    },
  }));
}

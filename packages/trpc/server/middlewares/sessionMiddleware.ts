import type { Session } from "next-auth";
import { z } from "zod";

import { WEBAPP_URL } from "@calcom/lib/constants";
import logger from "@calcom/lib/logger";
import { MembershipRole } from "@calcom/prisma/enums";
import { teamMetadataSchema, userMetadata } from "@calcom/prisma/zod-utils";

import type { Maybe } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import type { TRPCContextInner } from "../createContext";
import { middleware } from "../trpc";

export async function getUserFromSession(ctx: TRPCContextInner, session: Maybe<Session>) {
  const { prisma } = ctx;
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      emailVerified: true,
      bio: true,
      timeZone: true,
      weekStart: true,
      startTime: true,
      endTime: true,
      defaultScheduleId: true,
      bufferTime: true,
      theme: true,
      createdDate: true,
      hideBranding: true,
      twoFactorEnabled: true,
      disableImpersonation: true,
      identityProvider: true,
      brandColor: true,
      darkBrandColor: true,
      away: true,
      selectedCalendars: {
        select: {
          externalId: true,
          integration: true,
        },
      },
      completedOnboarding: true,
      destinationCalendar: true,
      locale: true,
      timeFormat: true,
      trialEndsAt: true,
      metadata: true,
      role: true,
      organizationId: true,
      allowDynamicBooking: true,
      allowSEOIndexing: true,
      organization: {
        select: {
          id: true,
          slug: true,
          metadata: true,
          members: {
            select: { userId: true },
            where: {
              userId: session.user.id,
              OR: [{ role: MembershipRole.ADMIN }, { role: MembershipRole.OWNER }],
            },
          },
        },
      },
    },
  });

  // some hacks to make sure `username` and `email` are never inferred as `null`
  if (!user) {
    return null;
  }

  const { email, username, id } = user;
  if (!email || !id) {
    return null;
  }

  const userMetaData = userMetadata.parse(user.metadata || {});
  const orgMetadata = teamMetadataSchema.parse(user.organization?.metadata || {});
  // This helps to prevent reaching the 4MB payload limit by avoiding base64 and instead passing the avatar url

  const locale = user?.locale || ctx.locale;

  const isOrgAdmin = !!user.organization?.members.length;
  // Want to reduce the amount of data being sent
  if (isOrgAdmin && user.organization?.members) {
    user.organization.members = [];
  }
  return {
    ...user,
    avatar:
      `${WEBAPP_URL}/${user.username}/avatar.png?` + user.organizationId && `orgId=${user.organizationId}`,
    organization: {
      ...user.organization,
      isOrgAdmin,
      metadata: orgMetadata,
    },
    id,
    email,
    username,
    locale,
    defaultBookerLayouts: userMetaData?.defaultBookerLayouts || null,
  };
}

export type UserFromSession = Awaited<ReturnType<typeof getUserFromSession>>;

const getSession = async (ctx: TRPCContextInner) => {
  const { req, res } = ctx;
  const { getServerSession } = await import("@calcom/features/auth/lib/getServerSession");
  return req ? await getServerSession({ req, res }) : null;
};

const getUserSession = async (ctx: TRPCContextInner) => {
  /**
   * It is possible that the session and user have already been added to the context by a previous middleware
   * or when creating the context
   */
  const session = ctx.session || (await getSession(ctx));
  const user = session ? await getUserFromSession(ctx, session) : null;

  return { user, session };
};

const sessionMiddleware = middleware(async ({ ctx, next }) => {
  const middlewareStart = performance.now();
  const { user, session } = await getUserSession(ctx);
  const middlewareEnd = performance.now();
  logger.debug("Perf:t.sessionMiddleware", middlewareEnd - middlewareStart);
  return next({
    ctx: { user, session },
  });
});

export const isAuthed = middleware(async ({ ctx, next }) => {
  const middlewareStart = performance.now();

  const { user, session } = await getUserSession(ctx);

  const middlewareEnd = performance.now();
  logger.debug("Perf:t.isAuthed", middlewareEnd - middlewareStart);

  if (!user || !session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: { ...ctx, user, session },
  });
});

// use(async ({ ctx, next, rawInput }) => {
//   const { prisma } = ctx;
//   const parsed = userIdSchema.safeParse(rawInput);
//   if (!parsed.success) throw new TRPCError({ code: "BAD_REQUEST", message: "User id is required" });
//   const { userId: id } = parsed.data;
//   const user = await prisma.user.findUnique({ where: { id } });
//   if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
//   return next({
//     ctx: {
//       user: ctx.user,
//       requestedUser:
//         /** Don't leak the password */
//         exclude(user, ["password"]),
//     },
//   });
// });

export const isAdminMiddleware = isAuthed.unstable_pipe(({ ctx, next }) => {
  const { user } = ctx;
  if (user?.role !== "ADMIN") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: user } });
});

// Org admins can be admins or owners
export const isOrgAdminMiddleware = isAuthed.unstable_pipe(({ ctx, next }) => {
  const { user } = ctx;
  if (!user?.organization?.isOrgAdmin) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: user } });
});

const userIdSchema = z.object({ requestedUserId: z.coerce.number() });

export const hasPermissionToEditUser = isAuthed.unstable_pipe(async ({ ctx, rawInput, next }) => {
  const { prisma } = ctx;
  const parsed = userIdSchema.safeParse(rawInput);
  if (!parsed.success) throw new TRPCError({ code: "BAD_REQUEST", message: "User id is required" });
  const { requestedUserId } = parsed.data;

  const membershipOverlap = await prisma.membership.findMany({
    where: {
      OR: [
        { userId: ctx.user.id, team: { members: { some: { userId: requestedUserId } } } },
        { userId: requestedUserId, team: { members: { some: { userId: ctx.user.id } } } },
      ],
    },
  });

  const isAdminOrOwner = membershipOverlap.some(
    (membership) =>
      (membership.role === "ADMIN" || membership.role === "OWNER") && membership.userId === ctx.user.id
  );

  if (ctx.user.role !== "ADMIN" || !isAdminOrOwner) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // fetch user
  const user = await prisma.user.findUnique({
    where: {
      id: requestedUserId,
    },
  });

  if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

  const { password: _password, ...userWithoutPassword } = user;

  // If the user is an admin or owner, they can edit the user
  // We should implement audit logging asap to track who is editing what - especially since we have a lot of team management features

  return next({
    ctx: {
      user: ctx.user,
      requestedUser: userWithoutPassword,
    },
  });
});

export default sessionMiddleware;

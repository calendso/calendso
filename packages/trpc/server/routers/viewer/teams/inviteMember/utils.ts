import { randomBytes } from "crypto";
import type { TFunction } from "next-i18next";

import { sendTeamInviteEmail, sendOrganizationAutoJoinEmail } from "@calcom/emails";
import { WEBAPP_URL } from "@calcom/lib/constants";
import logger from "@calcom/lib/logger";
import { isTeamAdmin } from "@calcom/lib/server/queries";
import { isOrganisationAdmin } from "@calcom/lib/server/queries/organisations";
import slugify from "@calcom/lib/slugify";
import { prisma } from "@calcom/prisma";
import type { Membership, Team } from "@calcom/prisma/client";
import { Prisma, type User } from "@calcom/prisma/client";
import type { MembershipRole } from "@calcom/prisma/enums";
import { teamMetadataSchema } from "@calcom/prisma/zod-utils";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../../trpc";
import { isEmail } from "../util";
import type { InviteMemberOptions, TeamWithParent } from "./types";

export type UserWithMembership = User & { teams: Pick<Membership, "userId" | "teamId" | "accepted">[] };

export async function checkPermissions({
  userId,
  teamId,
  isOrg,
}: {
  userId: number;
  teamId: number;
  isOrg?: boolean;
}) {
  // Checks if the team they are inviteing to IS the org. Not a child team
  if (isOrg) {
    if (!(await isOrganisationAdmin(userId, teamId))) throw new TRPCError({ code: "UNAUTHORIZED" });
  } else {
    // TODO: do some logic here to check if the user is inviting a NEW user to a team that ISNT in the same org
    if (!(await isTeamAdmin(userId, teamId))) throw new TRPCError({ code: "UNAUTHORIZED" });
  }
}

export async function getTeamOrThrow(teamId: number, isOrg?: boolean) {
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
    },
    include: {
      parent: true,
    },
  });

  if (!team)
    throw new TRPCError({ code: "NOT_FOUND", message: `${isOrg ? "Organization" : "Team"} not found` });

  return team;
}

export async function getEmailsToInvite(usernameOrEmail: string | string[]) {
  const emailsToInvite = Array.isArray(usernameOrEmail)
    ? Array.from(new Set(usernameOrEmail))
    : [usernameOrEmail];

  if (emailsToInvite.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You must provide at least one email address to invite.",
    });
  }

  return emailsToInvite;
}

export async function getUserToInviteOrThrowIfExists({
  usernameOrEmail,
  teamId,
  isOrg,
}: {
  usernameOrEmail: string;
  teamId: number;
  isOrg?: boolean;
}) {
  // Check if user exists in ORG or exists all together

  const orgWhere = isOrg && {
    organizationId: teamId,
  };
  const invitee = await prisma.user.findFirst({
    where: {
      OR: [{ username: usernameOrEmail, ...orgWhere }, { email: usernameOrEmail }],
    },
  });

  // We throw on error cause we can't have two users in the same org with the same username
  if (isOrg && invitee) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Email ${usernameOrEmail} already exists, you can't invite existing users.`,
    });
  }

  return invitee;
}

export async function getUsersToInviteOrThrowIfExists({
  usernameOrEmail,
  teamId,
  isOrg,
}: {
  usernameOrEmail: string[];
  teamId: number;
  isOrg?: boolean;
}) {
  // Check if user exists in ORG or exists all together

  const orgWhere = isOrg && {
    organizationId: teamId,
  };
  const invitees = await prisma.user.findMany({
    where: {
      OR: [{ username: { in: usernameOrEmail }, ...orgWhere }, { email: { in: usernameOrEmail } }],
    },
    include: { teams: { select: { teamId: true, userId: true, accepted: true }, where: { teamId: teamId } } },
  });

  // We throw on error cause we can't have two users in the same org with the same username
  if (isOrg && invitees.length) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Emails: ${usernameOrEmail.toString()} already exist, you can't invite existing users.`,
    });
  }

  return invitees;
}

export function checkInputEmailIsValid(email: string) {
  if (!isEmail(email))
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Invite failed because ${email} is not a valid email address`,
    });
}

export function getOrgConnectionInfo({
  orgAutoAcceptDomain,
  orgVerified,
  isOrg,
  usersEmail,
  team,
}: {
  orgAutoAcceptDomain?: string | null;
  orgVerified?: boolean | null;
  usersEmail: string;
  team: TeamWithParent;
  isOrg: boolean;
}) {
  let orgId: number | undefined = undefined;
  let autoAccept = false;

  if (team.parentId || isOrg) {
    orgId = team.parentId || team.id;
    if (usersEmail.split("@")[1] == orgAutoAcceptDomain) {
      autoAccept = orgVerified ?? true;
    } else {
      orgId = undefined;
      autoAccept = false;
    }
  }

  return { orgId, autoAccept };
}

export async function createNewUsersConnectToOrgIfExists({
  usernamesOrEmails,
  input,
  parentId,
  autoAcceptEmailDomain,
  connectionInfoMap,
}: {
  usernamesOrEmails: string[];
  input: InviteMemberOptions["input"];
  parentId?: number | null;
  autoAcceptEmailDomain?: string;
  connectionInfoMap: Record<string, ReturnType<typeof getOrgConnectionInfo>>;
}) {
  await prisma.$transaction(async (tx) => {
    for (let index = 0; index < usernamesOrEmails.length; index++) {
      const usernameOrEmail = usernamesOrEmails[index];
      const { orgId, autoAccept } = connectionInfoMap[usernameOrEmail];
      const [emailUser, emailDomain] = usernameOrEmail.split("@");
      const username =
        emailDomain === autoAcceptEmailDomain
          ? slugify(emailUser)
          : slugify(`${emailUser}-${emailDomain.split(".")[0]}`);

      const createdUser = await tx.user.create({
        data: {
          username,
          email: usernameOrEmail,
          verified: true,
          invitedTo: input.teamId,
          organizationId: orgId || null, // If the user is invited to a child team, they are automatically added to the parent org
          teams: {
            create: {
              teamId: input.teamId,
              role: input.role as MembershipRole,
              accepted: autoAccept, // If the user is invited to a child team, they are automatically accepted
            },
          },
        },
      });

      // We also need to create the membership in the parent org if it exists
      if (parentId) {
        await tx.membership.create({
          data: {
            teamId: parentId,
            userId: createdUser.id,
            role: input.role as MembershipRole,
            accepted: autoAccept,
          },
        });
      }
    }
  });
}

export async function createProvisionalMemberships({
  input,
  invitees,
  parentId,
}: {
  input: InviteMemberOptions["input"];
  invitees: User[];
  parentId?: number;
}) {
  try {
    await prisma.membership.createMany({
      data: invitees.flatMap((invitee) => {
        const data = [];
        // membership for the team
        data.push({
          teamId: input.teamId,
          userId: invitee.id,
          role: input.role as MembershipRole,
        });

        // membership for the org
        if (parentId) {
          data.push({
            teamId: parentId,
            userId: invitee.id,
            role: input.role as MembershipRole,
          });
        }
        return data;
      }),
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // Don't throw an error if the user is already a member of the team when inviting multiple users
      if (!Array.isArray(input.usernameOrEmail) && e.code === "P2002") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This user is a member of this team / has a pending invitation.",
        });
      } else if (Array.isArray(input.usernameOrEmail) && e.code === "P2002") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Trying to invite users already members of this team / have pending invitations",
        });
      }
      logger.error("Failed to create provisional memberships", input.teamId);
    } else throw e;
  }
}

export async function sendVerificationEmail({
  usernameOrEmail,
  team,
  translation,
  ctx,
  input,
  connectionInfo,
}: {
  usernameOrEmail: string;
  team: Awaited<ReturnType<typeof getTeamOrThrow>>;
  translation: TFunction;
  ctx: { user: NonNullable<TrpcSessionUser> };
  input: {
    teamId: number;
    role: "ADMIN" | "MEMBER" | "OWNER";
    usernameOrEmail: string | string[];
    language: string;
    isOrg: boolean;
  };
  connectionInfo: ReturnType<typeof getOrgConnectionInfo>;
}) {
  const token: string = randomBytes(32).toString("hex");

  await prisma.verificationToken.create({
    data: {
      identifier: usernameOrEmail,
      token,
      expires: new Date(new Date().setHours(168)), // +1 week
      team: {
        connect: {
          id: input.teamId,
        },
      },
    },
  });
  if (!connectionInfo.autoAccept) {
    await sendTeamInviteEmail({
      language: translation,
      from: ctx.user.name || `${team.name}'s admin`,
      to: usernameOrEmail,
      teamName: team?.parent?.name || team.name,
      joinLink: `${WEBAPP_URL}/signup?token=${token}&callbackUrl=/getting-started`,
      isCalcomMember: false,
      isOrg: input.isOrg,
    });
  } else {
    await sendOrganizationAutoJoinEmail({
      language: translation,
      from: ctx.user.name || `${team.name}'s admin`,
      to: usernameOrEmail,
      orgName: team?.parent?.name || team.name,
      joinLink: `${WEBAPP_URL}/signup?token=${token}&callbackUrl=/getting-started`,
    });
  }
}

export function throwIfInviteIsToOrgAndUserExists(invitee: User, team: TeamWithParent, isOrg: boolean) {
  if (invitee.organizationId && invitee.organizationId === team.parentId) {
    return;
  }

  if (invitee.organizationId && invitee.organizationId !== team.parentId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `User ${invitee.username} is already a member of another organization.`,
    });
  }

  if ((invitee && isOrg) || (team.parentId && invitee)) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You cannot add a user that already exists in Cal.com to an organization. If they wish to join via this email address, they must update their email address in their profile to that of your organization.`,
    });
  }
}

export function getIsOrgVerified(
  isOrg: boolean,
  team: Team & {
    parent: Team | null;
  }
) {
  const teamMetadata = teamMetadataSchema.parse(team.metadata);
  const orgMetadataSafeParse = teamMetadataSchema.safeParse(team.parent?.metadata);
  const orgMetadataIfExists = orgMetadataSafeParse.success ? orgMetadataSafeParse.data : null;

  if (isOrg && teamMetadata?.orgAutoAcceptEmail) {
    return {
      isInOrgScope: true,
      orgVerified: teamMetadata.isOrganizationVerified,
      autoAcceptEmailDomain: teamMetadata.orgAutoAcceptEmail,
    };
  } else if (orgMetadataIfExists?.orgAutoAcceptEmail) {
    return {
      isInOrgScope: true,
      orgVerified: orgMetadataIfExists.isOrganizationVerified,
      autoAcceptEmailDomain: orgMetadataIfExists.orgAutoAcceptEmail,
    };
  }

  return {
    isInOrgScope: false,
  } as { isInOrgScope: false; orgVerified: never; autoAcceptEmailDomain: never };
}

export function shouldAutoJoinIfInOrg({
  team,
  invitee,
}: {
  team: TeamWithParent;
  invitee: UserWithMembership;
}) {
  // Not a member of the org
  if (invitee.organizationId && invitee.organizationId !== team.parentId) {
    return {
      autoJoined: false,
    };
  }
  // team is an Org
  if (!team.parentId) {
    return {
      autoJoined: false,
    };
  }

  const orgMembership = invitee.teams.find((membership) => membership.teamId === team.parentId);

  if (!orgMembership?.accepted) {
    return {
      autoJoined: false,
    };
  }

  return {
    autoJoined: true,
  };
}
// split invited users between ones that can autojoin and the others who cannot autojoin
export const getUsersForMemberships = ({
  existingUsersWithMembersips,
  team,
  isOrg,
}: {
  team: TeamWithParent;
  isOrg: boolean;
  existingUsersWithMembersips: UserWithMembership[];
}) => {
  const usersToAutoJoin = [];
  const regularUsers = [];

  for (let index = 0; index < existingUsersWithMembersips.length; index++) {
    const existingUserWithMembersips = existingUsersWithMembersips[index];
    throwIfInviteIsToOrgAndUserExists(existingUserWithMembersips, team, isOrg);

    const shouldAutoJoinOrgTeam = shouldAutoJoinIfInOrg({
      invitee: existingUserWithMembersips,
      team,
    });

    shouldAutoJoinOrgTeam.autoJoined
      ? usersToAutoJoin.push(existingUserWithMembersips)
      : regularUsers.push(existingUserWithMembersips);
  }
  return [usersToAutoJoin, regularUsers];
};

export const sendEmails = async (emailPromises: Promise<void>[]) => {
  const sentEmails = await Promise.allSettled(emailPromises);
  sentEmails.forEach((sentEmail) => {
    if (sentEmail.status === "rejected") {
      logger.error("Could not send email to user");
    }
  });
};

export const sendTeamInviteEmails = async ({
  existingUsersWithMembersips,
  language,
  currentUserTeamName,
  currentUserName,
  isOrg,
  teamId,
}: {
  language: TFunction;
  existingUsersWithMembersips: UserWithMembership[];
  currentUserTeamName?: string;
  currentUserName?: string | null;
  isOrg: boolean;
  teamId: number;
}) => {
  const sendEmailsPromises = existingUsersWithMembersips.map(async (user) => {
    let sendTo = user.email;
    if (!isEmail(user.email)) {
      sendTo = user.email;
    }
    // inform user of membership by email
    if (currentUserName && currentUserTeamName) {
      const inviteTeamOptions = {
        joinLink: `${WEBAPP_URL}/auth/login?callbackUrl=/settings/teams`,
        isCalcomMember: true,
      };
      /**
       * Here we want to redirect to a different place if onboarding has been completed or not. This prevents the flash of going to teams -> Then to onboarding - also show a different email template.
       * This only changes if the user is a CAL user and has not completed onboarding and has no password
       */
      if (!user.completedOnboarding && !user.password && user.identityProvider === "CAL") {
        const token = randomBytes(32).toString("hex");
        await prisma.verificationToken.create({
          data: {
            identifier: user.email,
            token,
            expires: new Date(new Date().setHours(168)), // +1 week
            team: {
              connect: {
                id: teamId,
              },
            },
          },
        });

        inviteTeamOptions.joinLink = `${WEBAPP_URL}/signup?token=${token}&callbackUrl=/getting-started`;
        inviteTeamOptions.isCalcomMember = false;
      }

      return sendTeamInviteEmail({
        language,
        from: currentUserName,
        to: sendTo,
        teamName: currentUserTeamName,
        ...inviteTeamOptions,
        isOrg: isOrg,
      });
    }
  });

  await sendEmails(sendEmailsPromises);
};

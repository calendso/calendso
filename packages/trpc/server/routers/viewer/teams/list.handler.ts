import { prisma } from "@calcom/prisma";
import { teamMetadataSchema } from "@calcom/prisma/zod-utils";

import type { TrpcSessionUser } from "../../../trpc";
import type { TGetListSchema } from "./list.schema";

type ListOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGetListSchema;
};

export const listHandler = async ({ ctx, input }: ListOptions) => {
  const memberships = await prisma.membership.findMany({
    where: {
      // Show all the teams this user belongs to regardless of the team being part of the user's org or not
      // We don't want to restrict in the listing here. If we need to restrict a situation where a user is part of the org along with being part of a non-org team, we should do that instead of filtering out from here
      // This became necessary when we started migrating user to Org, without migrating some teams of the user to the org
      // Also, we would allow a user to be part of multiple orgs, then also it would be necessary.
      userId: ctx.user.id,
    },
    include: {
      team: {
        include: {
          inviteTokens: true,
          parent: true,
        },
      },
    },
    orderBy: { role: "desc" },
  });

  return memberships
    .filter((mmship) => {
      if (input?.includeOrgs) return true;
      const metadata = teamMetadataSchema.parse(mmship.team.metadata);
      return !metadata?.isOrganization;
    })
    .map(({ team: { inviteTokens, ..._team }, ...membership }) => ({
      role: membership.role,
      accepted: membership.accepted,
      ..._team,
      metadata: teamMetadataSchema.parse(_team.metadata),
      /** To prevent breaking we only return non-email attached token here, if we have one */
      inviteToken: inviteTokens.find((token) => token.identifier === `invite-link-for-teamId-${_team.id}`),
    }));
};

export default listHandler;

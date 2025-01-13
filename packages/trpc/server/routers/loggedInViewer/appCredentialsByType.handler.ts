import { getAllDwdCredentialsForUserByAppType } from "@calcom/lib/domainWideDelegation/server";
import { UserRepository } from "@calcom/lib/server/repository/user";
import { prisma } from "@calcom/prisma";
import type { TrpcSessionUser } from "@calcom/trpc/server/trpc";

import type { TAppCredentialsByTypeInputSchema } from "./appCredentialsByType.schema";

type AppCredentialsByTypeOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TAppCredentialsByTypeInputSchema;
};

/** Used for grabbing credentials on specific app pages */
export const appCredentialsByTypeHandler = async ({ ctx, input }: AppCredentialsByTypeOptions) => {
  const { user } = ctx;
  const userAdminTeams = await UserRepository.getUserAdminTeams(ctx.user.id);
  const userAdminTeamsIds = userAdminTeams?.teams?.map(({ team }) => team.id) ?? [];

  const credentials = await prisma.credential.findMany({
    where: {
      OR: [
        { userId: user.id },
        {
          teamId: {
            in: userAdminTeamsIds,
          },
        },
      ],
      type: input.appType,
    },
  });

  const domainWideDelegationCredentials = await getAllDwdCredentialsForUserByAppType({
    user: { id: user.id, email: user.email },
    appType: input.appType,
  });

  // For app pages need to return which teams the user can install the app on
  // return user.credentials.filter((app) => app.type == input.appType).map((credential) => credential.id);
  return {
    credentials: [...credentials, ...domainWideDelegationCredentials],
    userAdminTeams: userAdminTeamsIds,
  };
};

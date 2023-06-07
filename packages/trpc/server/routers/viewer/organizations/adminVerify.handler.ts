import { prisma } from "@calcom/prisma";
import { teamMetadataSchema } from "@calcom/prisma/zod-utils";

import { TRPCError } from "@trpc/server";

import type { TrpcSessionUser } from "../../../trpc";
import type { TAdminVerifyInput } from "./adminVerify.schema";

type AdminVerifyOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TAdminVerifyInput;
};

export const adminVerifyHandler = async ({ input }: AdminVerifyOptions) => {
  const foundOrg = await prisma.team.findFirst({
    where: {
      id: input.orgId,
      metadata: {
        path: ["isOrganization"],
        equals: true,
      },
    },
  });

  if (!foundOrg)
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "This team isnt a org or doesnt exist",
    });

  const metaDataParsed = teamMetadataSchema.parse(foundOrg.metadata);

  await prisma.team.update({
    where: {
      id: input.orgId,
    },
    data: {
      metadata: {
        ...metaDataParsed,
        isOrganizationVerified: true,
      },
    },
  });

  return { ok: true, message: "Verified Organization" };
};

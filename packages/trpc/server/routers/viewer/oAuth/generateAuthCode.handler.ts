import { randomBytes } from "crypto";

import dayjs from "@calcom/dayjs";
import { prisma } from "@calcom/prisma";
import type { AccessScope } from "@calcom/prisma/enums";
import type { TrpcSessionUser } from "@calcom/trpc/server/trpc";

import { TRPCError } from "@trpc/server";

import type { TGenerateAuthCodeInputSchema } from "./generateAuthCode.schema";

type AddClientOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGenerateAuthCodeInputSchema;
};

export const generateAuthCodeHandler = async ({ ctx, input }: AddClientOptions) => {
  const { clientId, scopes, teamSlug } = input;
  const client = await prisma.oAuthClient.findFirst({
    where: {
      clientId,
    },
    select: {
      clientId: true,
      redirectUri: true,
      name: true,
    },
  });

  if (!client) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Client ID not valid" });
  }
  const authorizationCode = generateAuthorizationCode();

  const isTeam = teamSlug.startsWith("team/");

  const team = isTeam ? await prisma.team.findFirst({ where: { slug: teamSlug.substring(5) } }) : undefined;

  await prisma.accessCode.create({
    data: {
      code: authorizationCode,
      clientId,
      userId: !isTeam ? ctx.user.id : undefined,
      teamId: team ? team.id : undefined,
      expiresAt: dayjs().add(10, "minutes").toDate(),
      scopes: scopes as [AccessScope],
    },
  });
  return { client, authorizationCode };
};

function generateAuthorizationCode() {
  const randomBytesValue = randomBytes(40);
  const authorizationCode = randomBytesValue
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return authorizationCode;
}

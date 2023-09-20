import jwt from "jsonwebtoken";
import type { NextApiRequest } from "next";

import prisma from "@calcom/prisma";

export default async function isAuthorized(req: NextApiRequest, requiredScopes: string[] = []) {
  const token = req.headers.authorization?.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.CALENDSO_ENCRYPTION_KEY);

  const hasAllRequiredScopes = requiredScopes.every((scope) => decodedToken.scope.includes(scope));

  if (!hasAllRequiredScopes || decodedToken.token_type !== "Access Token") {
    return null;
  }

  if (decodedToken.userId) {
    const user = await prisma.user.findFirst({
      where: {
        id: decodedToken.userId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return { id: user.id, name: user.username, isTeam: false };
  }

  if (decodedToken.teamId) {
    const team = await prisma.team.findFirst({
      where: {
        id: decodedToken.teamId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return { ...team, isTeam: true };
  }

  return null;
}

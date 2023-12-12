import type { Prisma } from "@prisma/client";
import type { NextApiRequest } from "next";

import { defaultResponder } from "@calcom/lib/server";

import { schemaTeamsReadPublic } from "~/lib/validations/team";

/**
 * @swagger
 * /teams:
 *   get:
 *     operationId: listTeams
 *     summary: Find all teams
 *     parameters:
 *        - in: query
 *          name: apiKey
 *          required: true
 *          schema:
 *            type: string
 *          example: 1234abcd5678efgh
 *          description: Your API key
 *     tags:
 *     - teams
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *        description: Authorization information is missing or invalid.
 *        $ref: "#/components/responses/ErrorUnauthorized"
 *       404:
 *         description: No teams were found
 */
async function getHandler(req: NextApiRequest) {
  const { userId, prisma, isAdmin } = req;
  const where: Prisma.TeamWhereInput = {};
  // If user is not ADMIN, return only his data.
  if (!isAdmin) where.members = { some: { userId } };
  const data = await prisma.team.findMany({ where });
  return { teams: schemaTeamsReadPublic.parse(data) };
}

export default defaultResponder(getHandler);

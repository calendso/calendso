import type { NextApiRequest } from "next";

import { defaultResponder } from "@calcom/lib/server";

import { schemaAttendeeReadPublic } from "~/lib/validations/attendee";
import { schemaQueryIdParseInt } from "~/lib/validations/shared/queryIdTransformParseInt";

/**
 * @swagger
 * /attendees/{id}:
 *   get:
 *     operationId: getAttendeeById
 *     summary: Find an attendee
 *     parameters:
 *       - in: query
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *         example: 1234abcd5678efgh
 *         description: Your API key
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         example: 101
 *         required: true
 *         description: ID of the attendee to get
 *     tags:
 *     - attendees
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *        description: Authorization information is missing or invalid.
 *        $ref: "#/components/responses/ErrorUnauthorized"
 */
export async function getHandler(req: NextApiRequest) {
  const { prisma, query } = req;
  const { id } = schemaQueryIdParseInt.parse(query);
  const attendee = await prisma.attendee.findUnique({ where: { id } });
  return { attendee: schemaAttendeeReadPublic.parse(attendee) };
}

export default defaultResponder(getHandler);

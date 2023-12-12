import type { NextApiRequest } from "next";

import { defaultResponder } from "@calcom/lib/server";

import { schemaDestinationCalendarReadPublic } from "~/lib/validations/destination-calendar";
import { schemaQueryIdParseInt } from "~/lib/validations/shared/queryIdTransformParseInt";

/**
 * @swagger
 * /destination-calendars/{id}:
 *   get:
 *     summary: Find a destination calendar
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         example: 601
 *         required: true
 *         description: ID of the destination calendar to get
 *       - in: query
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *         example: 1234abcd5678efgh
 *         description: Your API key
 *     tags:
 *      - destination-calendars
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *        description: Authorization information is missing or invalid.
 *        $ref: "#/components/responses/ErrorUnauthorized"
 *       404:
 *         description: Destination calendar not found
 */
export async function getHandler(req: NextApiRequest) {
  const { prisma, query } = req;
  const { id } = schemaQueryIdParseInt.parse(query);

  const destinationCalendar = await prisma.destinationCalendar.findUnique({
    where: { id },
  });

  return { destinationCalendar: schemaDestinationCalendarReadPublic.parse({ ...destinationCalendar }) };
}

export default defaultResponder(getHandler);

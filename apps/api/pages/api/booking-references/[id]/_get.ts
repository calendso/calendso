import type { NextApiRequest } from "next";

import { defaultResponder } from "@calcom/lib/server";

import { schemaBookingReferenceReadPublic } from "~/lib/validations/booking-reference";
import { schemaQueryIdParseInt } from "~/lib/validations/shared/queryIdTransformParseInt";

/**
 * @swagger
 * /booking-references/{id}:
 *   get:
 *     operationId: getBookingReferenceById
 *     summary: Find a booking reference
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         example: 401
 *         required: true
 *         description: ID of the booking reference to get
 *       - in: query
 *         name: apiKey
 *         required: true
 *         schema:
 *           type: string
 *         example: 1234abcd5678efgh
 *         description: Your API key
 *     tags:
 *      - booking-references
 *     responses:
 *       200:
 *         description: OK
 *       401:
 *        description: Authorization information is missing or invalid.
 *        $ref: "#/components/responses/ErrorUnauthorized"
 *       404:
 *         description: BookingReference was not found
 */
export async function getHandler(req: NextApiRequest) {
  const { prisma, query } = req;
  const { id } = schemaQueryIdParseInt.parse(query);
  const booking_reference = await prisma.bookingReference.findUniqueOrThrow({ where: { id } });
  return { booking_reference: schemaBookingReferenceReadPublic.parse(booking_reference) };
}

export default defaultResponder(getHandler);

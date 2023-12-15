import type { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

import { DEFAULT_SCHEDULE, getAvailabilityFromSchedule } from "@calcom/lib/availability";
import { HttpError } from "@calcom/lib/http-error";
import { defaultResponder } from "@calcom/lib/server";

import { schemaCreateScheduleBodyParams, schemaSchedulePublic } from "~/lib/validations/schedule";

/**
 * @swagger
 * /schedules:
 *   post:
 *     operationId: addSchedule
 *     summary: Creates a new schedule
 *     parameters:
 *      - in: query
 *        name: apiKey
 *        schema:
 *          type: string
 *        required: true
 *        example: 1234abcd5678efgh
 *        description: Your API Key
 *     requestBody:
 *       description: Create a new schedule
 *       required: true
 *       content:
 *         application/json; charset=utf-8:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - timeZone
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the schedule
 *               timeZone:
 *                 type: string
 *                 description: The timeZone for this schedule
 *           examples:
 *             schedule:
 *               value:
 *                 {
 *                   "name": "Sample Schedule",
 *                   "timeZone": "Asia/Calcutta"
 *                 }
 *     tags:
 *     - schedules
 *     responses:
 *       201:
 *         description: OK, schedule created
 *         content:
 *           application/json; charset=utf-8:
 *             examples:
 *               schedule:
 *                 value:
 *                   {
 *                     "schedule": {
 *                       "id": 79471,
 *                       "userId": 182,
 *                       "name": "Total Testing",
 *                       "timeZone": "Asia/Calcutta",
 *                       "availability": [
 *                         {
 *                           "id": 337917,
 *                           "eventTypeId": null,
 *                           "days": [1, 2, 3, 4, 5],
 *                           "startTime": "09:00:00",
 *                           "endTime": "17:00:00"
 *                         }
 *                       ]
 *                     },
 *                     "message": "Schedule created successfully"
 *                   }
 *       400:
 *        description: Bad request. Schedule body is invalid.
 *       401:
 *        description: Authorization information is missing or invalid.
 *        $ref: "#/components/responses/ErrorUnauthorized"
 */

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, isAdmin, prisma } = req;
  const body = schemaCreateScheduleBodyParams.parse(req.body);
  let args: Prisma.ScheduleCreateArgs = { data: { ...body, userId } };

  /* If ADMIN we create the schedule for selected user */
  if (isAdmin && body.userId) args = { data: { ...body, userId: body.userId } };

  if (!isAdmin && body.userId)
    throw new HttpError({ statusCode: 403, message: "ADMIN required for `userId`" });

  // We create default availabilities for the schedule
  args.data.availability = {
    createMany: {
      data: getAvailabilityFromSchedule(DEFAULT_SCHEDULE).map((schedule) => ({
        days: schedule.days,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })),
    },
  };
  // We include the recently created availability
  args.include = { availability: true };

  const data = await prisma.schedule.create(args);

  res.status(201);

  return {
    schedule: schemaSchedulePublic.parse(data),
    message: "Schedule created successfully",
  };
}

export default defaultResponder(postHandler);

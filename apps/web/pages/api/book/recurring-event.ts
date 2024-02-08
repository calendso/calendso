import type { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { handleNewReccuringBooking } from "@calcom/features/bookings/lib/handleNewReccuringBooking";
import type { BookingResponse } from "@calcom/features/bookings/types";
import { checkRateLimitAndThrowError } from "@calcom/lib/checkRateLimitAndThrowError";
import getIP from "@calcom/lib/getIP";
import { defaultResponder } from "@calcom/lib/server";

// @TODO: Didn't look at the contents of this function in order to not break old booking page.

async function handler(req: NextApiRequest & { userId?: number }, res: NextApiResponse) {
  const userIp = getIP(req);

  await checkRateLimitAndThrowError({
    rateLimitingType: "core",
    identifier: userIp,
  });
  const session = await getServerSession({ req, res });
  req.userId = session?.user?.id || -1;
  const createdBookings: BookingResponse[] = await handleNewReccuringBooking(req);

  return createdBookings;
}

export const handleRecurringEventBooking = handler;

export default defaultResponder(handler);

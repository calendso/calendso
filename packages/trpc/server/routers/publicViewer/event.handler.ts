import { getPublicEvent } from "@calcom/features/eventtypes/lib/getPublicEvent";
import type { PrismaClient } from "@calcom/prisma";

import type { TEventInputSchema } from "./event.schema";

interface EventHandlerOptions {
  ctx: { prisma: PrismaClient };
  input: TEventInputSchema;
}

export const eventHandler = async ({ ctx, input }: EventHandlerOptions) => {
  const event = await getPublicEvent(
    input.username,
    input.eventSlug,
    input.isTeamEvent,
    input.org,
    input.isARedirectFromNonOrgLink,
    ctx.prisma
  );
  return event;
};

export default eventHandler;

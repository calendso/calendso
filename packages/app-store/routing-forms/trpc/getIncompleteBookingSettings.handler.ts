import type { PrismaClient } from "@calcom/prisma";
import { TRPCError } from "@calcom/trpc/server";
import type { TrpcSessionUser } from "@calcom/trpc/server/trpc";

import { enabledIncompleteBookingApps } from "../lib/enabledIncompleteBookingApps";
import type { TGetIncompleteBookingSettingsInputSchema } from "./getIncompleteBookingSettings.schema";

interface GetInCompleteBookingSettingsOptions {
  ctx: {
    prisma: PrismaClient;
    user: NonNullable<TrpcSessionUser>;
  };
  input: TGetIncompleteBookingSettingsInputSchema;
}

const getInCompleteBookingSettingsHandler = async (options: GetInCompleteBookingSettingsOptions) => {
  const {
    ctx: { prisma },
    input,
  } = options;

  const [incompleteBookingActions, form] = await Promise.all([
    prisma.app_RoutingForms_IncompleteBooking_Actions.findMany({
      where: {
        formId: input.formId,
      },
    }),
    prisma.app_RoutingForms_Form.findFirst({
      where: {
        id: input.formId,
      },
      select: {
        userId: true,
        teamId: true,
      },
    }),
  ]);

  if (!form) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Form not found",
    });
  }

  const teamId = form?.teamId;
  const userId = form.userId;

  if (teamId) {
    // Need to get the credentials for the team and org
    const orgQuery = await prisma.team.findFirst({
      where: {
        id: teamId,
      },
      select: {
        parentId: true,
      },
    });

    const credentials = await prisma.credential.findMany({
      where: {
        appId: {
          in: enabledIncompleteBookingApps,
        },
        teamId: {
          in: [teamId, ...(orgQuery?.parentId ? [orgQuery.parentId] : [])],
        },
      },
    });

    return { incompleteBookingActions, credentials };
  }

  if (userId) {
    const credentials = await prisma.credential.findMany({
      where: {
        appId: {
          in: enabledIncompleteBookingApps,
        },
        userId,
      },
    });

    return { incompleteBookingActions, credentials };
  }
};

export default getInCompleteBookingSettingsHandler;

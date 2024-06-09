import dayjs from "@calcom/dayjs";
import logger from "@calcom/lib/logger";
import type { PrismaClient } from "@calcom/prisma";

import { createWebhookSignature, jsonParse } from "./sendPayload";

export async function handleWebhookScheduledTriggers(prisma: PrismaClient) {
  await prisma.webhookScheduledTriggers.deleteMany({
    where: {
      startAfter: {
        lte: dayjs().subtract(1, "day").toDate(),
      },
    },
  });
  // get jobs that should be run
  const jobsToRun = await prisma.webhookScheduledTriggers.findMany({
    where: {
      startAfter: {
        lte: dayjs().toDate(),
      },
    },
    select: {
      id: true,
      jobName: true,
      legacyPayload: true,
      payload: true,
      subscriberUrl: true,
      webhook: {
        select: {
          secret: true,
        },
      },
    },
  });

  const fetchPromises: Promise<any>[] = [];

  // run jobs
  for (const job of jobsToRun) {
    // Fetch the webhook configuration so that we can get the secret.
    let webhook = job.webhook;

    // only needed to support old jobs that don't have the webhook relationship yet
    if (!webhook && job.jobName) {
      const [appId, subscriberId] = job.jobName.split("_");
      try {
        webhook = await prisma.webhook.findUniqueOrThrow({
          where: { id: subscriberId, appId: appId !== "null" ? appId : null },
        });
      } catch {
        logger.error(`Error finding webhook for subscriberId: ${subscriberId}, appId: ${appId}`);
      }
    }

    const headers: Record<string, string> = {
      "Content-Type":
        !job.payload || jsonParse(job.payload) ? "application/json" : "application/x-www-form-urlencoded",
    };

    const parsedLegacyPayload = jsonParse(job.legacyPayload);
    const parsedPayload = jsonParse(job.payload);

    const body = JSON.stringify({
      ...parsedLegacyPayload, // for ensures backward compatibility. Note: It also populate the triggerEvent which is part of the both actual and legacy payload
      ...(job.payload && {
        payload: parsedPayload,
        createdAt: new Date().toISOString(),
      }),
    });

    if (webhook) {
      headers["X-Cal-Signature-256"] = createWebhookSignature({ secret: webhook.secret, body });
    }

    fetchPromises.push(
      fetch(job.subscriberUrl, {
        method: "POST",
        body,
        headers,
      }).catch((error) => {
        console.error(`Webhook trigger for subscriber url ${job.subscriberUrl} failed with error: ${error}`);
      })
    );

    // clean finished job
    await prisma.webhookScheduledTriggers.delete({
      where: {
        id: job.id,
      },
    });
  }

  Promise.allSettled(fetchPromises);
}

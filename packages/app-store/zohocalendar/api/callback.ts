import type { NextApiRequest, NextApiResponse } from "next";
import { stringify } from "querystring";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import logger from "@calcom/lib/logger";
import { defaultHandler, defaultResponder } from "@calcom/lib/server";
import prisma from "@calcom/prisma";
import { Prisma } from "@calcom/prisma/client";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import { decodeOAuthState } from "../../_utils/oauth/decodeOAuthState";
import updateAppServerLocation from "../../_utils/updateAppServerLocation";
import config from "../config.json";
import type { ZohoAuthCredentials } from "../types/ZohoCalendar";
import { appKeysSchema as zohoKeysSchema } from "../zod";

const log = logger.getSubLogger({ prefix: [`[[zohocalendar/api/callback]`] });

function getOAuthBaseUrl(domain: string): string {
  return `https://accounts.zoho.${domain}/oauth/v2`;
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const { code, location } = req.query;

  const state = decodeOAuthState(req);

  if (code && typeof code !== "string") {
    res.status(400).json({ message: "`code` must be a string" });
    return;
  }

  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "You must be logged in to do this" });
  }

  if (location && typeof location === "string") {
    updateAppServerLocation(config.slug, location);
  }

  const appKeys = await getAppKeysFromSlug(config.slug);
  const { client_id, client_secret, server_location } = zohoKeysSchema.parse(appKeys);

  const params = {
    client_id,
    grant_type: "authorization_code",
    client_secret,
    redirect_uri: `${WEBAPP_URL}/api/integrations/${config.slug}/callback`,
    code,
  };

  const query = stringify(params);

  const response = await fetch(`${getOAuthBaseUrl(server_location || "com")}/token?${query}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  const responseBody = await JSON.parse(await response.text());

  if (!response.ok || responseBody.error) {
    log.error("get access_token failed", responseBody);
    return res.redirect(`/apps/installed?error=${JSON.stringify(responseBody)}`);
  }

  const key: ZohoAuthCredentials = {
    access_token: responseBody.access_token,
    refresh_token: responseBody.refresh_token,
    expires_in: Math.round(+new Date() / 1000 + responseBody.expires_in),
  };

  function getCalenderUri(domain: string): string {
    return `https://calendar.zoho.${domain}/api/v1/calendars`;
  }

  const calendarResponse = await fetch(getCalenderUri(server_location || "com"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${key.access_token}`,
      "Content-Type": "application/json",
    },
  });
  const data = await calendarResponse.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const primaryCalendar = data.calendars.find((calendar: any) => calendar.isdefault);

  if (primaryCalendar.uid) {
    const credential = await prisma.credential.create({
      data: {
        type: config.type,
        key,
        userId: req.session.user.id,
        appId: config.slug,
      },
    });
    // Wrapping in a try/catch to reduce chance of race conditions-
    // also this improves performance for most of the happy-paths.
    try {
      await prisma.selectedCalendar.create({
        data: {
          userId: req.session.user.id,
          integration: config.type,
          externalId: primaryCalendar.uid,
          credentialId: credential.id,
        },
      });
    } catch (error) {
      await prisma.credential.delete({ where: { id: credential.id } });
      let errorMessage = "something_went_wrong";
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        errorMessage = "account_already_linked";
      }
      res.redirect(
        `${
          getSafeRedirectUrl(state?.onErrorReturnTo) ??
          getInstalledAppPath({ variant: config.variant, slug: config.slug })
        }?error=${errorMessage}`
      );
      return;
    }
  }

  res.redirect(
    getSafeRedirectUrl(state?.returnTo) ?? getInstalledAppPath({ variant: config.variant, slug: config.slug })
  );
}

export default defaultHandler({
  GET: Promise.resolve({ default: defaultResponder(getHandler) }),
});

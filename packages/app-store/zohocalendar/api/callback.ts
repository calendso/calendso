import type { NextApiRequest, NextApiResponse } from "next";
import { stringify } from "querystring";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import logger from "@calcom/lib/logger";
import { defaultHandler, defaultResponder } from "@calcom/lib/server";
import prisma from "@calcom/prisma";

import { decodeOAuthState } from "../../_utils/decodeOAuthState";
import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import config from "../config.json";
import type { ZohoAuthCredentials } from "../types/ZohoCalendar";
import { appKeysSchema as zohoKeysSchema } from "../zod";

const log = logger.getChildLogger({ prefix: [`[[zohocalendar/api/callback]`] });

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  const state = decodeOAuthState(req);

  if (code && typeof code !== "string") {
    res.status(400).json({ message: "`code` must be a string" });
    return;
  }

  if (!req.session?.user?.id) {
    return res.status(401).json({ message: "You must be logged in to do this" });
  }

  const appKeys = await getAppKeysFromSlug(config.slug);
  const { client_id, client_secret } = zohoKeysSchema.parse(appKeys);

  const params = {
    client_id,
    grant_type: "authorization_code",
    client_secret,
    redirect_uri: `${WEBAPP_URL}/api/integrations/${config.slug}/callback`,
    code,
  };

  const query = stringify(params);

  const response = await fetch(`https://accounts.zoho.com/oauth/v2/token?${query}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  const responseBody = await response.json();
  console.log(responseBody);

  if (!response.ok || responseBody.error) {
    log.error("get access_token failed", responseBody);
    return res.redirect("/apps/installed?error=" + JSON.stringify(responseBody));
  }

  const key: ZohoAuthCredentials = {
    access_token: responseBody.access_token,
    refresh_token: responseBody.refresh_token,
    expires_in: Math.round(+new Date() / 1000 + responseBody.expires_in),
  };

  await prisma.credential.create({
    data: {
      type: config.type,
      key,
      userId: req.session.user.id,
      appId: config.slug,
    },
  });

  res.redirect(
    getSafeRedirectUrl(state?.returnTo) ?? getInstalledAppPath({ variant: config.variant, slug: config.slug })
  );
}

export default defaultHandler({
  GET: Promise.resolve({ default: defaultResponder(getHandler) }),
});

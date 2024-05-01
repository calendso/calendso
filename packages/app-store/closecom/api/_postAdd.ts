import type { NextApiRequest, NextApiResponse } from "next";

import { symmetricEncrypt } from "@calcom/lib/crypto";
import { HttpError } from "@calcom/lib/http-error";
import logger from "@calcom/lib/logger";
import { defaultResponder } from "@calcom/lib/server";
import prisma from "@calcom/prisma";
import type { AppCategories } from "@calcom/prisma/client";

import checkSession from "../../_utils/auth";
import getInstalledAppPath from "../../_utils/getInstalledAppPath";
import writeAppDataToEventType from "../../_utils/writeAppDataToEventType";
import appConfig from "../config.json";

export async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const session = checkSession(req);

  const { api_key } = req.body;
  if (!api_key) throw new HttpError({ statusCode: 400, message: "No Api Key provoided to check" });

  const encrypted = symmetricEncrypt(JSON.stringify({ api_key }), process.env.CALENDSO_ENCRYPTION_KEY || "");

  const data = {
    type: appConfig.type,
    key: { encrypted },
    userId: session.user?.id,
    appId: appConfig.slug,
  };

  try {
    const credential = await prisma.credential.create({
      data,
      select: {
        id: true,
      },
    });

    await writeAppDataToEventType({
      userId: req.session?.user.id,
      // TODO: add team installation
      appSlug: appConfig.slug,
      appCategories: appConfig.categories as AppCategories[],
      credentialId: credential.id,
    });
  } catch (reason) {
    logger.error("Could not add Close.com app", reason);
    return res.status(500).json({ message: "Could not add Close.com app" });
  }

  return res.status(200).json({
    url: req.query.returnTo ? req.query.returnTo : getInstalledAppPath({ variant: "crm", slug: "closecom" }),
  });
}

export default defaultResponder(getHandler);

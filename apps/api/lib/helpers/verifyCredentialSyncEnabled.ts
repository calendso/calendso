import type { NextMiddleware } from "next-api-middleware";

import { APP_CREDENTIAL_SHARING_ENABLED } from "@calcom/lib/constants";

export const verifyCredentialSyncEnabled: NextMiddleware = async (req, res, next) => {
  if (!APP_CREDENTIAL_SHARING_ENABLED) {
    return res.status(501).json({ error: "Credential syncing is not enabled" });
  }
  await next();
};

import { collectEvents } from "next-collect/server";
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextMiddleware, NextResponse } from "next/server";

import { extendEventData, nextCollectBasicSettings } from "@calcom/lib/telemetry";

const middleware: NextMiddleware = async (req) => {
  const url = req.nextUrl;

  /* TODO: Add logic to only redirect certain pages if `v2` cookie is present. */
  if (url.pathname.startsWith(`/settings/admin`)) {
    // rewrite to the current subdomain under the pages/sites folder
    url.pathname = `/v2${url.pathname}`;
  }

  return NextResponse.rewrite(url);
};

export default collectEvents({
  middleware,
  ...nextCollectBasicSettings,
  cookieName: "__clnds",
  extend: extendEventData,
});

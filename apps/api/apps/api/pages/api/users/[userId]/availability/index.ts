import { defaultHandler } from "@calcom/lib/server";

import { withMiddleware } from "~/lib/helpers/withMiddleware";

export default withMiddleware()(
  defaultHandler({
    GET: import("~/pages/api/availability/_get"),
  })
);

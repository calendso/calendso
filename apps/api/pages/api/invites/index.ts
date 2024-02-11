import { defaultHandler } from "@calcom/lib/server";

import { withMiddleware } from "~/lib/helpers/withMiddleware";

export default withMiddleware()(
  defaultHandler({
    POST: import("./_post"),
  })
);

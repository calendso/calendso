import { defaultHandler } from "@calcom/lib/server";

import { withMiddleware } from "../../middleware";

export default withMiddleware("verifyManagedSetupCompletionToken")(
  defaultHandler({
    POST: import("./_all"),
    DELETE: import("./_all"),
  })
);

import { _generateMetadata } from "app/_utils";

import Page from "@calcom/features/ee/organizations/pages/settings/general";

export const generateMetadata = async () =>
  await _generateMetadata(
    () => "",
    () => ""
  );

export default Page;

import { _generateMetadata } from "app/_utils";
import { WithLayout } from "app/layoutHOC";

import Page, { getLayout } from "@calcom/ee/organizations/pages/settings/attributes/attributes-list-view";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("attributes"),
    (t) => t("attribute_meta_description")
  );

export default WithLayout({ Page, getLayout });

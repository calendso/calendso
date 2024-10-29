import type { PageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";
import { WithLayout } from "app/layoutHOC";

import CreateNewView from "~/settings/platform/oauth-clients/create-new-view";

export const generateMetadata = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const p = { ...params, ...searchParams };
  const clientId = p?.clientId ?? "";
  return await _generateMetadata(
    () => `OAuth client ${!!clientId ? "updation" : "creation"} form`,
    () => ""
  );
};

export default WithLayout({
  getLayout: null,
  Page: CreateNewView,
});

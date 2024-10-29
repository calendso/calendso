import { withAppDirSsr } from "app/WithAppDirSsr";
import type { PageProps as _PageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";
import { WithLayout } from "app/layoutHOC";
import { cookies, headers } from "next/headers";

import { buildLegacyCtx } from "@lib/buildLegacyCtx";
import { getServerSideProps } from "@lib/team/[slug]/getServerSideProps";

import type { PageProps } from "~/team/team-view";
import TeamPage from "~/team/team-view";

export const generateMetadata = async (_props: _PageProps) => {
  const searchParams = await _props.searchParams;
  const params = await _props.params;
  const props = await getData(buildLegacyCtx(await headers(), await cookies(), params, searchParams));
  const teamName = props.team.name || "Nameless Team";

  return await _generateMetadata(
    () => teamName,
    () => teamName
  );
};

const getData = withAppDirSsr<PageProps>(getServerSideProps);

export default WithLayout({
  Page: TeamPage,
  getData,
  getLayout: null,
  isBookingPage: true,
})<"P">;

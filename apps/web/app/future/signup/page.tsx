import LegacyPage from "@pages/signup";
import { withAppDir } from "app/AppDirSSRHOC";
import { _generateMetadata } from "app/_utils";
import { WithLayout } from "app/layoutHOC";

import { getServerSideProps } from "@server/lib/signup/getServerSideProps";

export const generateMetadata = async () =>
  await _generateMetadata(
    (t) => t("sign_up"),
    (t) => t("sign_up")
  );

export default WithLayout({
  Page: LegacyPage,
  getLayout: null,
  getData: withAppDir(getServerSideProps),
})<"P">;

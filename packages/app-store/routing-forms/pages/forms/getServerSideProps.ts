import type { GetServerSidePropsContext } from "next";

import { getTeamsFiltersFromQuery } from "@calcom/features/filters/lib/getTeamsFiltersFromQuery";
import type { AppGetServerSidePropsContext } from "@calcom/types/AppGetServerSideProps";

import { ssrInit } from "@server/lib/ssr";

export const getServerSideProps = async function getServerSideProps(context: GetServerSidePropsContext) {
  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/login",
      },
    };
  }
  const ssr = await ssrInit(context);

  const filters = getTeamsFiltersFromQuery(context.query);

  await ssr.viewer.appRoutingForms.forms.prefetch({
    filters,
  });
  // Prefetch this so that New Button is immediately available
  await ssr.viewer.teamsAndUserProfilesQuery.prefetch();
  return {
    props: {
      trpcState: await ssr.dehydrate(),
    },
  };
};

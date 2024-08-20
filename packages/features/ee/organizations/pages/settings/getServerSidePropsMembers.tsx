import type { GetServerSidePropsContext } from "next";

import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";
import type { inferSSRProps } from "@calcom/types/inferSSRProps";

export type PageProps = inferSSRProps<typeof getServerSidePropsForMembers>;

export const getServerSidePropsForMembers = async function getServerSidePropsForMembers({
  req,
  res,
}: GetServerSidePropsContext) {
  const session = await getServerSession({ req, res });

  if (!session || !session.user) {
    return {
      redirect: {
        permanent: false,
        destination: "/auth/login",
      },
    };
  }

  if (!session.user.org?.id) {
    return {
      redirect: {
        permanent: false,
        destination: "/enterprise",
      },
    };
  }

  return {
    props: {},
  };
};

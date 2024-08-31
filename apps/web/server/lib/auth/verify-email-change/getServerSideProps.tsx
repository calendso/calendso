import type { GetServerSidePropsContext } from "next";
import { z } from "zod";

import { WEBAPP_URL } from "@calcom/lib/constants";

export interface PageProps {
  token: string;
  updateSession: string;
  updatedEmail: string;
}

const tokenSchema = z.object({
  token: z.string(),
});

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { token } = tokenSchema.parse(context.query);

  if (!token) {
    return {
      notFound: true,
    };
  }

  const params = new URLSearchParams({
    token,
  });

  const response = await fetch(`${WEBAPP_URL}/api/auth/verify-email?${params.toString()}`, {
    method: "POST",
  });

  if (!response.ok) {
    return {
      props: {
        updateSession: false,
        token,
        updatedEmail: false,
      },
    };
  }

  const data = await response.json();

  return {
    props: {
      updateSession: true,
      token,
      updatedEmail: data.updatedEmail ?? null,
    },
  };
}

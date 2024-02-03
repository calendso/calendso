"use client";

import type { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { z } from "zod";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { Loader, showToast } from "@calcom/ui";

import PageWrapper from "@components/PageWrapper";

interface PageProps {
  token: string;
  updateSession: string;
  updatedEmail: string;
}

function VerifyEmailChange(props: PageProps) {
  const { update } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function updateSession() {
      await update({ email: props.updatedEmail });
      router.push("/event-types");
    }
    if (props.updateSession) {
      updateSession();
      showToast(`Updating email to ${props.updatedEmail}.`, "success");
    }
    // We only need this to run on inital mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Toaster position="bottom-right" />
      <Loader />
    </div>
  );
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

  // Fetch data based on `slug` from your API or any data source
  const response = await fetch(`${WEBAPP_URL}/api/auth/verify-email?${params.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    return {
      props: {
        updateSession: false,
        token,
        updatedEmail: false,
      },
    };
  }

  console.log({
    data: {
      updateSession: true,
      token,
      updatedEmail: data.updatedEmail ?? null,
    },
  });

  return {
    props: {
      updateSession: true,
      token,
      updatedEmail: data.updatedEmail ?? null,
    },
  };
}

export default VerifyEmailChange;
VerifyEmailChange.PageWrapper = PageWrapper;

import type { IncomingMessage } from "http";
import type { AppContextType } from "next/dist/shared/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect } from "react";

import { trpc } from "@calcom/trpc/react";

import type { AppProps } from "@lib/app-providers";

import "../styles/globals.css";

function MyApp(props: AppProps) {
  const router = useRouter();
  const { Component, pageProps } = props;
  const pathName = usePathname();

  const isPlatformUser = pageProps?.session?.isPlatformUser;

  useEffect(() => {
    if (isPlatformUser === true && pathName && !pathName.startsWith("/settings/platform")) {
      return router.replace("/settings/platform");
    }
  }, [isPlatformUser, pathName, router]);

  if (Component.PageWrapper !== undefined) return Component.PageWrapper(props);
  return <Component {...pageProps} />;
}

declare global {
  interface Window {
    calNewLocale: string;
  }
}

MyApp.getInitialProps = async (ctx: AppContextType) => {
  const { req } = ctx.ctx;

  let newLocale = "en";

  if (req) {
    const { getLocale } = await import("@calcom/features/auth/lib/getLocale");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newLocale = await getLocale(req as IncomingMessage & { cookies: Record<string, any> });
  } else if (typeof window !== "undefined" && window.calNewLocale) {
    newLocale = window.calNewLocale;
  }

  return {
    pageProps: {
      newLocale,
    },
  };
};

const WrappedMyApp = trpc.withTRPC(MyApp);

export default WrappedMyApp;

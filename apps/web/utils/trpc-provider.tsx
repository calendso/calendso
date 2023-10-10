"use client";

import { QueryClient, QueryClientProvider, Hydrate } from "@tanstack/react-query";
import { trpc } from "app/_trpc/client";
import { useState } from "react";
import superjson from "superjson";

import { httpBatchLink } from "@calcom/trpc/client/links/httpBatchLink";
import { httpLink } from "@calcom/trpc/client/links/httpLink";
import { loggerLink } from "@calcom/trpc/client/links/loggerLink";
import { splitLink } from "@calcom/trpc/client/links/splitLink";

const ENDPOINTS = [
  "admin",
  "apiKeys",
  "appRoutingForms",
  "apps",
  "auth",
  "availability",
  "appBasecamp3",
  "bookings",
  "deploymentSetup",
  "eventTypes",
  "features",
  "insights",
  "payments",
  "public",
  "saml",
  "slots",
  "teams",
  "organizations",
  "users",
  "viewer",
  "webhook",
  "workflows",
  "appsRouter",
  "googleWorkspace",
] as const;
export type Endpoint = (typeof ENDPOINTS)[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolveEndpoint = (links: any) => {
  // TODO: Update our trpc routes so they are more clear.
  // This function parses paths like the following and maps them
  // to the correct API endpoints.
  // - viewer.me - 2 segment paths like this are for logged in requests
  // - viewer.public.i18n - 3 segments paths can be public or authed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (ctx: any) => {
    const parts = ctx.op.path.split(".");
    let endpoint;
    let path = "";
    if (parts.length == 2) {
      endpoint = parts[0] as keyof typeof links;
      path = parts[1];
    } else {
      endpoint = parts[1] as keyof typeof links;
      path = parts.splice(2, parts.length - 2).join(".");
    }
    return links[endpoint]({ ...ctx, op: { ...ctx.op, path } });
  };
};

export const TrpcProvider: React.FC<{ children: React.ReactNode; pageProps: any }> = ({
  children,
  pageProps,
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 5000 } },
      })
  );
  const url =
    typeof window !== "undefined"
      ? "/api/trpc"
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/trpc`
      : `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/trpc`;

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            !!process.env.NEXT_PUBLIC_DEBUG || (opts.direction === "down" && opts.result instanceof Error),
        }),
        splitLink({
          // check for context property `skipBatch`
          condition: (op) => !!op.context.skipBatch,
          // when condition is true, use normal request
          true: (runtime) => {
            const links = Object.fromEntries(
              ENDPOINTS.map((endpoint) => [
                endpoint,
                httpLink({
                  url: url + "/" + endpoint,
                })(runtime),
              ])
            );
            return resolveEndpoint(links);
          },
          // when condition is false, use batch request
          false: (runtime) => {
            const links = Object.fromEntries(
              ENDPOINTS.map((endpoint) => [
                endpoint,
                httpBatchLink({
                  url: url + "/" + endpoint,
                })(runtime),
              ])
            );
            return resolveEndpoint(links);
          },
        }),
      ],
      transformer: superjson,
    })
  );

  const hydratedState = trpc.useDehydratedState(trpcClient, pageProps?.trpcState);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={hydratedState}>{children}</Hydrate>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

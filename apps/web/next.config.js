require("dotenv").config({ path: "../../.env" });
const CopyWebpackPlugin = require("copy-webpack-plugin");
const os = require("os");
const englishTranslation = require("./public/static/locales/en/common.json");
const { withAxiom } = require("next-axiom");
const { i18n } = require("./next-i18next.config");
const {
  orgHostPath,
  orgUserRoutePath,
  orgUserTypeRoutePath,
  orgUserTypeEmbedRoutePath,
} = require("./pagesAndRewritePaths");

if (!process.env.NEXTAUTH_SECRET) throw new Error("Please set NEXTAUTH_SECRET");
if (!process.env.CALENDSO_ENCRYPTION_KEY) throw new Error("Please set CALENDSO_ENCRYPTION_KEY");

// So we can test deploy previews preview
if (process.env.VERCEL_URL && !process.env.NEXT_PUBLIC_WEBAPP_URL) {
  process.env.NEXT_PUBLIC_WEBAPP_URL = "https://" + process.env.VERCEL_URL;
}
// Check for configuration of NEXTAUTH_URL before overriding
if (!process.env.NEXTAUTH_URL && process.env.NEXT_PUBLIC_WEBAPP_URL) {
  process.env.NEXTAUTH_URL = process.env.NEXT_PUBLIC_WEBAPP_URL + "/api/auth";
}
if (!process.env.NEXT_PUBLIC_WEBSITE_URL) {
  process.env.NEXT_PUBLIC_WEBSITE_URL = process.env.NEXT_PUBLIC_WEBAPP_URL;
}
if (
  process.env.CSP_POLICY === "strict" &&
  (process.env.CALCOM_ENV === "production" || process.env.NODE_ENV === "production")
) {
  throw new Error(
    "Strict CSP policy(for style-src) is not yet supported in production. You can experiment with it in Dev Mode"
  );
}

if (!process.env.EMAIL_FROM) {
  console.warn(
    "\x1b[33mwarn",
    "\x1b[0m",
    "EMAIL_FROM environment variable is not set, this may indicate mailing is currently disabled. Please refer to the .env.example file."
  );
}

if (!process.env.NEXTAUTH_URL) throw new Error("Please set NEXTAUTH_URL");

const validJson = (jsonString) => {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
};

if (process.env.GOOGLE_API_CREDENTIALS && !validJson(process.env.GOOGLE_API_CREDENTIALS)) {
  console.warn(
    "\x1b[33mwarn",
    "\x1b[0m",
    '- Disabled \'Google Calendar\' integration. Reason: Invalid value for GOOGLE_API_CREDENTIALS environment variable. When set, this value needs to contain valid JSON like {"web":{"client_id":"<clid>","client_secret":"<secret>","redirect_uris":["<yourhost>/api/integrations/googlecalendar/callback>"]}. You can download this JSON from your OAuth Client @ https://console.cloud.google.com/apis/credentials.'
  );
}

const informAboutDuplicateTranslations = () => {
  const valueSet = new Set();

  for (const key in englishTranslation) {
    if (valueSet.has(englishTranslation[key])) {
      console.warn("\x1b[33mDuplicate value found in:", "\x1b[0m", key);
    } else {
      valueSet.add(englishTranslation[key]);
    }
  }
};

informAboutDuplicateTranslations();
const plugins = [];
if (process.env.ANALYZE === "true") {
  // only load dependency if env `ANALYZE` was set
  const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: true,
  });
  plugins.push(withBundleAnalyzer);
}

plugins.push(withAxiom);
const matcherConfigRootPath = {
  has: [
    {
      type: "host",
      value: orgHostPath,
    },
  ],
  source: "/",
};

const matcherConfigUserRoute = {
  has: [
    {
      type: "host",
      value: orgHostPath,
    },
  ],
  source: orgUserRoutePath,
};

const matcherConfigUserTypeRoute = {
  has: [
    {
      type: "host",
      value: orgHostPath,
    },
  ],
  source: orgUserTypeRoutePath,
};

const matcherConfigUserTypeEmbedRoute = {
  has: [
    {
      type: "host",
      value: orgHostPath,
    },
  ],
  source: orgUserTypeEmbedRoutePath,
};

/** @type {import("next").NextConfig} */
const nextConfig = {
  i18n: {
    ...i18n,
    localeDetection: false,
  },
  productionBrowserSourceMaps: true,
  /* We already do type check on GH actions */
  typescript: {
    ignoreBuildErrors: !!process.env.CI,
  },
  /* We already do linting on GH actions */
  eslint: {
    ignoreDuringBuilds: !!process.env.CI,
  },
  transpilePackages: [
    "@calcom/app-store",
    "@calcom/core",
    "@calcom/dayjs",
    "@calcom/emails",
    "@calcom/embed-core",
    "@calcom/embed-react",
    "@calcom/embed-snippet",
    "@calcom/features",
    "@calcom/lib",
    "@calcom/prisma",
    "@calcom/trpc",
    "@calcom/ui",
    "lucide-react",
  ],
  modularizeImports: {
    "@calcom/ui/components/icon": {
      transform: "lucide-react/dist/esm/icons/{{ kebabCase member }}",
      preventFullImport: true,
    },
    "@calcom/features/insights/components": {
      transform: "@calcom/features/insights/components/{{member}}",
      skipDefaultConversion: true,
      preventFullImport: true,
    },
    lodash: {
      transform: "lodash/{{member}}",
    },
    // TODO: We need to have all components in `@calcom/ui/components` in order to use this
    // "@calcom/ui": {
    //   transform: "@calcom/ui/components/{{member}}",
    // },
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { webpack, buildId }) => {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "../../packages/app-store/**/static/**",
            to({ context, absoluteFilename }) {
              // Adds compatibility for windows path
              if (os.platform() === "win32") {
                const absoluteFilenameWin = absoluteFilename.replaceAll("\\", "/");
                const contextWin = context.replaceAll("\\", "/");
                const appName = /app-store\/(.*)\/static/.exec(absoluteFilenameWin);
                return Promise.resolve(`${contextWin}/public/app-store/${appName[1]}/[name][ext]`);
              }
              const appName = /app-store\/(.*)\/static/.exec(absoluteFilename);
              return Promise.resolve(`${context}/public/app-store/${appName[1]}/[name][ext]`);
            },
          },
        ],
      })
    );

    config.plugins.push(new webpack.DefinePlugin({ "process.env.BUILD_ID": JSON.stringify(buildId) }));

    config.resolve.fallback = {
      ...config.resolve.fallback, // if you miss it, all the other options in fallback, specified
      // by next.js will be dropped. Doesn't make much sense, but how it is
      fs: false,
    };

    /**
     * TODO: Find more possible barrels for this project.
     *  @see https://github.com/vercel/next.js/issues/12557#issuecomment-1196931845
     **/
    config.module.rules.push({
      test: [/lib\/.*.tsx?/i],
      sideEffects: false,
    });

    return config;
  },
  async rewrites() {
    const beforeFiles = [
      // These rewrites are other than booking pages rewrites and so that they aren't redirected to org pages ensure that they happen in beforeFiles
      ...(process.env.ORGANIZATIONS_ENABLED
        ? [
            {
              ...matcherConfigRootPath,
              destination: "/team/:orgSlug",
            },
            {
              ...matcherConfigUserRoute,
              destination: "/org/:orgSlug/:user",
            },
            {
              ...matcherConfigUserTypeRoute,
              destination: "/org/:orgSlug/:user/:type",
            },
            {
              ...matcherConfigUserTypeEmbedRoute,
              destination: "/org/:orgSlug/:user/:type/embed",
            },
          ]
        : []),
    ];

    let afterFiles = [
      {
        source: "/org/:slug",
        destination: "/team/:slug",
      },
      {
        source: "/team/:teamname/avatar.png",
        destination: "/api/user/avatar?teamname=:teamname",
      },

      // When updating this also update pagesAndRewritePaths.js
      ...[
        {
          source: "/:user/avatar.png",
          destination: "/api/user/avatar?username=:user",
        },
        {
          source: "/forms/:formQuery*",
          destination: "/apps/routing-forms/routing-link/:formQuery*",
        },
        {
          source: "/router",
          destination: "/apps/routing-forms/router",
        },
        {
          source: "/success/:path*",
          has: [
            {
              type: "query",
              key: "uid",
              value: "(?<uid>.*)",
            },
          ],
          destination: "/booking/:uid/:path*",
        },
        {
          source: "/cancel/:path*",
          destination: "/booking/:path*",
        },
      ],

      /* TODO: have these files being served from another deployment or CDN {
        source: "/embed/embed.js",
        destination: process.env.NEXT_PUBLIC_EMBED_LIB_URL?,
      }, */
    ];

    return {
      beforeFiles,
      afterFiles,
    };
  },
  async headers() {
    return [
      {
        source: "/auth/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
      {
        source: "/signup",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      ...[
        {
          ...matcherConfigRootPath,
          headers: [
            {
              key: "X-Cal-Org-path",
              value: "/team/:orgSlug",
            },
          ],
        },
        {
          ...matcherConfigUserRoute,
          headers: [
            {
              key: "X-Cal-Org-path",
              value: "/org/:orgSlug/:user",
            },
          ],
        },
        {
          ...matcherConfigUserTypeRoute,
          headers: [
            {
              key: "X-Cal-Org-path",
              value: "/org/:orgSlug/:user/:type",
            },
          ],
        },
        {
          ...matcherConfigUserTypeEmbedRoute,
          headers: [
            {
              key: "X-Cal-Org-path",
              value: "/org/:orgSlug/:user/:type/embed",
            },
          ],
        },
      ],
    ];
  },
  async redirects() {
    const redirects = [
      {
        source: "/api/app-store/:path*",
        destination: "/app-store/:path*",
        permanent: true,
      },
      {
        source: "/auth/signup",
        destination: "/signup",
        permanent: true,
      },
      {
        source: "/auth",
        destination: "/auth/login",
        permanent: false,
      },
      {
        source: "/settings",
        destination: "/settings/my-account/profile",
        permanent: true,
      },
      {
        source: "/settings/teams",
        destination: "/teams",
        permanent: true,
      },
      {
        source: "/settings/admin",
        destination: "/settings/admin/flags",
        permanent: true,
      },
      /* V2 testers get redirected to the new settings */
      {
        source: "/settings/profile",
        destination: "/settings/my-account/profile",
        permanent: false,
      },
      {
        source: "/settings/security",
        destination: "/settings/security/password",
        permanent: false,
      },
      {
        source: "/bookings",
        destination: "/bookings/upcoming",
        permanent: true,
      },
      {
        source: "/call/:path*",
        destination: "/video/:path*",
        permanent: false,
      },
      /* Attempt to mitigate DDoS attack */
      {
        source: "/api/auth/:path*",
        has: [
          {
            type: "query",
            key: "callbackUrl",
            // prettier-ignore
            value: "^(?!https?:\/\/).*$",
          },
        ],
        destination: "/404",
        permanent: false,
      },
      {
        source: "/booking/direct/:action/:email/:bookingUid/:oldToken",
        destination: "/api/link?action=:action&email=:email&bookingUid=:bookingUid&oldToken=:oldToken",
        permanent: true,
      },
      {
        source: "/support",
        destination: "/event-types?openIntercom=true",
        permanent: true,
      },
      {
        source: "/apps/categories/video",
        destination: "/apps/categories/conferencing",
        permanent: true,
      },
      {
        source: "/apps/installed/video",
        destination: "/apps/installed/conferencing",
        permanent: true,
      },
      // OAuth callbacks when sent to localhost:3000(w would be expected) should be redirected to corresponding to WEBAPP_URL
      ...(process.env.NODE_ENV === "development" &&
      // Safer to enable the redirect only when the user is opting to test out organizations
      process.env.ORGANIZATIONS_ENABLED &&
      // Prevent infinite redirect by checking that we aren't already on localhost
      process.env.NEXT_PUBLIC_WEBAPP_URL !== "http://localhost:3000"
        ? [
            {
              has: [
                {
                  type: "header",
                  key: "host",
                  value: "localhost:3000",
                },
              ],
              source: "/api/integrations/:args*",
              destination: `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/integrations/:args*`,
              permanent: false,
            },
          ]
        : []),
    ];

    if (process.env.NEXT_PUBLIC_WEBAPP_URL === "https://app.cal.com") {
      redirects.push(
        {
          source: "/apps/dailyvideo",
          destination: "/apps/daily-video",
          permanent: true,
        },
        {
          source: "/apps/huddle01_video",
          destination: "/apps/huddle01",
          permanent: true,
        },
        {
          source: "/apps/jitsi_video",
          destination: "/apps/jitsi",
          permanent: true,
        }
      );
    }

    return redirects;
  },
};

module.exports = () => plugins.reduce((acc, next) => next(acc), nextConfig);

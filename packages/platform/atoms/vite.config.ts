import react from "@vitejs/plugin-react-swc";
import path from "path";
import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import dts from "vite-plugin-dts";
import Inspect from "vite-plugin-inspect";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    optimizeDeps: {
      include: [
        "@calcom/lib",
        "@calcom/features",
        "@calcom/prisma",
        "@calcom/dayjs",
        "@calcom/platform-constants",
        "@calcom/platform-types",
        "@calcom/platform-utils",
      ],
    },
    plugins: [
      nodePolyfills({ include: ["http", "crypto"] }),
      Inspect(),
      react(),
      dts({ insertTypesEntry: true }),
    ],
    define: {
      "process.env.NEXT_PUBLIC_WEBAPP_URL":
        JSON.stringify(env.NEXT_PUBLIC_WEBAPP_URL) ?? "https://app.cal.com",
    },
    build: {
      commonjsOptions: {
        include: [/@calcom\/lib/, /@calcom\/features/, /node_modules/],
      },
      lib: {
        entry: [resolve(__dirname, "index.ts")],
        name: "CalAtoms",
        fileName: "cal-atoms",
      },
      rollupOptions: {
        external: ["react", "fs", "path", "os", "react-dom"],
        output: {
          globals: {
            react: "React",
            "react-dom": "ReactDOM",
          },
        },
      },
    },
    resolve: {
      alias: {
        fs: resolve("../../../node_modules/rollup-plugin-node-builtins"),
        path: resolve("../../../node_modules/rollup-plugin-node-builtins"),
        os: resolve("../../../node_modules/rollup-plugin-node-builtins"),
        "@": path.resolve(__dirname, "./src"),
        ".prisma/client": path.resolve(__dirname, "../../prisma-client"),
        "@prisma/client": path.resolve(__dirname, "../../prisma-client"),
        "@calcom/prisma": path.resolve(__dirname, "../../prisma"),
        "@calcom/dayjs": path.resolve(__dirname, "../../dayjs"),
        "@calcom/platform-constants": path.resolve(__dirname, "../constants/index.ts"),
        "@calcom/platform-types/monorepo": path.resolve(__dirname, "../types/monorepo.ts"),
        "@calcom/platform-types": path.resolve(__dirname, "../types/index.ts"),
        "@calcom/platform-utils": path.resolve(__dirname, "../constants/index.ts"),
        "@calcom/web/public/static/locales/en/common.json": path.resolve(
          __dirname,
          "../../../apps/web/public/static/locales/en/common.json"
        ),
      },
    },
  };
});

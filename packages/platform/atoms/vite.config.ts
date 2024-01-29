import react from "@vitejs/plugin-react";
import path from "path";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: [resolve(__dirname, "components.ts")],
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
      "@calcom/lib": path.resolve(__dirname, "../../lib"),
    },
  },
});

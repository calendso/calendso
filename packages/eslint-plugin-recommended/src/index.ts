/* eslint-disable @typescript-eslint/no-var-requires*/
import type { ESLint } from "eslint";

export default {
  "my-first-rule": require("./rules/my-first-rule").default,
  "deprecated-imports": require("./rules/deprecated-imports").default,
} as ESLint.Plugin["rules"];

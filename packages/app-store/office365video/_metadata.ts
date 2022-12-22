import type { AppMeta } from "@calcom/types/App";

import config from "./config.json";

export const metadata = {
  dirName: "office365video",
  ...config,
} as AppMeta;

export default metadata;

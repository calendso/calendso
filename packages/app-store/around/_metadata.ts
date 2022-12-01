import { APP_NAME, SUPPORT_MAIL_ADDRESS } from "@calcom/lib/constants";
import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  category: "other",
  appData: {
    location: {
      linkType: "static",
      type: "integrations:around_video",
      label: "Around Video",
      urlRegExp: "^http(s)?:\\/\\/(www\\.)?around.co\\/[a-zA-Z0-9]*",
      organizerInputPlaceholder: "https://www.around.co/rick",
    },
  },
  "/*": "Don't modify slug - If required, do it using cli edit command",
  name: "Around",
  title: "Around",
  slug: "around",
  type: "around_video",
  imageSrc: "/api/app-store/around/icon.svg",
  logo: "/api/app-store/around/icon.svg",
  url: "https://cal.com/apps/around",
  variant: "conferencing",
  categories: ["video"],
  publisher: APP_NAME,
  email: SUPPORT_MAIL_ADDRESS,
  description:
    "Discover radically unique video calls designed to help hybrid-remote teams create, collaborate and celebrate together.",
  __createdUsingCli: true,
} as AppMeta;

export default metadata;

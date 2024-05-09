import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  "/*": "Don't modify slug - If required, do it using cli edit command",
  name: "Around",
  title: "Around",
  slug: "around",
  type: "around_video",
  logo: "icon.svg",
  url: "https://cal.com/",
  variant: "conferencing",
  categories: ["conferencing"],
  publisher: "Cal.com",
  email: "help@cal.com",
  description:
    "Discover radically unique video calls designed to help hybrid-remote teams create, collaborate and celebrate together.",
  __createdUsingCli: true,
  appData: {
    location: {
      linkType: "static",
      type: "integrations:around_video",
      label: "Around Video",
      urlRegExp: "^http(s)?:\\/\\/(www\\.)?around.co\\/[a-zA-Z0-9]*",
      organizerInputPlaceholder: "https://www.around.co/rick",
    },
  },
} as AppMeta;

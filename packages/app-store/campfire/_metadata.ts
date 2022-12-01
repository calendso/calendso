import { APP_NAME, SUPPORT_MAIL_ADDRESS } from "@calcom/lib/constants";
import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  category: "other",
  "/*": "Don't modify slug - If required, do it using cli edit command",
  name: "Campfire",
  slug: "campfire",
  type: "campfire_video",
  imageSrc: "/api/app-store/campfire/icon.svg",
  logo: "/api/app-store/campfire/icon.svg",
  url: "https://cal.com/apps/campfire",
  variant: "conferencing",
  categories: ["video"],
  publisher: APP_NAME,
  email: SUPPORT_MAIL_ADDRESS,
  description:
    "Feel connected with your remote team. Team events, new hire onboardings, coffee chats, all on Campfire. No more awkward Zoom calls.\r\r",
  __createdUsingCli: true,
  appData: {
    location: {
      type: "integrations:campfire_video",
      label: "Campfire",
      linkType: "static",
      organizerInputPlaceholder: "https://party.campfire.to/your-team",
      urlRegExp: "^http(s)?:\\/\\/(www\\.)?party.campfire.to\\/[a-zA-Z0-9]*",
    },
  },
} as AppMeta;

export default metadata;

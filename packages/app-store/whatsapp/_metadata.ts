import { APP_NAME, SUPPORT_MAIL_ADDRESS } from "@calcom/lib/constants";
import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  category: "other",
  "/*": "Don't modify slug - If required, do it using cli edit command",
  name: "WhatsApp",
  slug: "whatsapp",
  type: "whatsapp_video",
  imageSrc: "/api/app-store/whatsapp/icon.svg",
  logo: "/api/app-store/whatsapp/icon.svg",
  url: "https://cal.com/apps/whatsapp",
  variant: "conferencing",
  categories: ["video"],
  publisher: APP_NAME,
  email: SUPPORT_MAIL_ADDRESS,
  description: "Schedule a chat with your guests or have a WhatsApp Video call.",
  extendsFeature: "User",
  __createdUsingCli: true,
  appData: {
    location: {
      type: "integrations:whatsapp_video",
      label: "WhatsApp",
      linkType: "static",
      organizerInputPlaceholder: "https://wa.me/send?phone=1234567890",
      urlRegExp: "^http(s)?:\\/\\/(www\\.)?wa.me\\/[a-zA-Z0-9]*",
    },
  },
} as AppMeta;

export default metadata;

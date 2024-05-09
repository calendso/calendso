import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  "/*": "Don't modify slug - If required, do it using cli edit command",
  name: "Discord",
  slug: "discord",
  type: "discord_video",
  logo: "icon.svg",
  url: "https://discord.com/",
  variant: "conferencing",
  categories: ["conferencing"],
  publisher: "Cal.com, Inc.",
  email: "support@cal.com",
  appData: {
    location: {
      type: "integrations:{SLUG}_video",
      label: "{TITLE}",
      linkType: "static",
      organizerInputPlaceholder: "https://discord.gg/420gg69",
      urlRegExp: "^http(s)?:\\/\\/(www\\.)?discord\\.(gg|com)\\/[a-zA-Z0-9]+",
    },
  },
  description:
    "Copy your server invite link and start scheduling calls in Discord! Discord is a VoIP and instant messaging social platform. Users have the ability to communicate with voice calls, video calls, text messaging, media and files in private chats or as part of communities.",
  isTemplate: false,
  __createdUsingCli: true,
  __template: "event-type-location-video-static",
} as AppMeta;

import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  "/*": "Don't modify slug - If required, do it using cli edit command",
  name: "Demodesk",
  slug: "demodesk",
  type: "demodesk_conferencing",
  logo: "icon.svg",
  url: "https://demodesk.com",
  variant: "conferencing",
  categories: ["conferencing"],
  publisher: "Cal.com, Inc.",
  email: "support@cal.com",
  appData: {
    location: {
      type: "integrations:{SLUG}_video",
      label: "{TITLE}",
      linkType: "static",
      organizerInputPlaceholder: "https://demodesk.com/meet/mylink",
      urlRegExp: "^http(s)?:\\/\\/(www\\.)?demodesk.com\\/[a-zA-Z0-9]*",
    },
  },
  description:
    "Run Professional Video Meetings, Coach Sales Teams in Real-Time with AI, And Schedule Meetings on Auto-Pilot. 100% GDPR Compliant, Enterprise Ready.",
  isTemplate: false,
  __createdUsingCli: true,
  __template: "event-type-location-video-static",
} as AppMeta;

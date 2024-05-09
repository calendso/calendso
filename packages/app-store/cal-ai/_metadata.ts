import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  "/*": "Don't modify slug - If required, do it using cli edit command",
  name: "Cal.ai",
  slug: "cal-ai",
  type: "cal-ai_automation",
  logo: "icon.png",
  url: "https://cal.ai",
  variant: "automation",
  categories: ["automation"],
  publisher: "Cal.com, Inc.",
  email: "support@cal.com",
  description:
    "Cal.ai is your AI scheduling assistant. Get your personal email assistant (username@cal.ai) that you can forward emails to or have a conversation with. Cal.ai will automatically schedule meetings for you.",
  isTemplate: false,
  __createdUsingCli: true,
  __template: "basic",
  dirName: "cal-ai",
  paid: {
    priceInUsd: 8,
    priceId: "price_1O1ziDH8UDiwIftkDHp3MCTP",
    mode: "subscription",
  },
} as AppMeta;

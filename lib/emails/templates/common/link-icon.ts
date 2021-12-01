import { IS_PRODUCTION, BASE_URL } from "@lib/config/constants";

export const linkIcon = (): string => {
  return IS_PRODUCTION ? BASE_URL + "/emails/linkIcon.png" : "https://i.imgur.com/rKsIBcc.png";
};

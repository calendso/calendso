import { createContext, useContext } from "react";

import type { translationKeys, CalProverLanguagesType } from "../cal-provider/CalProvider";
import type http from "../lib/http";

export interface IAtomsContextOptions {
  refreshUrl?: string;
  apiUrl: string;
}

export interface IAtomsContext {
  clientId: string;
  accessToken?: string;
  options: IAtomsContextOptions;
  error?: string;
  getClient: () => typeof http | void;
  refreshToken?: string;
  isRefreshing?: boolean;
  isAuth: boolean;
  isValidClient: boolean;
  isInit: boolean;
  t: (key: string, values: Record<string, string | number | undefined | null>) => string;
  i18n: {
    language: CalProverLanguagesType;
    defaultLocale: CalProverLanguagesType;
    locales: CalProverLanguagesType[];
    exists: (key: translationKeys | string) => boolean;
  };
}

export const AtomsContext = createContext({
  clientId: "",
  accessToken: "",
  options: { refreshUrl: "", apiUrl: "" },
  error: "",
  getClient: () => {
    return;
  },
} as IAtomsContext);

export const useAtomsContext = () => useContext(AtomsContext);

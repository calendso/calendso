import { Prisma } from "@prisma/client";
import { TFunction } from "next-i18next";
import { z } from "zod";

import { defaultLocations, EventLocationType } from "@calcom/app-store/locations";
import { EventTypeModel } from "@calcom/prisma/zod";
import { EventTypeMetaDataSchema } from "@calcom/prisma/zod-utils";
import type { App, AppMeta } from "@calcom/types/App";

// If you import this file on any app it should produce circular dependency
// import appStore from "./index";
import { appStoreMetadata } from "./apps.browser.generated";

export type EventTypeApps = NonNullable<NonNullable<z.infer<typeof EventTypeMetaDataSchema>>["apps"]>;
export type EventTypeAppsList = keyof EventTypeApps;

const ALL_APPS_MAP = Object.keys(appStoreMetadata).reduce((store, key) => {
  store[key] = appStoreMetadata[key as keyof typeof appStoreMetadata];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  delete store[key]["/*"];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  delete store[key]["__createdUsingCli"];
  return store;
}, {} as Record<string, AppMeta>);

const credentialData = Prisma.validator<Prisma.CredentialArgs>()({
  select: { id: true, type: true, key: true, userId: true, appId: true },
});

type CredentialData = Prisma.CredentialGetPayload<typeof credentialData>;

export enum InstalledAppVariants {
  "conferencing" = "conferencing",
  "calendar" = "calendar",
  "payment" = "payment",
  "other" = "other",
}

export const ALL_APPS = Object.values(ALL_APPS_MAP);

type OptionTypeBase = {
  label: string;
  value: EventLocationType["type"];
  disabled?: boolean;
};

function translateLocations(locations: OptionTypeBase[], t: TFunction) {
  return locations.map((l) => ({
    ...l,
    label: t(l.label),
  }));
}

export function getLocationOptions(integrations: ReturnType<typeof getApps>, t: TFunction) {
  const locations: OptionTypeBase[] = [];
  defaultLocations.forEach((l) => {
    locations.push({
      label: l.label,
      value: l.type,
    });
  });
  integrations.forEach((app) => {
    if (app.locationOption) {
      locations.push(app.locationOption);
    }
  });

  return translateLocations(locations, t);
}

/**
 * This should get all available apps to the user based on his saved
 * credentials, this should also get globally available apps.
 */
function getApps(userCredentials: CredentialData[]) {
  const apps = ALL_APPS.map((appMeta) => {
    const credentials = userCredentials.filter((credential) => credential.type === appMeta.type);
    let locationOption: OptionTypeBase | null = null;

    /** If the app is a globally installed one, let's inject it's key */
    if (appMeta.isGlobal) {
      credentials.push({
        id: +new Date().getTime(),
        type: appMeta.type,
        key: appMeta.key!,
        userId: +new Date().getTime(),
        appId: appMeta.slug,
      });
    }

    /** Check if app has location option AND add it if user has credentials for it */
    if (credentials.length > 0 && appMeta?.appData?.location) {
      locationOption = {
        value: appMeta.appData.location.type,
        label: appMeta.appData.location.label || "No label set",
        disabled: false,
      };
    }

    const credential: typeof credentials[number] | null = credentials[0] || null;
    return {
      ...appMeta,
      /**
       * @deprecated use `credentials`
       */
      credential,
      credentials,
      /** Option to display in `location` field while editing event types */
      locationOption,
    };
  });

  return apps;
}

export function hasIntegrationInstalled(type: App["type"]): boolean {
  return ALL_APPS.some((app) => app.type === type && !!app.installed);
}

export function getAppName(name: string): string | null {
  return ALL_APPS_MAP[name as keyof typeof ALL_APPS_MAP]?.name ?? null;
}

export function getAppType(name: string): string {
  const type = ALL_APPS_MAP[name as keyof typeof ALL_APPS_MAP].type;

  if (type.endsWith("_calendar")) {
    return "Calendar";
  }
  if (type.endsWith("_payment")) {
    return "Payment";
  }
  return "Unknown";
}

export const getEventTypeAppData = <T extends EventTypeAppsList>(
  eventType: Pick<z.infer<typeof EventTypeModel>, "price" | "currency" | "metadata">,
  appId: T,
  forcedGet?: boolean
): EventTypeApps[T] => {
  const metadata = eventType.metadata;
  const appMetadata = metadata?.apps && metadata.apps[appId];
  if (appMetadata) {
    const allowDataGet = forcedGet ? true : appMetadata.enabled;
    return allowDataGet ? appMetadata : null;
  }

  // Backward compatibility for existing event types.
  // TODO: Write code here to migrate metadata to new format and delete this backwards compatibility once there is no hit for it.
  const legacyAppsData = {
    stripe: {
      enabled: eventType.price > 0,
      price: eventType.price,
      currency: eventType.currency,
    },
    rainbow: {
      enabled: eventType.metadata?.smartContractAddress && eventType.metadata?.blockchainId,
      smartContractAddress: eventType.metadata?.smartContractAddress,
      blockchainId: eventType.metadata?.blockchainId,
    },
    giphy: {
      enabled: !!eventType.metadata?.giphyThankYouPage,
      thankYouPage: eventType.metadata?.giphyThankYouPage,
    },
  } as const;
  const legacyAppData = legacyAppsData[appId as Extract<T, "stripe" | "rainbow" | "giphy">];
  const allowDataGet = forcedGet ? true : legacyAppData.enabled;
  return allowDataGet ? legacyAppData : null;
};

export default getApps;

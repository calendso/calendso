import type { Prisma } from "@prisma/client";
import type { TFunction } from "next-i18next";

import { defaultVideoAppCategories } from "@calcom/app-store/utils";
import getEnabledAppsFromCredentials from "@calcom/lib/apps/getEnabledAppsFromCredentials";
import { prisma } from "@calcom/prisma";
import { AppCategories } from "@calcom/prisma/enums";
import { credentialForCalendarServiceSelect } from "@calcom/prisma/selects/credential";
import { userMetadata } from "@calcom/prisma/zod-utils";

import { defaultLocations } from "./locations";

export async function getLocationGroupedOptions(
  userOrTeamId: { userId: number } | { teamId: number },
  t: TFunction
) {
  const apps: Record<
    string,
    {
      label: string;
      value: string;
      disabled?: boolean;
      icon?: string;
      slug?: string;
      credentialId?: number;
    }[]
  > = {};

  // don't default to {}, when you do TS no longer determines the right types.
  let idToSearchObject: Prisma.CredentialWhereInput;

  if ("teamId" in userOrTeamId) {
    const teamId = userOrTeamId.teamId;
    // See if the team event belongs to an org
    const org = await prisma.team.findFirst({
      where: {
        children: {
          some: {
            id: teamId,
          },
        },
      },
    });

    if (org) {
      idToSearchObject = {
        teamId: {
          in: [teamId, org.id],
        },
      };
    } else {
      idToSearchObject = { teamId };
    }
  } else {
    idToSearchObject = { userId: userOrTeamId.userId };
  }

  let usersDefaultApp: string | undefined;

  if ("userId" in userOrTeamId) {
    const user = await prisma.user.findUnique({
      where: {
        id: userOrTeamId.userId,
      },
      select: {
        metadata: true,
      },
    });
    usersDefaultApp = userMetadata.parse(user?.metadata)?.defaultConferencingApp?.appSlug;
  } else {
    usersDefaultApp = undefined;
  }

  const credentials = await prisma.credential.findMany({
    where: {
      ...idToSearchObject,
      app: {
        categories: {
          hasSome: defaultVideoAppCategories,
        },
      },
    },
    select: {
      ...credentialForCalendarServiceSelect,
      team: {
        select: {
          name: true,
        },
      },
    },
  });

  const integrations = await getEnabledAppsFromCredentials(credentials, { filterOnCredentials: true });

  integrations.forEach((app) => {
    // All apps that are labeled as a locationOption are video apps.
    if (app.locationOption) {
      // All apps that are labeled as a locationOption are video apps. Extract the secondary category if available
      let groupByCategory =
        app.categories.length >= 2
          ? app.categories.find((groupByCategory) => !defaultVideoAppCategories.includes(groupByCategory))
          : app.categories[0] || app.category;
      if (!groupByCategory) groupByCategory = AppCategories.conferencing;

      for (const { teamName } of app.credentials.map((credential) => ({
        teamName: credential.team?.name,
      }))) {
        const label = `${app.locationOption.label} ${teamName ? `(${teamName})` : ""}`;
        const option = {
          ...app.locationOption,
          label,
          icon: app.logo,
          slug: app.slug,
          ...(app.credential
            ? { credentialId: app.credential.id, teamName: app.credential.team?.name ?? null }
            : {}),
        };
        if (apps[groupByCategory]) {
          apps[groupByCategory] = [...apps[groupByCategory], option];
        } else {
          apps[groupByCategory] = [option];
        }
      }
    }
  });

  defaultLocations.forEach((l) => {
    const category = l.category;
    if (apps[category]) {
      apps[category] = [
        ...apps[category],
        {
          label: l.label,
          value: l.type,
          icon: l.iconUrl,
        },
      ];
    } else {
      apps[category] = [
        {
          label: l.label,
          value: l.type,
          icon: l.iconUrl,
        },
      ];
    }
  });
  const locations = [];

  // Translating labels and pushing into array
  for (const category in apps) {
    const tmp = {
      label: t(category),
      options: apps[category].map((l) => {
        if (
          "userId" in userOrTeamId &&
          category === "conferencing" &&
          l.slug &&
          (usersDefaultApp === l.slug || (l.slug === "daily-video" && !usersDefaultApp))
        ) {
          return {
            ...l,
            label: t("system_default_conferencing_app", { appName: l.label }),
          };
        } else {
          return {
            ...l,
            label: t(l.label),
          };
        }
      }),
    };

    locations.push(tmp);
  }

  return locations;
}

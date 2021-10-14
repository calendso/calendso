import { Maybe } from "@trpc/server";
import parser from "accept-language-parser";
import { IncomingMessage } from "http";
import { OptionTypeBase } from "react-select";

import { getSession } from "@lib/auth";
import prisma from "@lib/prisma";

import { i18n } from "../../../next-i18next.config";

export function getLocaleFromHeaders(req: IncomingMessage): string {
  const preferredLocale = parser.pick(i18n.locales, req.headers["accept-language"]) as Maybe<string>;

  return preferredLocale ?? i18n.defaultLocale;
}

export const getOrSetUserLocaleFromHeaders = async (req: IncomingMessage): Promise<string> => {
  const session = await getSession({ req });
  const preferredLocale = getLocaleFromHeaders(req);

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        locale: true,
      },
    });

    if (user?.locale) {
      return user.locale;
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        locale: preferredLocale,
      },
    });
  }

  return preferredLocale;
};

export const localeOptions: OptionTypeBase[] = (displayLocale: string | string[]) => {
  return i18n.locales.map((locale) => ({
    value: locale,
    label: new Intl.DisplayNames(displayLocale, { type: "language" }).of(locale),
  }));
};

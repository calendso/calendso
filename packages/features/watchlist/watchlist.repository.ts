import { captureException } from "@sentry/nextjs";

import db from "@calcom/prisma";
import { WatchlistType } from "@calcom/prisma/enums";

import type { IWatchlistRepository } from "./watchlist.repository.interface";

export class WatchlistRepository implements IWatchlistRepository {
  async getEmailInWatchlist(email: string) {
    const [, domain] = email.split("@");
    try {
      const emailInWatchlist = await db.watchlist.findFirst({
        where: {
          OR: [
            { type: WatchlistType.EMAIL, value: email },
            { type: WatchlistType.DOMAIN, value: domain },
          ],
        },
      });
      return emailInWatchlist;
    } catch (err) {
      captureException(err);
      throw err;
    }
  }

  async getEmailDomainInWatchlist(emailDomain: string) {
    try {
      const domainInWatchWatchlist = await db.watchlist.findFirst({
        where: {
          type: WatchlistType.DOMAIN,
          value: emailDomain,
        },
      });
      return domainInWatchWatchlist;
    } catch (err) {
      captureException(err);
      throw err;
    }
  }
}

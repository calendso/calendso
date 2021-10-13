/* eslint-disable @typescript-eslint/ban-types */
import { provider, Provider } from "kont";
import { Page } from "playwright";

/**
 * Context data that Login provder needs.
 */
export type Needs = {};

/**
 * Login provider's options.
 */
export type Params = {
  user: string;
};

/**
 * Context data that Page provider contributes.
 */
export type Contributes = {
  page: Page;
};

/**
 * Creates a new context / "incognito tab" and logs in the specified user
 */
export function loginProvider(opts: {
  user: string;
  /**
   * Path to navigate to after login
   */
  path?: string;
  /**
   * Selector to wait for to decide that the navigation is done
   */
  waitForSelector?: string;
}): Provider<Needs, Contributes> {
  return provider<Needs, Contributes>()
    .name("login")
    .before(async () => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.goto("http://localhost:3000/event-types");
      // Click input[name="email"]
      await page.click('input[name="email"]');
      // Fill input[name="email"]
      await page.fill('input[name="email"]', `${opts.user}@example.com`);
      // Press Tab
      await page.press('input[name="email"]', "Tab");
      // Fill input[name="password"]
      await page.fill('input[name="password"]', opts.user);
      // Press Enter
      await page.press('input[name="password"]', "Enter");

      await page.waitForSelector("[data-testid=event-types]");

      if (opts.path) {
        await page.goto(`http://localhost:3000${opts.path}`);
      }
      if (opts.waitForSelector) {
        await page.waitForSelector(opts.waitForSelector);
      }

      return {
        page,
        context,
      };
    })
    .after(async (ctx) => {
      await ctx.page?.close();
      await ctx.context?.close();
    })
    .done();
}

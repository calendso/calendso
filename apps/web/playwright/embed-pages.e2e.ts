import { expect } from "@playwright/test";

import { test } from "./lib/fixtures";

test.describe("Embed Pages", () => {
  test("Calendar Page: should not have margin top on embed page", async ({ page }) => {
    await page.goto("/free/30min/embed");

    // Checks the margin from top by checking the distance between the div inside main from the viewport
    const marginFromTop = await page.evaluate(() => {
      const mainElement = document.querySelector("main");
      const divElement = mainElement?.querySelector("div");

      if (mainElement && divElement) {
        // This returns the distance of the div element from the viewport
        const divRect = divElement.getBoundingClientRect();
        return divRect.top;
      }

      return null;
    });

    expect(marginFromTop).toBe(0);
  });

  test("Calendar Page: should have margin top on non embed page", async ({ page }) => {
    await page.goto("/free/30min");

    // Checks the margin from top by checking the distance between the div inside main from the viewport
    const marginFromTop = await page.evaluate(() => {
      const mainElement = document.querySelector("main");
      const divElement = mainElement?.querySelector("div");

      if (mainElement && divElement) {
        // This returns the distance of the div element from the viewport
        const divRect = divElement.getBoundingClientRect();
        return divRect.top;
      }

      return null;
    });

    expect(marginFromTop).not.toBe(0);
  });

  test("should change to embed when window.name is changed to cal-embed=", async ({ page }) => {
    await page.goto("/free/30min");

    window.name = "cal-embed=";
    await page.reload();

    const isEmbed = location.search.includes("embed=");
    expect(isEmbed).toBe(true);
  });
});

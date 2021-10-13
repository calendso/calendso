import { kont } from "kont";

import { loginProvider } from "./lib/loginProvider";
import { randomString } from "./lib/testUtils";

jest.setTimeout(30e3);

describe("pro user", () => {
  const ctx = kont()
    .useBeforeEach(
      loginProvider({
        user: "pro",
        path: "/event-types",
        waitForSelector: "[data-testid=event-types]",
      })
    )
    .done();

  it("has at least 2 events", async () => {
    const { page } = ctx;
    const $eventTypes = await page.$$("[data-testid=event-types] > *");
    console.log("$eventTypes", $eventTypes);
    expect($eventTypes.length).toBeGreaterThanOrEqual(2);
    for (const $el of $eventTypes) {
      expect(await $el.getAttribute("data-disabled")).toBe("0");
    }
  });

  it("can add new event type", async () => {
    const { page } = ctx;
    await page.click("[data-testid=new-event-type]");
    const nonce = randomString(3);
    const eventTitle = `hello ${nonce}`;

    await page.fill("[name=title]", eventTitle);
    await page.fill("[name=length]", "10");
    await page.click("[type=submit]");

    await page.waitForNavigation({
      url(url) {
        return url.pathname !== "/event-types";
      },
    });

    await page.goto("http://localhost:3000/event-types");

    await page.waitForSelector(`text=${nonce}`);
  });
});

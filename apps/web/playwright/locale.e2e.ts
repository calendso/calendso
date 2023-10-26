import { expect } from "@playwright/test";

import { test } from "./lib/fixtures";

test.describe.configure({ mode: "serial" });

test.describe("unauthorized user sees correct translations (de)", async () => {
  test.use({
    locale: "de",
  });

  test("should use correct translations and html attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await page.locator("html[lang=de]").waitFor({ state: "attached" });
    await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

    {
      const locator = page.getByText("Willkommen zurück", { exact: true });
      expect(await locator.count()).toEqual(1);
    }

    {
      const locator = page.getByText("Welcome back", { exact: true });
      expect(await locator.count()).toEqual(0);
    }
  });
});

test.describe("unauthorized user sees correct translations (ar)", async () => {
  test.use({
    locale: "ar",
  });

  test("should use correct translations and html attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await page.locator("html[lang=ar]").waitFor({ state: "attached" });
    await page.locator("html[dir=rtl]").waitFor({ state: "attached" });

    {
      const locator = page.getByText("أهلاً بك من جديد", { exact: true });
      expect(await locator.count()).toEqual(1);
    }

    {
      const locator = page.getByText("Welcome back", { exact: true });
      expect(await locator.count()).toEqual(0);
    }
  });
});

test.describe("unauthorized user sees correct translations (zh)", async () => {
  test.use({
    locale: "zh",
  });

  test("should use correct translations and html attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await page.locator("html[lang=zh]").waitFor({ state: "attached" });
    await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

    {
      const locator = page.getByText("欢迎回来", { exact: true });
      expect(await locator.count()).toEqual(1);
    }

    {
      const locator = page.getByText("Welcome back", { exact: true });
      expect(await locator.count()).toEqual(0);
    }
  });
});

test.describe("unauthorized user sees correct translations (zh-CN)", async () => {
  test.use({
    locale: "zh-CN",
  });

  test("should use correct translations and html attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await page.locator("html[lang=zh-CN]").waitFor({ state: "attached" });
    await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

    {
      const locator = page.getByText("欢迎回来", { exact: true });
      expect(await locator.count()).toEqual(1);
    }

    {
      const locator = page.getByText("Welcome back", { exact: true });
      expect(await locator.count()).toEqual(0);
    }
  });
});

test.describe("unauthorized user sees correct translations (zh-TW)", async () => {
  test.use({
    locale: "zh-TW",
  });

  test("should use correct translations and html attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await page.locator("html[lang=zh-TW]").waitFor({ state: "attached" });
    await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

    {
      const locator = page.getByText("歡迎回來", { exact: true });
      expect(await locator.count()).toEqual(1);
    }

    {
      const locator = page.getByText("Welcome back", { exact: true });
      expect(await locator.count()).toEqual(0);
    }
  });
});

test.describe("unauthorized user sees correct translations (pt)", async () => {
  test.use({
    locale: "pt",
  });

  test("should use correct translations and html attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await page.locator("html[lang=pt]").waitFor({ state: "attached" });
    await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

    {
      const locator = page.getByText("Olá novamente", { exact: true });
      expect(await locator.count()).toEqual(1);
    }

    {
      const locator = page.getByText("Welcome back", { exact: true });
      expect(await locator.count()).toEqual(0);
    }
  });
});

test.describe("unauthorized user sees correct translations (pt-br)", async () => {
  test.use({
    locale: "pt-br",
  });

  test("should use correct translations and html attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await page.locator("html[lang=pt-br]").waitFor({ state: "attached" });
    await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

    {
      const locator = page.getByText("Bem-vindo(a) novamente", { exact: true });
      expect(await locator.count()).toEqual(1);
    }

    {
      const locator = page.getByText("Welcome back", { exact: true });
      expect(await locator.count()).toEqual(0);
    }
  });
});

test.describe("unauthorized user sees correct translations (es-419)", async () => {
  test.use({
    locale: "es-419",
  });

  test("should use correct translations and html attributes", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("load");

    await page.locator("html[lang=es-419]").waitFor({ state: "attached" });
    await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

    {
      const locator = page.getByText("Bienvenido de nuevo", { exact: true });
      expect(await locator.count()).toEqual(1);
    }

    {
      const locator = page.getByText("Welcome back", { exact: true });
      expect(await locator.count()).toEqual(0);
    }
  });
});

test.describe("authorized user sees correct translations (de)", async () => {
  test.use({
    locale: "en",
  });

  test("should return correct translations and html attributes", async ({ page, users }) => {
    await test.step("should create a de user", async () => {
      const user = await users.create({
        locale: "de",
      });
      await user.apiLogin();
    });

    await test.step("should navigate to /event-types and show German translations", async () => {
      await page.goto("/event-types");

      await page.waitForLoadState("networkidle");

      await page.locator("html[lang=de]").waitFor({ state: "attached" });
      await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("Ereignistypen", { exact: true });
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Event Types", { exact: true });
        expect(await locator.count()).toEqual(0);
      }
    });

    await test.step("should navigate to /bookings and show German translations", async () => {
      await page.goto("/bookings");

      await page.waitForLoadState("networkidle");

      await page.locator("html[lang=de]").waitFor({ state: "attached" });
      await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("Buchungen", { exact: true });
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Bookings", { exact: true });
        expect(await locator.count()).toEqual(0);
      }
    });

    await test.step("should reload the /bookings and show German translations", async () => {
      await page.reload();

      await page.waitForLoadState("networkidle");

      await page.locator("html[lang=de]").waitFor({ state: "attached" });
      await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("Buchungen", { exact: true });
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Bookings", { exact: true });
        expect(await locator.count()).toEqual(0);
      }
    });
  });
});

test.describe("authorized user sees correct translations (pt-br)", async () => {
  test.use({
    locale: "en",
  });

  test("should return correct translations and html attributes", async ({ page, users }) => {
    await test.step("should create a pt-br user", async () => {
      const user = await users.create({
        locale: "pt-br",
      });
      await user.apiLogin();
    });

    await test.step("should navigate to /event-types and show Brazil-Portuguese translations", async () => {
      await page.goto("/event-types");

      await page.waitForLoadState("networkidle");

      await page.locator("html[lang=pt-br]").waitFor({ state: "attached" });
      await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("Tipos de Eventos", { exact: true });
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Event Types", { exact: true });
        expect(await locator.count()).toEqual(0);
      }
    });

    await test.step("should navigate to /bookings and show Brazil-Portuguese translations", async () => {
      await page.goto("/bookings");

      await page.waitForLoadState("networkidle");

      await page.locator("html[lang=pt-br]").waitFor({ state: "attached" });
      await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("Reservas", { exact: true });
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Bookings", { exact: true });
        expect(await locator.count()).toEqual(0);
      }
    });

    await test.step("should reload the /bookings and show Brazil-Portuguese translations", async () => {
      await page.reload();

      await page.waitForLoadState("networkidle");

      await page.locator("html[lang=pt-br]").waitFor({ state: "attached" });
      await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("Reservas", { exact: true });
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Bookings", { exact: true });
        expect(await locator.count()).toEqual(0);
      }
    });
  });
});

test.describe("authorized user sees correct translations (ar)", async () => {
  test.use({
    locale: "en",
  });

  test("should return correct translations and html attributes", async ({ page, users }) => {
    await test.step("should create a de user", async () => {
      const user = await users.create({
        locale: "ar",
      });
      await user.apiLogin();
    });

    await test.step("should navigate to /event-types and show Arabic translations", async () => {
      await page.goto("/event-types");

      await page.waitForLoadState("networkidle");

      await page.locator("html[lang=ar]").waitFor({ state: "attached" });
      await page.locator("html[dir=rtl]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("أنواع الحدث", { exact: true });
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Event Types", { exact: true });
        expect(await locator.count()).toEqual(0);
      }
    });

    await test.step("should navigate to /bookings and show Arabic translations", async () => {
      await page.goto("/bookings");

      await page.waitForLoadState("networkidle");

      await page.locator("html[lang=ar]").waitFor({ state: "attached" });
      await page.locator("html[dir=rtl]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("عمليات الحجز", { exact: true });
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Bookings", { exact: true });
        expect(await locator.count()).toEqual(0);
      }
    });

    await test.step("should reload the /bookings and show Arabic translations", async () => {
      await page.reload();

      await page.waitForLoadState("networkidle");

      await page.locator("html[lang=ar]").waitFor({ state: "attached" });
      await page.locator("html[dir=rtl]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("عمليات الحجز", { exact: true });
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Bookings", { exact: true });
        expect(await locator.count()).toEqual(0);
      }
    });
  });
});

test.describe("authorized user sees changed translations (de->ar)", async () => {
  test.use({
    locale: "en",
  });

  test("should return correct translations and html attributes", async ({ page, users }) => {
    await test.step("should create a de user", async () => {
      const user = await users.create({
        locale: "de",
      });
      await user.apiLogin();
    });

    await test.step("should change the language and show Arabic translations", async () => {
      await page.goto("/settings/my-account/general");

      await page.waitForLoadState("networkidle");

      await page.locator(".bg-default > div > div:nth-child(2)").first().click();
      await page.locator("#react-select-2-option-0").click();

      await page.getByRole("button", { name: "Aktualisieren" }).click();

      await page
        .getByRole("button", { name: "Einstellungen erfolgreich aktualisiert" })
        .waitFor({ state: "visible" });

      await page.locator("html[lang=ar]").waitFor({ state: "attached" });
      await page.locator("html[dir=rtl]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("عام", { exact: true }); // "general"
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Allgemein", { exact: true }); // "general"
        expect(await locator.count()).toEqual(0);
      }
    });

    await test.step("should reload and show Arabic translations", async () => {
      await page.reload();

      await page.waitForLoadState("networkidle");

      await page.locator("html[lang=ar]").waitFor({ state: "attached" });
      await page.locator("html[dir=rtl]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("عام", { exact: true }); // "general"
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Allgemein", { exact: true }); // "general"
        expect(await locator.count()).toEqual(0);
      }
    });
  });
});

test.describe("authorized user sees changed translations (de->pt-BR) [locale1]", async () => {
  test.use({
    locale: "en",
  });

  test("should return correct translations and html attributes", async ({ page, users }) => {
    await test.step("should create a de user", async () => {
      const user = await users.create({
        locale: "de",
      });
      await user.apiLogin();
    });

    await test.step("should change the language and show Brazil-Portuguese translations", async () => {
      await page.goto("/settings/my-account/general");

      await page.waitForLoadState("networkidle");

      await page.locator(".bg-default > div > div:nth-child(2)").first().click();
      await page.locator("#react-select-2-option-14").click();

      await page.getByRole("button", { name: "Aktualisieren" }).click();

      await page
        .getByRole("button", { name: "Einstellungen erfolgreich aktualisiert" })
        .waitFor({ state: "visible" });

      await page.locator("html[lang=pt-BR]").waitFor({ state: "attached" });
      await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("Geral", { exact: true }); // "general"
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Allgemein", { exact: true }); // "general"
        expect(await locator.count()).toEqual(0);
      }
    });

    await test.step("should reload and show Brazil-Portuguese translations", async () => {
      await page.reload();

      await page.waitForLoadState("networkidle");

      await page.locator("html[lang=pt-BR]").waitFor({ state: "attached" });
      await page.locator("html[dir=ltr]").waitFor({ state: "attached" });

      {
        const locator = page.getByText("Geral", { exact: true }); // "general"
        expect(await locator.count()).toBeGreaterThanOrEqual(1);
      }

      {
        const locator = page.getByText("Allgemein", { exact: true }); // "general"
        expect(await locator.count()).toEqual(0);
      }
    });
  });
});

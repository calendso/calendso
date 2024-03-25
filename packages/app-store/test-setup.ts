import matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";

vi.mock("@calcom/lib/OgImages", async () => {
  return {};
});

vi.mock("@calcom/lib/hooks/useLocale", () => ({
  useLocale: () => {
    return {
      t: (str: string) => str,
      isLocaleReady: true,
      i18n: {
        language: "en",
        defaultLocale: "en",
        locales: ["en"],
        exists: () => false,
      },
    };
  },
}));

vi.mock("@calcom/atoms/monorepo", () => ({
  useIsPlatform: () => {
    return false;
  },
}));

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

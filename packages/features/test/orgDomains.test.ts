import { describe, expect, it } from "vitest";

import { getOrgSlug, getOrgDomainConfigFromHostname } from "@calcom/features/ee/organizations/lib/orgDomains";
import * as constants from "@calcom/lib/constants";

function setupEnvs({ WEBAPP_URL = "https://app.cal.com" } = {}) {
  Object.defineProperty(constants, "WEBAPP_URL", { value: WEBAPP_URL });
  Object.defineProperty(constants, "ALLOWED_HOSTNAMES", {
    value: ["cal.com", "cal.dev", "cal-staging.com", "cal.community", "cal.local:3000", "localhost:3000"],
  });
  Object.defineProperty(constants, "RESERVED_SUBDOMAINS", {
    value: [
      "app",
      "auth",
      "docs",
      "design",
      "console",
      "go",
      "status",
      "api",
      "saml",
      "www",
      "matrix",
      "developer",
      "cal",
      "my",
      "team",
      "support",
      "security",
      "blog",
      "learn",
      "admin",
    ],
  });
}

describe("Org Domains Utils", () => {
  describe("getOrgDomainConfigFromHostname", () => {
    it("should return a valid org domain", () => {
      setupEnvs();
      expect(getOrgDomainConfigFromHostname({ hostname: "acme.cal.com" })).toEqual({
        currentOrgDomain: "acme",
        isValidOrgDomain: true,
      });
    });

    it("should return a non valid org domain", () => {
      setupEnvs();
      expect(getOrgDomainConfigFromHostname({ hostname: "app.cal.com" })).toEqual({
        currentOrgDomain: null,
        isValidOrgDomain: false,
      });
    });

    it("should return a non valid org domain for localhost", () => {
      setupEnvs();
      expect(getOrgDomainConfigFromHostname({ hostname: "localhost:3000" })).toEqual({
        currentOrgDomain: null,
        isValidOrgDomain: false,
      });
    });
  });

  describe("getOrgSlug", () => {
    it("should handle a prod web app url with a prod subdomain hostname", () => {
      setupEnvs();
      expect(getOrgSlug("acme.cal.com")).toEqual("acme");
    });

    it("should handle a prod web app url with a staging subdomain hostname", () => {
      setupEnvs();
      expect(getOrgSlug("acme.cal.dev")).toEqual(null);
    });

    it("should handle a local web app with port url with a local subdomain hostname", () => {
      setupEnvs({ WEBAPP_URL: "http://app.cal.local:3000" });
      expect(getOrgSlug("acme.cal.local:3000")).toEqual("acme");
    });

    it("should handle a local web app with port url with a non-local subdomain hostname", () => {
      setupEnvs({ WEBAPP_URL: "http://app.cal.local:3000" });
      expect(getOrgSlug("acme.cal.com:3000")).toEqual(null);
    });
  });
});

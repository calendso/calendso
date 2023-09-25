import { expect } from "@playwright/test";
import { randomBytes } from "crypto";

import { generateSecret } from "@calcom/trpc/server/routers/viewer/oAuth/addClient.handler";

import { test } from "./lib/fixtures";

test.afterEach(async ({ users }) => {
  await users.deleteAll();
});

let client;

test.describe("OAuth Provider", () => {
  test.beforeAll(async () => {
    client = await createTestCLient();
  });
  test("Should create valid token for user", async ({ page, users }) => {
    const user = await users.create({ username: "test user", name: "test user" });
    await user.apiLogin();

    await page.goto(
      `auth/oauth2/authorize?client_id=${client.clientId}&redirect_uri=${client.redirectUri}&response_type=code&scope=READ_PROFILE&state=1234`
    );

    const baseUrl = page
      .url()
      .replace(/^https:\/\//, "")
      .replace(/^http:\/\//, "")
      .split("/")[0];

    await page.waitForLoadState("networkidle");
    await page.getByTestId("allow-button").click();

    await page.waitForFunction(() => {
      return window.location.href.startsWith("https://example.com");
    });

    const url = new URL(page.url());

    // authorization code that is returned to client with redirect uri
    const code = url.searchParams.get("code");

    // request token with authorization code
    const tokenResponse = await fetch(`http://${baseUrl}/api/auth/oauth/token`, {
      body: JSON.stringify({
        code,
        client_id: client.clientId,
        client_secret: client.orginalSecret,
        grant_type: "authorization_code",
        redirect_uri: client.redirectUri,
      }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const tokenData = await tokenResponse.json();

    // test if token is valid
    const meResponse = await fetch(`http://${baseUrl}/api/auth/oauth/me`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + tokenData.access_token,
      },
    });

    const meData = await meResponse.json();

    expect(meData.username && meData.username.startsWith("test user")).toBe(true);
  });

  test("Should create valid token for team", async ({ page, users }) => {
    expect(client).toBeDefined();
  });
});

const createTestCLient = async () => {
  const [hashedSecret, secret] = generateSecret();
  const clientId = randomBytes(32).toString("hex");

  const client = await prisma.oAuthClient.create({
    data: {
      name: "Test Client",
      clientId,
      clientSecret: hashedSecret,
      redirectUri: "https://example.com",
    },
  });

  return { ...client, orginalSecret: secret };
};

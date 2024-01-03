import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";

import { CalProvider } from "@calcom/platform-atoms/components";
import "@calcom/platform-atoms/dist/globals.min.css";

function generateRandomEmail() {
  const localPartLength = 10;
  const domain = ["example.com", "example.net", "example.org"];

  const randomLocalPart = Array.from({ length: localPartLength }, () =>
    String.fromCharCode(Math.floor(Math.random() * 26) + 97)
  ).join("");

  const randomDomain = domain[Math.floor(Math.random() * domain.length)];

  return `${randomLocalPart}@${randomDomain}`;
}

export default function App({ Component, pageProps }: AppProps) {
  const [accessToken, setAccessToken] = useState("");
  const [email, setUserEmail] = useState("");

  useEffect(() => {
    const randomEmail = generateRandomEmail();
    fetch("/api/managed-user", {
      method: "POST",

      body: JSON.stringify({ email: randomEmail }),
    }).then(async (res) => {
      const data = await res.json();
      setAccessToken(data.accessToken);
      setUserEmail(data.email);
    });
  }, []);
  return (
    <div>
      <CalProvider
        accessToken={accessToken}
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        clientId={process.env.NEXT_PUBLIC_X_CAL_ID ?? ""}
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        options={{ apiUrl: process.env.NEXT_PUBLIC_CALCOM_API_URL ?? "", refreshUrl: "/api/refresh" }}>
        {email ? (
          <>
            <p className="m-12 text-lg">{email}</p>
            <Component {...pageProps} />
          </>
        ) : (
          <>
            <main className={`flex min-h-screen flex-col items-center justify-between p-24 `}>
              <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex" />
            </main>
          </>
        )}
      </CalProvider>{" "}
    </div>
  );
}

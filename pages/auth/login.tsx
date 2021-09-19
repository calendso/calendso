import { HeadSeo } from "@components/seo/head-seo";
import Link from "next/link";
import { getCsrfToken } from "next-auth/client";
import { getSession } from "@lib/auth";
import { useEffect } from "react";
import T from "@components/T";
import { useRouter } from "next/router";
export default function Login({ csrfToken }) {
  const router = useRouter();
  useEffect(() => {
    if (!router.query?.callbackUrl) {
      window.history.replaceState(null, document.title, "?callbackUrl=/");
    }
  }, [router.query]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <HeadSeo title="Login" description="Login" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="h-6 mx-auto" src="/calendso-logo-white-word.svg" alt="Calendso Logo" />
        <h2 className="mt-6 text-center text-3xl font-bold text-neutral-900">
          <T id="signInYourAccount">Sign in to your account</T>
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 mx-2 rounded-sm sm:px-10 border border-neutral-200">
          <form className="space-y-6" method="post" action="/api/auth/callback/credentials">
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} hidden />
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
                <T id="emailAddress">Email address</T>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-neutral-900 focus:border-neutral-900 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex">
                <div className="w-1/2">
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                    <T>Password</T>
                  </label>
                </div>
                <div className="w-1/2 text-right">
                  <Link href="/auth/forgot-password">
                    <a className="font-medium text-primary-600 text-sm">
                      <T id="forgot">Forgot?</T>
                    </a>
                  </Link>
                </div>
              </div>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-neutral-900 focus:border-neutral-900 sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                <T>Sign in</T>
              </button>
            </div>
          </form>
        </div>
        <div className="mt-4 text-neutral-600 text-center text-sm">
          <T id="dontHaveAccount">Don&apos;t have an account?</T>{" "}
          {/* replace this with your account creation flow */}
          <a href="https://cal.com/signup" className="font-medium text-neutral-900">
            <T id="createAccount">Create an account</T>
          </a>
        </div>
      </div>
    </div>
  );
}

Login.getInitialProps = async (context) => {
  const { req, res } = context;
  const session = await getSession({ req });

  if (session) {
    res.writeHead(302, { Location: "/" });
    res.end();
    return;
  }

  return {
    csrfToken: await getCsrfToken(context),
  };
};

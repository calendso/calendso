import { useRouter } from "next/router";
import { XIcon } from "@heroicons/react/outline";
import { HeadSeo } from "@components/seo/head-seo";
import Link from "next/link";
import T from "@components/T";

export default function Error() {
  const router = useRouter();
  const { error } = router.query;

  return (
    <div
      className="fixed z-50 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true">
      <HeadSeo title="Error" description="Error" />
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <XIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {error}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  <T id="errorOccurredWhenLogging">An error occurred when logging you in.</T>{" "}
                  <T id="goBackLoginScreenAndTryAgain">Head back to the login screen and try again.</T>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <Link href="/auth/login">
              <a className="inline-flex justify-center w-full rounded-sm border border-transparent shadow-sm px-4 py-2 bg-neutral-900 text-base font-medium text-white hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 sm:text-sm">
                <T id="goBackLoginPage">Go back to the login page</T>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

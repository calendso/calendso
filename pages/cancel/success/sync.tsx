import Head from "next/head";
import prisma from "../../../lib/prisma";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { CheckIcon } from "@heroicons/react/outline";
import { InferGetServerSidePropsType } from "next";

dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export default function Type(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  // Get router variables
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>
          Cancelled {props.title} | {props.user.name || props.user.username} | Calendso
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="max-w-3xl mx-auto my-24">
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 my-4 transition-opacity sm:my-0" aria-hidden="true">
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div
                className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline">
                <div>
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full">
                    <CheckIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-headline">
                      Cancellation successful
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Feel free to pick another event anytime.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 text-center sm:mt-6">
                  <div className="mt-5">
                    <button
                      onClick={() => router.push("/" + props.user.username)}
                      type="button"
                      className="inline-flex items-center justify-center px-4 py-2 mx-2 font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:text-sm btn-white">
                      Pick another
                    </button>
                  </div>
                </div>
                <div className="mt-5 text-center sm:mt-6">
                  <a className="text-black hover:opacity-90" href="/">
                    Go back home
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const user = await prisma.user.findFirst({
    where: {
      username: context.query.user,
    },
    select: {
      username: true,
      name: true,
      bio: true,
      avatar: true,
      eventTypes: true,
    },
  });

  return {
    props: {
      user,
      title: context.query.title || null,
    },
  };
}

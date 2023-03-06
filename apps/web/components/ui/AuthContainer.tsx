import classNames from "classnames";

import { HeadSeo } from "@calcom/ui";

import Loader from "@components/Loader";

interface Props {
  title: string;
  description: string;
  footerText?: React.ReactNode | string;
  showLogo?: boolean;
  heading?: string;
  loading?: boolean;
}

export default function AuthContainer(props: React.PropsWithChildren<Props>) {
  return (
    <div className="bg-sunny-200 flex min-h-screen flex-col justify-center  py-12 sm:px-6 lg:px-8">
      <HeadSeo title={props.title} description={props.description} />
      {props.showLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="https://mento-space.nyc3.digitaloceanspaces.com/logo.svg"
          alt="logo"
          width="200"
          height="80"
          className="mx-auto mb-10"
        />
      )}

      <div className={classNames(props.showLogo ? "text-center" : "", "sm:mx-auto sm:w-full sm:max-w-md")}>
        {props.heading && <h2 className="font-cal text-center text-3xl text-gray-900">{props.heading}</h2>}
      </div>
      {props.loading && (
        <div className="absolute z-50 flex h-screen w-full items-center bg-gray-50">
          <Loader />
        </div>
      )}
      <div className="mb-auto mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-2 rounded-md border border-gray-200 bg-white px-4 py-10 sm:px-10">
          {props.children}
        </div>
        <div className="mt-8 text-center text-sm text-gray-600">{props.footerText}</div>
      </div>
    </div>
  );
}

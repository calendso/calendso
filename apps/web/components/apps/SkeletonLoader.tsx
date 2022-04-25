import React from "react";

import { ShellSubHeading } from "@components/Shell";

function SkeletonLoader() {
  return (
    <>
      <ShellSubHeading title={<div className="h-6 w-32 rounded-md bg-gray-300"></div>} />
      <ul className="animate-pulse divide-y divide-neutral-200 border border-gray-200 bg-white ">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </ul>
    </>
  );
}

export default SkeletonLoader;

function SkeletonItem() {
  return (
    <li className="group flex w-full items-center justify-between px-2 py-4 sm:px-4">
      <a className="flex-grow truncate text-sm" title="Google Meet " href="/event-types/9">
        <div className="flex justify-start space-x-2">
          <div className="h-12 w-12 rounded-lg bg-gray-300"></div>
          <div className="space-y-2">
            <div className="h-6 w-32 rounded-md bg-gray-300"></div>
            <div className="h-4 w-16 rounded-md bg-gray-300"></div>
          </div>
        </div>
      </a>
      <div className="mt-4 hidden flex-shrink-0 sm:mt-0 sm:ml-5 lg:flex">
        <div className="flex justify-between space-x-2 rtl:space-x-reverse">
          <div className="h-6 w-12 rounded-md bg-gray-300"></div>
        </div>
      </div>
    </li>
  );
}

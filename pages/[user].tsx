import { ArrowRightIcon } from "@heroicons/react/outline";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Link from "next/link";
import React from "react";

import useTheme from "@lib/hooks/useTheme";
import prisma from "@lib/prisma";
// import { inferSSRProps } from "@lib/types/inferSSRProps";

import EventTypeDescription from "@components/eventtype/EventTypeDescription";
import { HeadSeo } from "@components/seo/head-seo";
import Avatar from "@components/ui/Avatar";

export default function User(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { isReady } = useTheme(props.user.theme);

  return (
    <>
      <HeadSeo
        title={props.user.name || props.user.username}
        description={props.user.name || props.user.username}
        name={props.user.name || props.user.username}
        avatar={props.user.avatar}
      />
      {isReady && (
        <div className="h-screen bg-neutral-50 ">
          <main className="max-w-3xl px-4 py-24 mx-auto">
            <div className="mb-8 text-center">
              <Avatar
                imageSrc={props.user.avatar}
                displayName={props.user.name}
                className="w-24 h-24 mx-auto mb-4 rounded-full"
              />
              <h1 className="mb-1 text-3xl font-bold text-neutral-900 ">
                {props.user.name || props.user.username}
              </h1>
              <p className="text-neutral-500 ">{props.user.bio}</p>
            </div>
            <div className="space-y-6" data-testid="event-types">
              {props.eventTypes.map((type) => (
                <div
                  key={type.id}
                  className="relative bg-white border rounded-sm group   :border-neutral-600 hover:bg-gray-50 border-neutral-200 hover:border-black">
                  <ArrowRightIcon className="absolute w-4 h-4 text-black transition-opacity opacity-0 right-3 top-3  group-hover:opacity-100" />
                  <Link href={`/${props.user.username}/${type.slug}`}>
                    <a className="block px-6 py-4">
                      <h2 className="font-semibold text-neutral-900 ">{type.title}</h2>
                      <EventTypeDescription eventType={type} />
                    </a>
                  </Link>
                </div>
              ))}
            </div>
            {props.eventTypes.length == 0 && (
              <div className="overflow-hidden rounded-sm shadow">
                <div className="p-8 text-center text-gray-400 ">
                  <h2 className="text-3xl font-semibold text-gray-600 font-cal ">Uh oh!</h2>
                  <p className="max-w-md mx-auto">This user hasn&apos;t set up any event types yet.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const username = (context.query.user as string).toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      bio: true,
      avatar: true,
      theme: true,
      plan: true,
    },
  });
  if (!user) {
    return {
      notFound: true,
    };
  }

  const eventTypesWithHidden = await prisma.eventType.findMany({
    where: {
      OR: [
        {
          userId: user.id,
        },
        {
          users: {
            some: {
              id: user.id,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      length: true,
      description: true,
      hidden: true,
      schedulingType: true,
      price: true,
      currency: true,
    },
    take: user.plan === "FREE" ? 1 : undefined,
  });
  const eventTypes = eventTypesWithHidden.filter((evt) => !evt.hidden);
  return {
    props: {
      eventTypes,
      user,
    },
  };
};

// Auxiliary methods
export function getRandomColorCode(): string {
  let color = "#";
  for (let idx = 0; idx < 6; idx++) {
    color += Math.floor(Math.random() * 10);
  }
  return color;
}

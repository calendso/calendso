import { ArrowRightIcon } from "@heroicons/react/outline";
import { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import React from "react";

import { getOrSetUserLocaleFromHeaders } from "@lib/core/i18n/i18n.utils";
import { useLocale } from "@lib/hooks/useLocale";
import useTheme from "@lib/hooks/useTheme";
import prisma from "@lib/prisma";
import { inferSSRProps } from "@lib/types/inferSSRProps";

import EventTypeDescription from "@components/eventtype/EventTypeDescription";
import { HeadSeo } from "@components/seo/head-seo";
import Avatar from "@components/ui/Avatar";

export default function User(props: inferSSRProps<typeof getServerSideProps>) {
  const { isReady } = useTheme(props.user.theme);
  const { user, localeProp, eventTypes } = props;
  const { t, locale } = useLocale({ localeProp });

  return (
    <>
      <HeadSeo
        title={user.name || user.username}
        description={user.name || user.username}
        name={user.name || user.username}
        avatar={user.avatar}
      />
      {isReady && (
        <div className="bg-neutral-50 dark:bg-black h-screen">
          <main className="max-w-3xl mx-auto py-24 px-4">
            <div className="mb-8 text-center">
              <Avatar
                imageSrc={user.avatar}
                displayName={user.name}
                className="mx-auto w-24 h-24 rounded-full mb-4"
              />
              <h1 className="font-cal text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                {user.name || user.username}
              </h1>
              <p className="text-neutral-500 dark:text-white">{user.bio}</p>
            </div>
            <div className="space-y-6" data-testid="event-types">
              {eventTypes.map((type) => (
                <div
                  key={type.id}
                  className="group relative dark:bg-neutral-900 dark:border-0 dark:hover:border-neutral-600 bg-white hover:bg-gray-50 border border-neutral-200 hover:border-black rounded-sm">
                  <ArrowRightIcon className="absolute transition-opacity h-4 w-4 right-3 top-3 text-black dark:text-white opacity-0 group-hover:opacity-100" />
                  <Link href={`/${user.username}/${type.slug}`}>
                    <a className="block px-6 py-4">
                      <h2 className="font-semibold text-neutral-900 dark:text-white">{type.title}</h2>
                      <EventTypeDescription localeProp={locale} eventType={type} />
                    </a>
                  </Link>
                </div>
              ))}
            </div>
            {eventTypes.length === 0 && (
              <div className="shadow overflow-hidden rounded-sm">
                <div className="p-8 text-center text-gray-400 dark:text-white">
                  <h2 className="font-cal font-semibold text-3xl text-gray-600 dark:text-white">
                    {t("uh_oh")}
                  </h2>
                  <p className="max-w-md mx-auto">{t("no_event_types_have_been_setup")}</p>
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
  const locale = await getOrSetUserLocaleFromHeaders(context.req);

  const user = await prisma.user.findUnique({
    where: {
      username: username.toLowerCase(),
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
      AND: [
        {
          teamId: null,
        },
        {
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
      localeProp: locale,
      user,
      eventTypes,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
};

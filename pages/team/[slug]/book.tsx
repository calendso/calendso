import { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import "react-phone-number-input/style.css";

import { asStringOrThrow } from "@lib/asStringOrNull";
import { getOrSetUserLocaleFromHeaders } from "@lib/core/i18n/i18n.utils";
import prisma from "@lib/prisma";
import { inferSSRProps } from "@lib/types/inferSSRProps";

import BookingPage from "@components/booking/pages/BookingPage";

export type TeamBookingPageProps = inferSSRProps<typeof getServerSideProps>;

export default function TeamBookingPage(props: TeamBookingPageProps) {
  return <BookingPage {...props} />;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const locale = await getOrSetUserLocaleFromHeaders(context.req);
  const eventTypeId = parseInt(asStringOrThrow(context.query.type));
  if (typeof eventTypeId !== "number" || eventTypeId % 1 !== 0) {
    return {
      notFound: true,
    } as const;
  }

  const eventType = await prisma.eventType.findUnique({
    where: {
      id: eventTypeId,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      length: true,
      locations: true,
      customInputs: true,
      periodType: true,
      periodDays: true,
      periodStartDate: true,
      periodEndDate: true,
      periodCountCalendarDays: true,
      disableGuests: true,
      team: {
        select: {
          slug: true,
          name: true,
          logo: true,
        },
      },
      users: {
        select: {
          avatar: true,
          name: true,
        },
      },
    },
  });

  if (!eventType) return { notFound: true };

  const eventTypeObject = [eventType].map((e) => {
    return {
      ...e,
      periodStartDate: e.periodStartDate?.toString() ?? null,
      periodEndDate: e.periodEndDate?.toString() ?? null,
    };
  })[0];

  let booking = null;

  if (context.query.rescheduleUid) {
    booking = await prisma.booking.findFirst({
      where: {
        uid: asStringOrThrow(context.query.rescheduleUid),
      },
      select: {
        description: true,
        attendees: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
  }

  return {
    props: {
      localeProp: locale,
      profile: {
        ...eventTypeObject.team,
        slug: "team/" + eventTypeObject.slug,
        image: eventTypeObject.team?.logo || null,
        theme: null /* Teams don't have a theme, and `BookingPage` uses it */,
      },
      eventType: eventTypeObject,
      booking,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

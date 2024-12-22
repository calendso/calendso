import { withAppDirSsr } from "app/WithAppDirSsr";
import type { PageProps } from "app/_types";
import { _generateMetadata } from "app/_utils";
import { WithLayout } from "app/layoutHOC";
import { cookies, headers } from "next/headers";

import { getOrgFullOrigin, orgDomainConfig } from "@calcom/features/ee/organizations/lib/orgDomains";
import { constructMeetingImage } from "@calcom/lib/OgImages";
import { SEO_IMG_OGIMG } from "@calcom/lib/constants";
import { EventRepository } from "@calcom/lib/server/repository/event";

import { buildLegacyCtx } from "@lib/buildLegacyCtx";
import { getServerSideProps } from "@lib/team/[slug]/[type]/getServerSideProps";

import LegacyPage, { type PageProps as LegacyPageProps } from "~/team/type-view";

export const generateMetadata = async ({ params, searchParams }: PageProps) => {
  const legacyCtx = buildLegacyCtx(headers(), cookies(), params, searchParams);
  const props = await getData(legacyCtx);
  const { user: username, slug: eventSlug, booking, isSEOIndexable, eventData, isBrandingHidden } = props;
  const { currentOrgDomain, isValidOrgDomain } = orgDomainConfig(legacyCtx.req, legacyCtx.params?.orgSlug);

  const event = await EventRepository.getPublicEvent({
    username,
    eventSlug,
    isTeamEvent: true,
    org: isValidOrgDomain ? currentOrgDomain : null,
    fromRedirectOfNonOrgLink: legacyCtx.query.orgRedirection === "true",
  });

  const profileName = event?.profile?.name ?? "";
  const profileImage = event?.profile.image;
  const title = event?.title ?? "";

  const metadata = await _generateMetadata(
    (t) => `${booking?.uid && !!booking ? t("reschedule") : ""} ${title} | ${profileName}`,
    (t) => `${booking?.uid ? t("reschedule") : ""} ${title}`,
    isBrandingHidden,
    getOrgFullOrigin(eventData.entity.orgSlug ?? null)
  );
  const meeting = {
    title,
    profile: { name: profileName, image: profileImage },
    users: [
      ...(event?.users || []).map((user) => ({
        name: `${user.name}`,
        username: `${user.username}`,
      })),
    ],
  };
  const image = SEO_IMG_OGIMG + constructMeetingImage(meeting);
  return {
    ...metadata,
    nofollow: event?.hidden || !isSEOIndexable,
    noindex: event?.hidden || !isSEOIndexable,
    openGraph: {
      ...metadata.openGraph,
      images: [image],
    },
  };
};
const getData = withAppDirSsr<LegacyPageProps>(getServerSideProps);

export default WithLayout({
  Page: LegacyPage,
  getData,
  getLayout: null,
  isBookingPage: true,
})<"P">;

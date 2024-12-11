"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useCallback, useEffect } from "react";
import { shallow } from "zustand/shallow";

import dayjs from "@calcom/dayjs";
import { sdkActionManager } from "@calcom/embed-core/embed-iframe";
import type { BookerProps } from "@calcom/features/bookings/Booker";
import { Booker as BookerComponent } from "@calcom/features/bookings/Booker";
import { useBookerLayout } from "@calcom/features/bookings/Booker/components/hooks/useBookerLayout";
import { useBookingForm } from "@calcom/features/bookings/Booker/components/hooks/useBookingForm";
import { useBookings } from "@calcom/features/bookings/Booker/components/hooks/useBookings";
import { useCalendars } from "@calcom/features/bookings/Booker/components/hooks/useCalendars";
import { useSlots } from "@calcom/features/bookings/Booker/components/hooks/useSlots";
import { useVerifyCode } from "@calcom/features/bookings/Booker/components/hooks/useVerifyCode";
import { useVerifyEmail } from "@calcom/features/bookings/Booker/components/hooks/useVerifyEmail";
import { useBookerStore, useInitializeBookerStore } from "@calcom/features/bookings/Booker/store";
import { useEvent, useScheduleForEvent } from "@calcom/features/bookings/Booker/utils/event";
import { getLastBookingResponse } from "@calcom/features/bookings/Booker/utils/lastBookingResponse";
import { useBrandColors } from "@calcom/features/bookings/Booker/utils/use-brand-colors";
import { DEFAULT_LIGHT_BRAND_COLOR, DEFAULT_DARK_BRAND_COLOR, WEBAPP_URL } from "@calcom/lib/constants";
import { useRouterQuery } from "@calcom/lib/hooks/useRouterQuery";
import { BookerLayouts } from "@calcom/prisma/zod-utils";

type BookerWebWrapperAtomProps = BookerProps;

export const BookerWebWrapper = (props: BookerWebWrapperAtomProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const event = useEvent({ fromRedirectOfNonOrgLink: props.entity.fromRedirectOfNonOrgLink });
  const bookerLayout = useBookerLayout(event.data);

  const selectedDate = searchParams?.get("date");
  const isRedirect = searchParams?.get("redirected") === "true" || false;
  const fromUserNameRedirected = searchParams?.get("username") || "";
  const rescheduleUid =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("rescheduleUid") : null;
  const rescheduledBy =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("rescheduledBy") : null;
  const bookingUid =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("bookingUid") : null;
  const date = dayjs(selectedDate).format("YYYY-MM-DD");

  useEffect(() => {
    console.log("inside useffect");
    // This event isn't processed by BookingPageTagManager because BookingPageTagManager hasn't loaded when it is fired. I think we should have a queue in fire method to handle this.
    sdkActionManager?.fire("navigatedToBooker", {});
    //This removes the queryparameters from the url as soon as it gets added on every cliks on layout or calender dates
    history.replaceState(null, "", window.location.pathname);
  });

  useInitializeBookerStore({
    ...props,
    eventId: props.entity.eventTypeId ?? event?.data?.id,
    rescheduleUid,
    rescheduledBy,
    bookingUid: bookingUid,
    layout: bookerLayout.defaultLayout,
    org: props.entity.orgSlug,
  });

  const [bookerState, _] = useBookerStore((state) => [state.state, state.setState], shallow);
  const [dayCount] = useBookerStore((state) => [state.dayCount, state.setDayCount], shallow);

  const { data: session } = useSession();
  const routerQuery = useRouterQuery();
  const hasSession = !!session;
  const firstNameQueryParam = searchParams?.get("firstName");
  const lastNameQueryParam = searchParams?.get("lastName");
  const metadata = Object.keys(routerQuery)
    .filter((key) => key.startsWith("metadata"))
    .reduce(
      (metadata, key) => ({
        ...metadata,
        [key.substring("metadata[".length, key.length - 1)]: searchParams?.get(key),
      }),
      {}
    );
  const prefillFormParams = useMemo(() => {
    return {
      name:
        searchParams?.get("name") ||
        (firstNameQueryParam ? `${firstNameQueryParam} ${lastNameQueryParam}` : null),
      guests: (searchParams?.getAll("guests") || searchParams?.getAll("guest")) ?? [],
    };
  }, [searchParams, firstNameQueryParam, lastNameQueryParam]);

  const lastBookingResponse = getLastBookingResponse();

  const bookerForm = useBookingForm({
    event: event.data,
    sessionEmail: session?.user.email,
    sessionUsername: session?.user.username,
    sessionName: session?.user.name,
    hasSession,
    extraOptions: routerQuery,
    prefillFormParams,
    lastBookingResponse,
  });
  const calendars = useCalendars({ hasSession });
  const verifyEmail = useVerifyEmail({
    email: bookerForm.formEmail,
    name: bookerForm.formName,
    requiresBookerEmailVerification: event?.data?.requiresBookerEmailVerification,
    onVerifyEmail: bookerForm.beforeVerifyEmail,
  });
  const slots = useSlots(event);

  const prefetchNextMonth =
    (bookerLayout.layout === BookerLayouts.WEEK_VIEW &&
      !!bookerLayout.extraDays &&
      dayjs(date).month() !== dayjs(date).add(bookerLayout.extraDays, "day").month()) ||
    (bookerLayout.layout === BookerLayouts.COLUMN_VIEW &&
      dayjs(date).month() !== dayjs(date).add(bookerLayout.columnViewExtraDays.current, "day").month());

  const monthCount =
    ((bookerLayout.layout !== BookerLayouts.WEEK_VIEW && bookerState === "selecting_time") ||
      bookerLayout.layout === BookerLayouts.COLUMN_VIEW) &&
    dayjs(date).add(1, "month").month() !==
      dayjs(date).add(bookerLayout.columnViewExtraDays.current, "day").month()
      ? 2
      : undefined;
  /**
   * Prioritize dateSchedule load
   * Component will render but use data already fetched from here, and no duplicate requests will be made
   * */
  const schedule = useScheduleForEvent({
    prefetchNextMonth,
    eventId: props.entity.eventTypeId ?? event.data?.id,
    username: props.username,
    monthCount,
    dayCount,
    eventSlug: props.eventSlug,
    month: props.month,
    duration: props.duration,
    selectedDate,
    teamMemberEmail: props.teamMemberEmail,
    fromRedirectOfNonOrgLink: props.entity.fromRedirectOfNonOrgLink,
    isTeamEvent: props.isTeamEvent ?? !!event.data?.team,
  });
  const bookings = useBookings({
    event,
    hashedLink: props.hashedLink,
    bookingForm: bookerForm.bookingForm,
    metadata: metadata ?? {},
    teamMemberEmail: props.teamMemberEmail,
  });

  const verifyCode = useVerifyCode({
    onSuccess: () => {
      if (!bookerForm.formEmail) return;

      verifyEmail.setVerifiedEmail(bookerForm.formEmail);
      verifyEmail.setEmailVerificationModalVisible(false);
      bookings.handleBookEvent();
    },
  });

  // Toggle query param for overlay calendar
  const onOverlaySwitchStateChange = useCallback(
    (state: boolean) => {
      const current = new URLSearchParams(Array.from(searchParams?.entries() ?? []));
      if (state) {
        current.set("overlayCalendar", "true");
        localStorage.setItem("overlayCalendarSwitchDefault", "true");
      } else {
        current.delete("overlayCalendar");
        localStorage.removeItem("overlayCalendarSwitchDefault");
      }
      // cast to string
      const value = current.toString();
      const query = value ? `?${value}` : "";
      router.push(`${pathname}${query}`);
    },
    [searchParams, pathname, router]
  );
  useBrandColors({
    brandColor: event.data?.profile.brandColor ?? DEFAULT_LIGHT_BRAND_COLOR,
    darkBrandColor: event.data?.profile.darkBrandColor ?? DEFAULT_DARK_BRAND_COLOR,
    theme: event.data?.profile.theme,
  });

  const areInstantMeetingParametersSet = Boolean(
    event.data?.instantMeetingParameters &&
      searchParams &&
      event.data.instantMeetingParameters?.every?.((param) =>
        Array.from(searchParams.values()).includes(param)
      )
  );

  return (
    <BookerComponent
      {...props}
      onGoBackInstantMeeting={() => {
        if (pathname) window.location.href = pathname;
      }}
      onConnectNowInstantMeeting={() => {
        const newPath = `${pathname}?isInstantMeeting=true`;
        router.push(newPath);
      }}
      onOverlayClickNoCalendar={() => {
        router.push("/apps/categories/calendar");
      }}
      onClickOverlayContinue={() => {
        const newUrl = new URL(`${WEBAPP_URL}/login`);
        newUrl.searchParams.set("callbackUrl", window.location.pathname);
        newUrl.searchParams.set("overlayCalendar", "true");
        router.push(newUrl.toString());
      }}
      onOverlaySwitchStateChange={onOverlaySwitchStateChange}
      sessionUsername={session?.user.username}
      isRedirect={isRedirect}
      fromUserNameRedirected={fromUserNameRedirected}
      rescheduleUid={rescheduleUid}
      rescheduledBy={rescheduledBy}
      bookingUid={bookingUid}
      hasSession={hasSession}
      extraOptions={routerQuery}
      bookings={bookings}
      calendars={calendars}
      slots={slots}
      verifyEmail={verifyEmail}
      bookerForm={bookerForm}
      event={event}
      bookerLayout={bookerLayout}
      schedule={schedule}
      verifyCode={verifyCode}
      isPlatform={false}
      areInstantMeetingParametersSet={areInstantMeetingParametersSet}
      userLocale={session?.user.locale}
    />
  );
};

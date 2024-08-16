import type { EventType } from "@prisma/client";
import { useRouter } from "next/navigation";

import type { PaymentPageProps } from "@calcom/ee/payments/pages/payment";
import type { BookingResponse } from "@calcom/features/bookings/types";
import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { navigateInTopWindow } from "@calcom/lib/navigateInTopWindow";

function getNewSeachParams(args: {
  query: Record<string, string | null | undefined | boolean>;
  searchParams?: URLSearchParams;
}) {
  const { query, searchParams } = args;
  const newSearchParams = new URLSearchParams(searchParams);
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }
    newSearchParams.append(key, String(value));
  });
  return newSearchParams;
}

type SuccessRedirectBookingType = Pick<
  BookingResponse | PaymentPageProps["booking"],
  "uid" | "title" | "description" | "startTime" | "endTime" | "location" | "responses" | "references"
>;

export const getBookingRedirectExtraParams = (booking: SuccessRedirectBookingType) => {
  type BookingResponseKey = keyof SuccessRedirectBookingType;
  const redirectQueryParamKeys: BookingResponseKey[] = [
    "title",
    "description",
    "startTime",
    "endTime",
    "location",
  ];

  const basicParams = (Object.keys(booking) as BookingResponseKey[])
    .filter((key) => redirectQueryParamKeys.includes(key))
    .reduce((obj, key) => ({ ...obj, [key]: booking[key] }), {});

  const serializeResponseValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(",");
    } else if (typeof value === "object" && value !== null) {
      return encodeURIComponent(JSON.stringify(value));
    } else {
      return String(value);
    }
  };

  const responseParams = booking.responses
    ? Object.keys(booking.responses).reduce((obj, key) => {
        obj[`responses.${key}`] = serializeResponseValue(booking.responses[key]);
        return obj;
      }, {} as Record<string, any>)
    : {};

  const meetingLink = booking.references?.find(
    (ref) => ref.meetingUrl
  )?.meetingUrl;

  return {
    ...basicParams,
    ...responseParams,
    ...(meetingLink ? { "responses.meetingLink": meetingLink } : {}),
  };
};

export const useBookingSuccessRedirect = () => {
  const router = useRouter();
  const searchParams = useCompatSearchParams();
  const bookingSuccessRedirect = ({
    successRedirectUrl,
    query,
    booking,
    forwardParamsSuccessRedirect,
  }: {
    successRedirectUrl: EventType["successRedirectUrl"];
    forwardParamsSuccessRedirect: EventType["forwardParamsSuccessRedirect"];
    query: Record<string, string | null | undefined | boolean>;
    booking: SuccessRedirectBookingType;
  }) => {
    if (successRedirectUrl) {
      const url = new URL(successRedirectUrl);
      // Using parent ensures, Embed iframe would redirect outside of the iframe.
      if (!forwardParamsSuccessRedirect) {
        navigateInTopWindow(url.toString());
        return;
      }
      const bookingExtraParams = getBookingRedirectExtraParams(booking);
      const newSearchParams = getNewSeachParams({
        query: {
          ...query,
          ...bookingExtraParams,
        },
        searchParams: searchParams ?? undefined,
      });

      newSearchParams.forEach((value, key) => {
        url.searchParams.append(key, value);
      });

      navigateInTopWindow(url.toString());
      return;
    }
    const newSearchParams = getNewSeachParams({ query });
    return router.push(`/booking/${booking.uid}?${newSearchParams.toString()}`);
  };

  return bookingSuccessRedirect;
};

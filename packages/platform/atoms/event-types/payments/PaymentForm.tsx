import React, { Suspense, useState, useEffect } from "react";

import { getSuccessPageLocationMessage } from "@calcom/app-store/locations";
import dayjs from "@calcom/dayjs";
import { PayIcon } from "@calcom/features/bookings/components/event-meta/PayIcon";
import { Price } from "@calcom/features/bookings/components/event-meta/Price";
import { APP_NAME, WEBSITE_URL } from "@calcom/lib/constants";
import getPaymentAppData from "@calcom/lib/getPaymentAppData";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { isBrowserLocale24h, getIs24hClockFromLocalStorage } from "@calcom/lib/timeFormat";

import { AtomsWrapper } from "../../src/components/atoms-wrapper";
import { cn } from "../../src/lib/utils";
import { useAtomsEventTypePaymentInfo } from "../hooks/useAtomEventTypePaymentInfo";

const StripePaymentForm = React.lazy(() => import("./StripePaymentForm"));

const PaymentForm = ({ paymentUid }: { paymentUid: string }) => {
  const { t, i18n } = useLocale();
  const { data: paymentInfo, isLoading } = useAtomsEventTypePaymentInfo(paymentUid);

  const [is24h, setIs24h] = useState(isBrowserLocale24h());
  const [date, setDate] = useState(dayjs.utc(paymentInfo?.booking.startTime));
  const [timezone, setTimezone] = useState<string | null>(null);
  const paymentAppData = getPaymentAppData(paymentInfo?.eventType);
  const eventName = paymentInfo?.booking.title;

  useEffect(() => {
    const _timezone =
      localStorage.getItem("timeOption.preferredTimeZone") || dayjs.tz.guess() || "Europe/London";
    setTimezone(_timezone);
    setDate(date.tz(_timezone));
    setIs24h(!!getIs24hClockFromLocalStorage());
  }, []);

  if (isLoading) return <>Loading...</>;

  if (!isLoading && !paymentInfo) return null;

  return (
    <AtomsWrapper>
      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <main className="mx-auto">
            <div>
              <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                <div className="inset-0 my-4 transition-opacity sm:my-0" aria-hidden="true">
                  <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
                    &#8203;
                  </span>
                  <div
                    className={cn(
                      "main bg-default border-subtle inline-block transform overflow-hidden rounded-lg border px-8 pb-4 pt-5 text-left align-bottom transition-all  sm:my-8 sm:w-full sm:max-w-lg sm:py-6 sm:align-middle"
                    )}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-headline">
                    <div>
                      <div className="bg-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                        <PayIcon currency={paymentAppData.currency} className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <h3 className="text-emphasis text-2xl font-semibold leading-6" id="modal-headline">
                          {paymentAppData.paymentOption === "HOLD"
                            ? t("complete_your_booking")
                            : t("payment")}
                        </h3>
                        <div className="text-default mt-4 grid grid-cols-3 border-b border-t py-4 text-left dark:border-gray-900 dark:text-gray-300">
                          <div className="font-medium">{t("what")}</div>
                          <div className="col-span-2 mb-6">{eventName}</div>
                          <div className="font-medium">{t("when")}</div>
                          <div className="col-span-2 mb-6">
                            {date.format("dddd, DD MMMM YYYY")}
                            <br />
                            {date.format(is24h ? "H:mm" : "h:mma")} - {paymentInfo.eventType.length} mins{" "}
                            <span className="text-subtle">({timezone})</span>
                          </div>
                          {paymentInfo.booking.location && (
                            <>
                              <div className="font-medium">{t("where")}</div>
                              <div className="col-span-2 mb-6">
                                {getSuccessPageLocationMessage(paymentInfo.booking.location, t)}
                              </div>
                            </>
                          )}
                          <div className="font-medium">
                            {paymentInfo.payment.paymentOption === "HOLD" ? t("no_show_fee") : t("price")}
                          </div>
                          <div className="col-span-2 mb-6 font-semibold">
                            <Price
                              currency={paymentAppData.currency}
                              price={paymentAppData.price}
                              displayAlternateSymbol={false}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      {paymentInfo.payment.success && !paymentInfo.payment.refunded && (
                        <div className="text-default mt-4 text-center dark:text-gray-300">{t("paid")}</div>
                      )}
                      {paymentInfo.payment.appId === "stripe" && !paymentInfo.payment.success && (
                        <StripePaymentForm
                          clientSecret={paymentInfo.clientSecret}
                          payment={paymentInfo.payment}
                          eventType={paymentInfo.eventType}
                          user={paymentInfo.user}
                          location={paymentInfo.booking.location}
                          booking={paymentInfo.booking}
                          uid={uid}
                        />
                      )}
                      {paymentInfo.payment.refunded && (
                        <div className="text-default mt-4 text-center dark:text-gray-300">
                          {t("refunded")}
                        </div>
                      )}
                    </div>
                    {!paymentInfo.profile.hideBranding && (
                      <div className="text-muted dark:text-inverted mt-4 border-t pt-4 text-center text-xs dark:border-gray-900">
                        <a href={`${WEBSITE_URL}/signup`}>
                          {t("create_booking_link_with_calcom", { appName: APP_NAME })}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </Suspense>
      </div>
    </AtomsWrapper>
  );
};

export default PaymentForm;

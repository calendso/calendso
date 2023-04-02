import type { Payment } from "@prisma/client";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import type { StripeCardElementChangeEvent, StripeElementLocale } from "@stripe/stripe-js";
import type stripejs from "@stripe/stripe-js";
import { Trans } from "next-i18next";
import { useRouter } from "next/router";
import { stringify } from "querystring";
import type { SyntheticEvent } from "react";
import { useEffect, useState } from "react";
import { IntlProvider, FormattedNumber } from "react-intl";

import type { StripePaymentData } from "@calcom/app-store/stripepayment/lib/server";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button, Checkbox } from "@calcom/ui";

const CARD_OPTIONS: stripejs.StripeCardElementOptions = {
  iconStyle: "solid" as const,
  classes: {
    base: "block p-2 w-full border-solid border-2 border-gray-300 rounded-md dark:bg-black dark:text-white dark:border-black focus-within:ring-black focus-within:border-black text-sm",
  },
  style: {
    base: {
      color: "#666",
      iconColor: "#666",
      fontFamily: "ui-sans-serif, system-ui",
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#888888",
      },
    },
  },
} as const;

type Props = {
  payment: Payment & {
    data: StripePaymentData | { setupIntent: StripeSetupData };
  };
  eventType: { id: number };
  user: { username: string | null };
  location?: string | null;
  bookingId: number;
  bookingUid: string;
};

type States =
  | { status: "idle" }
  | { status: "processing" }
  | { status: "error"; error: Error }
  | { status: "ok" };

export default function PaymentComponent(props: Props) {
  console.log("🚀 ~ file: Payment.tsx:52 ~ PaymentComponent ~ props:", props);
  const { t, i18n } = useLocale();
  const router = useRouter();
  const [state, setState] = useState<States>({ status: "idle" });
  const stripe = useStripe();
  const elements = useElements();
  const paymentOption = props.payment.paymentOption;
  const [holdAcknowledged, setHoldAcknowledged] = useState<boolean>(paymentOption === "HOLD" ? false : true);

  useEffect(() => {
    elements?.update({ locale: i18n.language as StripeElementLocale });
  }, [elements, i18n.language]);

  const handleChange = async (event: StripeCardElementChangeEvent) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setState({ status: "idle" });
    if (event.error)
      setState({ status: "error", error: new Error(event.error?.message || t("missing_card_fields")) });
  };

  const handleSubmit = async (ev: SyntheticEvent) => {
    ev.preventDefault();

    if (!stripe || !elements || !router.isReady) return;
    const card = elements.getElement(CardElement);
    if (!card) return;
    setState({ status: "processing" });

    let payload;
    const params: { [k: string]: any } = {
      uid: props.bookingUid,
      email: router.query.email,
    };
    const query = stringify(params);
    const successUrl = `/booking/${props.bookingUid}?${query}`;
    if (paymentOption === "HOLD") {
      payload = await stripe.confirmCardSetup(props.payment.data.setupIntent.client_secret!, {
        payment_method: {
          card,
        },
      });
    } else if (paymentOption === "ON_BOOKING") {
      payload = await stripe.confirmCardPayment(props.payment.data.client_secret!, {
        payment_method: {
          card,
        },
      });
    }
    if (payload?.error) {
      setState({
        status: "error",
        error: new Error(`Payment failed: ${payload.error.message}`),
      });
    } else {
      if (props.location) {
        if (props.location.includes("integration")) {
          params.location = t("web_conferencing_details_to_follow");
        } else {
          params.location = props.location;
        }
      }

      await router.push(successUrl);
    }
  };
  return (
    <form id="payment-form" className="mt-4" onSubmit={handleSubmit}>
      <CardElement id="card-element" options={CARD_OPTIONS} onChange={handleChange} />
      {paymentOption === "HOLD" && (
        <>
          <Checkbox
            description={
              <Trans i18nKey="acknowledge_booking_hold">
                I acknowledge that if I do not show up the to booking then my card will be charged for{" "}
                <IntlProvider locale="en">
                  <FormattedNumber
                    value={props.payment.amount / 100.0}
                    style="currency"
                    currency={props.payment.currency?.toUpperCase()}
                  />
                </IntlProvider>
                .
              </Trans>
            }
            onChange={(e) => setHoldAcknowledged(e.target.checked)}
            className="mt-4"
          />
        </>
      )}
      <div className="mt-2 flex justify-center">
        <Button
          color="primary"
          type="submit"
          disabled={!holdAcknowledged || ["processing", "error"].includes(state.status)}
          loading={state.status === "processing"}
          id="submit">
          <span id="button-text">
            {state.status === "processing" ? (
              <div className="spinner" id="spinner" />
            ) : paymentOption === "HOLD" ? (
              t("submit_card")
            ) : (
              t("pay_now")
            )}
          </span>
        </Button>
      </div>
      {state.status === "error" && (
        <div className="mt-4 text-center text-gray-700 dark:text-gray-300" role="alert">
          {state.error.message}
        </div>
      )}
    </form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ErrorCode } from "@calcom/features/auth/lib/ErrorCode";
import { HOSTED_CAL_FEATURES, WEBAPP_URL, WEBSITE_URL } from "@calcom/lib/constants";
import { getSafeRedirectUrl } from "@calcom/lib/getSafeRedirectUrl";
import { useCompatSearchParams } from "@calcom/lib/hooks/useCompatSearchParams";
import { useLastUsed } from "@calcom/lib/hooks/useLastUsed";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { collectPageParameters, telemetryEventTypes, useTelemetry } from "@calcom/lib/telemetry";
import { trpc } from "@calcom/trpc/react";
import { Button } from "@calcom/ui";

import type { inferSSRProps } from "@lib/types/inferSSRProps";
import type { WithNonceProps } from "@lib/withNonce";

import AddToHomescreen from "@components/AddToHomescreen";
import PageWrapper from "@components/PageWrapper";

import { getServerSideProps } from "@server/lib/auth/login/getServerSideProps";

import Success from "../../modules/bookings/views/bookings-single-view";

interface LoginValues {
  email: string;
  password: string;
  totpCode: string;
  backupCode: string;
  csrfToken: string;
}

const GoogleIcon = () => (
  <img className="text-subtle mr-2 h-4 w-4 dark:invert" src="/google-icon.svg" alt="" />
);
export default function Login({
  csrfToken,
  isGoogleLoginEnabled,
  isSAMLLoginEnabled,
  samlTenantID,
  samlProductID,
  totpEmail,
}: // eslint-disable-next-line @typescript-eslint/ban-types
inferSSRProps<typeof getServerSideProps> & WithNonceProps<{}>) {
  const searchParams = useCompatSearchParams();
  const { t } = useLocale();
  const router = useRouter();
  const formSchema = z
    .object({
      email: z
        .string()
        .min(1, `${t("error_required_field")}`)
        .email(`${t("enter_valid_email")}`),
      ...(!!totpEmail ? {} : { password: z.string().min(1, `${t("error_required_field")}`) }),
    })
    // Passthrough other fields like totpCode
    .passthrough();
  const methods = useForm<LoginValues>({ resolver: zodResolver(formSchema) });
  const { register, formState } = methods;
  const [twoFactorRequired, setTwoFactorRequired] = useState(!!totpEmail || false);
  const [twoFactorLostAccess, setTwoFactorLostAccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUsed, setLastUsed] = useLastUsed();

  const errorMessages: { [key: string]: string } = {
    // [ErrorCode.SecondFactorRequired]: t("2fa_enabled_instructions"),
    // Don't leak information about whether an email is registered or not
    [ErrorCode.IncorrectEmailPassword]: t("incorrect_email_password"),
    [ErrorCode.IncorrectTwoFactorCode]: `${t("incorrect_2fa_code")} ${t("please_try_again")}`,
    [ErrorCode.InternalServerError]: `${t("something_went_wrong")} ${t("please_try_again_and_contact_us")}`,
    [ErrorCode.ThirdPartyIdentityProviderEnabled]: t("account_created_with_identity_provider"),
  };

  const telemetry = useTelemetry();

  let callbackUrl = searchParams?.get("callbackUrl") || "";

  if (/"\//.test(callbackUrl)) callbackUrl = callbackUrl.substring(1);

  // If not absolute URL, make it absolute
  if (!/^https?:\/\//.test(callbackUrl)) {
    callbackUrl = `${WEBAPP_URL}/${callbackUrl}`;
  }

  const safeCallbackUrl = getSafeRedirectUrl(callbackUrl);

  callbackUrl = safeCallbackUrl || "";

  const LoginFooter = (
    <Link href={`${WEBSITE_URL}/signup`} className="text-brand-500 font-medium">
      {t("dont_have_an_account")}
    </Link>
  );

  const TwoFactorFooter = (
    <>
      <Button
        onClick={() => {
          if (twoFactorLostAccess) {
            setTwoFactorLostAccess(false);
            methods.setValue("backupCode", "");
          } else {
            setTwoFactorRequired(false);
            methods.setValue("totpCode", "");
          }
          setErrorMessage(null);
        }}
        StartIcon="arrow-left"
        color="minimal">
        {t("go_back")}
      </Button>
      {!twoFactorLostAccess ? (
        <Button
          onClick={() => {
            setTwoFactorLostAccess(true);
            setErrorMessage(null);
            methods.setValue("totpCode", "");
          }}
          StartIcon="lock"
          color="minimal">
          {t("lost_access")}
        </Button>
      ) : null}
    </>
  );

  const ExternalTotpFooter = (
    <Button
      onClick={() => {
        window.location.replace("/");
      }}
      color="minimal">
      {t("cancel")}
    </Button>
  );

  const onSubmit = async (values: LoginValues) => {
    setErrorMessage(null);
    telemetry.event(telemetryEventTypes.login, collectPageParameters());
    const res = await signIn<"credentials">("credentials", {
      ...values,
      callbackUrl,
      redirect: false,
    });
    if (!res) setErrorMessage(errorMessages[ErrorCode.InternalServerError]);
    // we're logged in! let's do a hard refresh to the desired url
    else if (!res.error) {
      setLastUsed("credentials");
      router.push(callbackUrl);
    } else if (res.error === ErrorCode.SecondFactorRequired) setTwoFactorRequired(true);
    else if (res.error === ErrorCode.IncorrectBackupCode) setErrorMessage(t("incorrect_backup_code"));
    else if (res.error === ErrorCode.MissingBackupCodes) setErrorMessage(t("missing_backup_codes"));
    // fallback if error not found
    else setErrorMessage(errorMessages[res.error] || t("something_went_wrong"));
  };

  const { data, isPending, error } = trpc.viewer.public.ssoConnections.useQuery();

  useEffect(
    function refactorMeWithoutEffect() {
      if (error) {
        setErrorMessage(error.message);
      }
    },
    [error]
  );

  const displaySSOLogin = HOSTED_CAL_FEATURES
    ? true
    : isSAMLLoginEnabled && !isPending && data?.connectionExists;

  return (
    <div className="dark:bg-brand dark:text-brand-contrast text-emphasis min-h-screen [--cal-brand-emphasis:#101010] [--cal-brand-subtle:#9CA3AF] [--cal-brand-text:white] [--cal-brand:#111827] dark:[--cal-brand-emphasis:#e1e1e1] dark:[--cal-brand-text:black] dark:[--cal-brand:white]">
      <Success
        userTimeFormat={null}
        requiresLoginToUpdate={false}
        rescheduledToUid={null}
        orgSlug={null}
        themeBasis={null}
        hideBranding={false}
        profile={{ name: "" }}
        eventType={{ eventName: "", bookingFields: [] }}
        recurringBookings={null}
        trpcState={undefined}
        dynamicEventName=""
        bookingInfo={{
          location: null,
          attendees: [{ email: "", name: "", phone: "" }],
          notes: null,
          title: null,
          startTime: new Date().setHours(new Date().getHours() + 13),
          endTime: new Date().setHours(new Date().getHours() + 14),
          responses: { name: "" },
        }}
        paymentStatus={null}
      />
      <AddToHomescreen />
    </div>
  );
}

export { getServerSideProps };

Login.PageWrapper = PageWrapper;

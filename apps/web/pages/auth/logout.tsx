import type { GetServerSidePropsContext } from "next";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { WEBSITE_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { Button } from "@calcom/ui";
import { Check } from "@calcom/ui/components/icon";

import type { inferSSRProps } from "@lib/types/inferSSRProps";

import PageWrapper from "@components/PageWrapper";
import AuthContainer from "@components/ui/AuthContainer";

import { ssrInit } from "@server/lib/ssr";

type Props = inferSSRProps<typeof getServerSideProps>;

export function Logout(props: Props) {
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const { status } = useSession();
  if (status === "authenticated") signOut({ redirect: false });
  const router = useRouter();
  useEffect(() => {
    if (props.query?.survey === "true") {
      router.push(`${WEBSITE_URL}/cancellation`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.query?.survey]);
  const { t } = useLocale();

  const message = () => {
    if (props.query?.passReset === "true") return "reset_your_password";
    if (props.query?.emailChange === "true") return "email_change";
    return "hope_to_see_you_soon";
  };

  const navigateToLogin = () => {
    setBtnLoading(true);
    router.push("/auth/login");
  };

  return (
    <AuthContainer title={t("logged_out")} description={t("youve_been_logged_out")} showLogo>
      <div className="mb-4">
        <div className="bg-success mx-auto flex h-12 w-12 items-center justify-center rounded-full">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-emphasis text-lg font-medium leading-6" id="modal-title">
            {t("youve_been_logged_out")}
          </h3>
          <div className="mt-2">
            <p className="text-subtle text-sm">{t(message())}</p>
          </div>
        </div>
      </div>
      <Button onClick={navigateToLogin} className="flex w-full justify-center" loading={btnLoading}>
        {t("go_back_login")}
      </Button>
    </AuthContainer>
  );
}

Logout.isThemeSupported = false;
Logout.PageWrapper = PageWrapper;
export default Logout;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const ssr = await ssrInit(context);
  // Deleting old cookie manually, remove this code after all existing cookies have expired
  context.res.setHeader(
    "Set-Cookie",
    "next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
  );

  return {
    props: {
      trpcState: ssr.dehydrate(),
      query: context.query,
    },
  };
}

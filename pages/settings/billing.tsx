import { ExternalLinkIcon } from "@heroicons/react/solid";
import { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { getSession } from "@lib/auth";
import { getOrSetUserLocaleFromHeaders } from "@lib/core/i18n/i18n.utils";
import { useLocale } from "@lib/hooks/useLocale";
import prisma from "@lib/prisma";

import SettingsShell from "@components/SettingsShell";
import Shell from "@components/Shell";
import Button from "@components/ui/Button";

export default function Billing() {
  const { t } = useLocale();

  return (
    <Shell heading={t("billing")} subtitle={t("manage_your_billing_info")}>
      <SettingsShell>
        <div className="py-6 lg:pb-8 lg:col-span-9">
          <div className="bg-white border sm:rounded-sm">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {t("view_and_manage_billing_details")}
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>{t("view_and_edit_billing_details")}</p>
              </div>
              <div className="mt-5">
                <form
                  method="POST"
                  action={`${process.env.NEXT_PUBLIC_BASE_URL}/api/integrations/stripepayment/portal`}>
                  <Button type="submit">
                    {t("go_to_billing_portal")} <ExternalLinkIcon className="ml-1 w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-gray-50 sm:rounded-sm border">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{t("need_anything_else")}</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>{t("further_billing_help")}</p>
              </div>
              <div className="mt-5">
                <Button href="mailto:help@cal.com" color="secondary" type="submit">
                  {t("contact_our_support_team")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SettingsShell>
    </Shell>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getSession(context);
  const locale = await getOrSetUserLocaleFromHeaders(context.req);

  if (!session) {
    return { redirect: { permanent: false, destination: "/auth/login" } };
  }

  const user = await prisma.user.findFirst({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      bio: true,
      avatar: true,
      timeZone: true,
      weekStart: true,
    },
  });

  return {
    props: {
      session,
      user,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

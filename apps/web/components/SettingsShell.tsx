import {
  CodeIcon,
  CreditCardIcon,
  KeyIcon,
  LockClosedIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/solid";
import React from "react";

import { useLocale } from "@calcom/lib/hooks/useLocale";

import NavTabs from "./NavTabs";

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();

  const tabs = [
    {
      name: t("profile"),
      href: "/settings/profile",
      icon: UserIcon,
    },
    {
      name: t("security"),
      href: "/settings/security",
      icon: KeyIcon,
    },
    {
      name: t("developer"),
      href: "/settings/developer",
      icon: CodeIcon,
    },
    {
      name: t("teams"),
      href: "/settings/teams",
      icon: UserGroupIcon,
    },
    {
      name: t("billing"),
      href: "/settings/billing",
      icon: CreditCardIcon,
    },
    {
      name: t("admin"),
      href: "/settings/admin",
      icon: LockClosedIcon,
      adminRequired: true,
    },
  ];

  return (
    <>
      <div className="sm:mx-auto">
        <NavTabs tabs={tabs} />
      </div>
      <main className="max-w-4xl">{children}</main>
    </>
  );
}

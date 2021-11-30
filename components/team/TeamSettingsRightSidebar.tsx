import { ExternalLinkIcon, LinkIcon, TrashIcon } from "@heroicons/react/solid";
import Link from "next/link";
import React from "react";

import { useLocale } from "@lib/hooks/useLocale";
import showToast from "@lib/notification";
import { TeamWithMembers } from "@lib/queries/teams";
import { trpc } from "@lib/trpc";

import { Dialog, DialogTrigger } from "@components/Dialog";
import ConfirmationDialogContent from "@components/dialog/ConfirmationDialogContent";
import LinkIconButton from "@components/ui/LinkIconButton";

export default function TeamSettingsRightSidebar(props: { team: TeamWithMembers }) {
  const { t } = useLocale();
  const utils = trpc.useContext();

  const permalink = `${process.env.NEXT_PUBLIC_APP_URL}/team/${props.team?.slug}`;

  const deleteTeamMutation = trpc.useMutation("viewer.teams.delete", {
    async onSuccess() {
      await utils.invalidateQueries(["viewer.teams.get"]);
      showToast(t("your_team_updated_successfully"), "success");
    },
  });

  function deleteTeam() {
    if (props.team?.id) deleteTeamMutation.mutate({ teamId: props.team.id });
  }

  return (
    <div className="px-2 space-y-6">
      {/* 
        // TODO: add ability to hide teams from main view, maybe this belongs on the view itself instead? or both
        <Switch
        name="isHidden"
        defaultChecked={hidden}
        onCheckedChange={setHidden}
        label={"Hide team from view"}
      /> */}
      <div className="space-y-1">
        <Link href={permalink} passHref={true}>
          <a target="_blank">
            <LinkIconButton Icon={ExternalLinkIcon}>{t("preview")}</LinkIconButton>
          </a>
        </Link>
        <LinkIconButton
          Icon={LinkIcon}
          onClick={() => {
            navigator.clipboard.writeText(permalink);
            showToast("Copied to clipboard", "success");
          }}>
          {t("copy_link_team")}
        </LinkIconButton>
        <Dialog>
          <DialogTrigger asChild>
            <LinkIconButton
              onClick={(e) => {
                e.stopPropagation();
              }}
              Icon={TrashIcon}>
              {t("disband_team")}
            </LinkIconButton>
          </DialogTrigger>
          <ConfirmationDialogContent
            variety="danger"
            title={t("disband_team")}
            confirmBtnText={t("confirm_disband_team")}
            onConfirm={deleteTeam}>
            {t("disband_team_confirmation_message")}
          </ConfirmationDialogContent>
        </Dialog>
      </div>
      {/* TODO: Team availability */}
      {/* <div className="mt-5 space-y-1">
        <LinkIconButton Icon={ClockIcon}>{"View Availability"}</LinkIconButton>
        <p className="mt-2 text-sm text-gray-500">See your team members availability at a glance.</p>
      </div> */}
    </div>
  );
}

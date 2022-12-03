import { useState } from "react";

import { WEBAPP_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { Alert, Button, EmptyScreen, Icon } from "@calcom/ui";

import SkeletonLoaderTeamList from "./SkeletonloaderTeamList";
import TeamList from "./TeamList";

export function TeamsListing() {
  const { t } = useLocale();
  const [errorMessage, setErrorMessage] = useState("");

  const { data, isLoading } = trpc.viewer.teams.list.useQuery(undefined, {
    onError: (e) => {
      setErrorMessage(e.message);
    },
  });

  const teams = data?.filter((m) => m.accepted) || [];
  const invites = data?.filter((m) => !m.accepted) || [];

  const features = [
    {
      icon: <Icon.FiUsers className="h-5 w-5 text-gray-700" />,
      title: t("collective_scheduling"),
      description: t("make_it_easy_to_book"),
    },
    {
      icon: <Icon.FiRefreshCcw className="h-5 w-5 text-gray-700" />,
      title: t("round_robin"),
      description: t("find_the_best_person"),
    },
    {
      icon: <Icon.FiUserPlus className="h-5 w-5 text-gray-700" />,
      title: t("fixed_round_robin"),
      description: t("add_one_fixed_attendee"),
    },
  ];

  return (
    <>
      {!!errorMessage && <Alert severity="error" title={errorMessage} />}
      {invites.length > 0 && (
        <div className="mb-4">
          <h1 className="mb-2 text-lg font-medium">{t("open_invitations")}</h1>
          <TeamList teams={invites} />
        </div>
      )}
      {isLoading && <SkeletonLoaderTeamList />}
      {!teams.length && !isLoading && (
        <>
          <div className="max-w-[1118px]">
            <div
              className="flex w-full justify-between overflow-hidden rounded-lg bg-no-repeat pt-4 pb-10 md:min-h-[295px] md:pt-10"
              style={{ background: "url(/team-banner-background.svg)" }}>
              <div className="mt-3 px-14">
                <h1 className="font-cal text-3xl">{t("calcom_is_better_with_team")}</h1>
                <p className="my-4 max-w-sm text-gray-600">{t("add_your_team_members")}</p>
                <div className="space-x-2">
                  <Button color="primary" href={`${WEBAPP_URL}/settings/teams/new`}>
                    {t("create_team")}
                  </Button>
                  <Button href="https://go.cal.com/teams-video" target="_blank" color="secondary">
                    {t("learn_more")}
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-6 grid-cols-3 md:grid md:gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="mb-6 min-h-[180px] w-full rounded-md p-8"
                  style={{
                    background:
                      "linear-gradient(0deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), radial-gradient(121.58% 100% at 50.07% 100%, #8690A6 0%, #D5D5D6 100%)",
                  }}>
                  {feature.icon}
                  <h2 className="font-cal mt-4 text-lg">{feature.title}</h2>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          <iframe
            className="mb-16 aspect-video w-full rounded-md"
            src="https://www.youtube.com/embed/EAc46SPL6iA"
            title="YouTube video player"
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </>
      )}
      {teams.length > 0 && <TeamList teams={teams} />}
    </>
  );
}

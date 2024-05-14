import type { GetServerSidePropsContext } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Toaster } from "react-hot-toast";
import { z } from "zod";

import checkForMultiplePaymentApps from "@calcom/app-store/_utils/payments/checkForMultiplePaymentApps";
import useAddAppMutation from "@calcom/app-store/_utils/useAddAppMutation";
import { appStoreMetadata } from "@calcom/app-store/appStoreMetaData";
import { getLocationGroupedOptions } from "@calcom/app-store/server";
import type { EventTypeAppSettingsComponentProps, EventTypeModel } from "@calcom/app-store/types";
import { isConferencing as isConferencingApp } from "@calcom/app-store/utils";
import type { LocationObject } from "@calcom/core/location";
import { getLocale } from "@calcom/features/auth/lib/getLocale";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import type { LocationFormValues } from "@calcom/features/eventtypes/lib/types";
import { AppOnboardingSteps } from "@calcom/lib/apps/appOnboardingSteps";
import { getAppOnboardingUrl } from "@calcom/lib/apps/getAppOnboardingUrl";
import { WEBAPP_URL } from "@calcom/lib/constants";
import { CAL_URL } from "@calcom/lib/constants";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { getTranslation } from "@calcom/lib/server";
import prisma from "@calcom/prisma";
import { SchedulingType } from "@calcom/prisma/enums";
import { eventTypeBookingFields } from "@calcom/prisma/zod-utils";
import type { EventTypeMetaDataSchema } from "@calcom/prisma/zod-utils";
import { trpc } from "@calcom/trpc/react";
import type { AppMeta } from "@calcom/types/App";
import { Form, Steps, showToast } from "@calcom/ui";

import { HttpError } from "@lib/core/http/error";

import PageWrapper from "@components/PageWrapper";
import type { PersonalAccountProps, TeamsProp } from "@components/apps/installation/AccountsStepCard";
import { AccountsStepCard } from "@components/apps/installation/AccountsStepCard";
import { ConfigureStepCard } from "@components/apps/installation/ConfigureStepCard";
import { EventTypesStepCard } from "@components/apps/installation/EventTypesStepCard";
import { StepHeader } from "@components/apps/installation/StepHeader";
import type { TLocationOptions } from "@components/eventtype/Locations";

export type TEventType = EventTypeAppSettingsComponentProps["eventType"] &
  Pick<
    EventTypeModel,
    "metadata" | "schedulingType" | "slug" | "requiresConfirmation" | "position" | "destinationCalendar"
  > & {
    selected: boolean;
    locationOptions?: TLocationOptions;
    locations: LocationFormValues["locations"];
    bookingFields?: LocationFormValues["bookingFields"];
  };

export type TEventTypesForm = {
  eventTypes: TEventType[];
};

const STEPS = [
  AppOnboardingSteps.ACCOUNTS_STEP,
  AppOnboardingSteps.EVENT_TYPES_STEP,
  AppOnboardingSteps.CONFIGURE_STEP,
] as const;
const MAX_NUMBER_OF_STEPS = STEPS.length;

type StepType = (typeof STEPS)[number];

type StepObj = Record<
  StepType,
  {
    getTitle: (appName: string) => string;
    getDescription: (appName: string) => string;
    stepNumber: number;
  }
>;

type OnboardingPageProps = {
  appMetadata: AppMeta;
  step: StepType;
  teams?: TeamsProp;
  personalAccount: PersonalAccountProps;
  eventTypes?: TEventType[];
  userName: string;
  credentialId?: number;
  showEventTypesStep: boolean;
  isConferencing: boolean;
};

const OnboardingPage = ({
  step,
  teams,
  personalAccount,
  appMetadata,
  eventTypes,
  userName,
  credentialId,
  showEventTypesStep,
  isConferencing,
}: OnboardingPageProps) => {
  const { t } = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const STEPS_MAP: StepObj = {
    [AppOnboardingSteps.ACCOUNTS_STEP]: {
      getTitle: () => `${t("select_account_header")}`,
      getDescription: (appName) => `${t("select_account_description", { appName })}`,
      stepNumber: 1,
    },
    [AppOnboardingSteps.EVENT_TYPES_STEP]: {
      getTitle: () => `${t("select_event_types_header")}`,
      getDescription: (appName) => `${t("select_event_types_description", { appName })}`,
      stepNumber: 2,
    },
    [AppOnboardingSteps.CONFIGURE_STEP]: {
      getTitle: (appName) => `${t("configure_app_header", { appName })}`,
      getDescription: () => `${t("configure_app_description")}`,
      stepNumber: 3,
    },
  } as const;
  const [configureStep, setConfigureStep] = useState(false);
  const [isSelectingAccount, setIsSelectingAccount] = useState(false);

  const currentStep: AppOnboardingSteps = useMemo(() => {
    if (step == AppOnboardingSteps.EVENT_TYPES_STEP && configureStep) {
      return AppOnboardingSteps.CONFIGURE_STEP;
    }
    return step;
  }, [step, configureStep]);
  const stepObj = STEPS_MAP[currentStep];

  const utils = trpc.useContext();

  const formPortalRef = useRef<HTMLDivElement>(null);

  const formMethods = useForm<TEventTypesForm>({
    defaultValues: {
      eventTypes,
    },
  });
  const mutation = useAddAppMutation(null);

  useEffect(() => {
    eventTypes && formMethods.setValue("eventTypes", eventTypes);
  }, [eventTypes]);

  const updateMutation = trpc.viewer.eventTypes.update.useMutation({
    onSuccess: async (data) => {
      showToast(t("event_type_updated_successfully", { eventTypeTitle: data.eventType?.title }), "success");
    },
    async onSettled() {
      await utils.viewer.eventTypes.get.invalidate();
    },
    onError: (err) => {
      let message = "";
      if (err instanceof HttpError) {
        const message = `${err.statusCode}: ${err.message}`;
        showToast(message, "error");
      }

      if (err.data?.code === "UNAUTHORIZED") {
        message = `${err.data.code}: ${t("error_event_type_unauthorized_update")}`;
      }

      if (err.data?.code === "PARSE_ERROR" || err.data?.code === "BAD_REQUEST") {
        message = `${err.data.code}: ${t(err.message)}`;
      }

      if (err.data?.code === "INTERNAL_SERVER_ERROR") {
        message = t("unexpected_error_try_again");
      }

      showToast(message ? t(message) : t(err.message), "error");
    },
  });

  const handleSelectAccount = async (teamId?: number) => {
    mutation.mutate(
      {
        isOmniInstall: true,
        type: appMetadata.type,
        variant: appMetadata.variant,
        slug: appMetadata.slug,
        ...(teamId && { teamId }),
        // for oAuth apps
        ...(showEventTypesStep && {
          returnTo:
            WEBAPP_URL +
            getAppOnboardingUrl({
              slug: appMetadata.slug,
              teamId,
              step: AppOnboardingSteps.EVENT_TYPES_STEP,
            }),
        }),
      },
      {
        onSuccess: (data) => {
          if (data?.setupPending) return;
          if (showEventTypesStep) {
            // for non-oAuth apps
            router.push(
              getAppOnboardingUrl({
                slug: appMetadata.slug,
                step: AppOnboardingSteps.EVENT_TYPES_STEP,
                teamId,
              })
            );
          } else {
            router.push(`/apps/installed/${appMetadata.categories[0]}?hl=${appMetadata.slug}`);
          }
          showToast(t("app_successfully_installed"), "success");
        },
        onError: (error) => {
          if (error instanceof Error) showToast(error.message || t("app_could_not_be_installed"), "error");
        },
      }
    );
  };

  const handleSetUpLater = () => {
    router.push(`/apps/installed/${appMetadata.categories[0]}?hl=${appMetadata.slug}`);
  };

  return (
    <div
      key={pathname}
      className="dark:bg-brand dark:text-brand-contrast text-emphasis min-h-screen px-4"
      data-testid="onboarding">
      <Head>
        <title>
          {t("install")} {appMetadata?.name ?? ""}
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto py-6 sm:px-4 md:py-24">
        <div className="relative">
          <div className="sm:mx-auto sm:w-full sm:max-w-[600px]" ref={formPortalRef}>
            <Form
              form={formMethods}
              id="outer-event-type-form"
              handleSubmit={async (values) => {
                const mutationPromises = values?.eventTypes
                  .filter((eventType) => eventType.selected)
                  .map((value: TEventType) => {
                    // Prevent two payment apps to be enabled
                    // Ok to cast type here because this metadata will be updated as the event type metadata
                    if (
                      checkForMultiplePaymentApps(value.metadata as z.infer<typeof EventTypeMetaDataSchema>)
                    )
                      throw new Error(t("event_setup_multiple_payment_apps_error"));
                    if (value.metadata?.apps?.stripe?.paymentOption === "HOLD" && value.seatsPerTimeSlot) {
                      throw new Error(t("seats_and_no_show_fee_error"));
                    }
                    let updateObject: {
                      id: number;
                      metadata?: z.infer<typeof EventTypeMetaDataSchema>;
                      bookingFields?: z.infer<typeof eventTypeBookingFields>;
                      locations?: LocationObject[];
                    } = { id: value.id };
                    if (isConferencing) {
                      updateObject = {
                        ...updateObject,
                        locations: value.locations,
                        bookingFields: value.bookingFields ? value.bookingFields : undefined,
                      };
                    } else {
                      updateObject = {
                        ...updateObject,
                        metadata: value.metadata,
                      };
                    }

                    return updateMutation.mutateAsync(updateObject);
                  });
                try {
                  await Promise.all(mutationPromises);
                  router.push("/event-types");
                } catch (err) {
                  console.error(err);
                }
              }}>
              <StepHeader
                title={stepObj.getTitle(appMetadata.name)}
                subtitle={stepObj.getDescription(appMetadata.name)}>
                <Steps maxSteps={MAX_NUMBER_OF_STEPS} currentStep={stepObj.stepNumber} disableNavigation />
              </StepHeader>
              {currentStep === AppOnboardingSteps.ACCOUNTS_STEP && (
                <AccountsStepCard
                  teams={teams}
                  personalAccount={personalAccount}
                  onSelect={handleSelectAccount}
                  loading={isSelectingAccount}
                  isConferencing={isConferencing}
                />
              )}
              {currentStep === AppOnboardingSteps.EVENT_TYPES_STEP &&
                eventTypes &&
                Boolean(eventTypes?.length) && (
                  <EventTypesStepCard
                    setConfigureStep={setConfigureStep}
                    userName={userName}
                    handleSetUpLater={handleSetUpLater}
                  />
                )}
              {currentStep === AppOnboardingSteps.CONFIGURE_STEP && formPortalRef.current && (
                <ConfigureStepCard
                  slug={appMetadata.slug}
                  categories={appMetadata.categories}
                  credentialId={credentialId}
                  userName={userName}
                  loading={updateMutation.isPending}
                  formPortalRef={formPortalRef}
                  setConfigureStep={setConfigureStep}
                  eventTypes={eventTypes}
                  handleSetUpLater={handleSetUpLater}
                  isConferencing={isConferencing}
                />
              )}
            </Form>
          </div>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
};

// Redirect Error map to give context on edge cases, this is for the devs, never shown to users
const ERROR_MESSAGES = {
  appNotFound: "App not found",
  userNotAuthed: "User is not logged in",
  userNotFound: "User from session not found",
  appNotExtendsEventType: "App does not extend EventTypes",
  userNotInTeam: "User is not in provided team",
} as const;

const getUser = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      avatar: true,
      name: true,
      username: true,
      teams: {
        where: {
          accepted: true,
          team: {
            members: {
              some: {
                userId,
                role: {
                  in: ["ADMIN", "OWNER"],
                },
              },
            },
          },
        },
        select: {
          team: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error(ERROR_MESSAGES.userNotFound);
  }
  return user;
};

const getAppBySlug = async (appSlug: string) => {
  const app = await prisma.app.findUnique({
    where: { slug: appSlug, enabled: true },
    select: { slug: true, keys: true, enabled: true, dirName: true },
  });
  if (!app) throw new Error(ERROR_MESSAGES.appNotFound);
  return app;
};

const getEventTypes = async (userId: number, teamId?: number) => {
  const eventTypes = (
    await prisma.eventType.findMany({
      select: {
        id: true,
        description: true,
        durationLimits: true,
        metadata: true,
        length: true,
        title: true,
        position: true,
        recurringEvent: true,
        requiresConfirmation: true,
        team: { select: { slug: true } },
        schedulingType: true,
        teamId: true,
        users: { select: { username: true } },
        seatsPerTimeSlot: true,
        slug: true,
        locations: true,
        userId: true,
        destinationCalendar: true,
        bookingFields: true,
      },
      where: teamId ? { teamId } : { userId, teamId: null },
    })
  ).sort((eventTypeA, eventTypeB) => {
    return eventTypeB.position - eventTypeA.position;
  });

  if (eventTypes.length === 0) {
    return [];
  }

  return eventTypes.map((item) => ({
    ...item,
    URL: `${CAL_URL}/${item.team ? `team/${item.team.slug}` : item?.users?.[0]?.username}/${item.slug}`,
    selected: false,
    locations: item.locations as unknown as LocationObject[],
    bookingFields: eventTypeBookingFields.parse(item.bookingFields || []),
  }));
};

const getAppInstallsBySlug = async (appSlug: string, userId: number, teamIds?: number[]) => {
  const appInstalls = await prisma.credential.findMany({
    where: {
      OR: [
        {
          appId: appSlug,
          userId: userId,
        },
        teamIds && Boolean(teamIds.length)
          ? {
              appId: appSlug,
              teamId: { in: teamIds },
            }
          : {},
      ],
    },
  });
  return appInstalls;
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  try {
    let eventTypes: TEventType[] | null = null;
    const { req, res, query, params } = context;
    const stepsEnum = z.enum(STEPS);
    const parsedAppSlug = z.coerce.string().parse(query?.slug);
    const parsedStepParam = z.coerce.string().parse(params?.step);
    const parsedTeamIdParam = z.coerce.number().optional().parse(query?.teamId);
    const _ = stepsEnum.parse(parsedStepParam);
    const session = await getServerSession({ req, res });
    const locale = await getLocale(context.req);
    const app = await getAppBySlug(parsedAppSlug);
    const appMetadata = appStoreMetadata[app.dirName as keyof typeof appStoreMetadata];
    const exteandsEventType = appMetadata?.extendsFeature === "EventType";

    const isConferencing = isConferencingApp(appMetadata.categories);
    const showEventTypesStep = exteandsEventType || isConferencing;

    if (!session?.user?.id) throw new Error(ERROR_MESSAGES.userNotAuthed);

    const user = await getUser(session.user.id);

    const userAcceptedTeams = user.teams.map((team) => ({ ...team.team }));
    const hasTeams = Boolean(userAcceptedTeams.length);

    const appInstalls = await getAppInstallsBySlug(
      parsedAppSlug,
      user.id,
      userAcceptedTeams.map(({ id }) => id)
    );

    if (parsedTeamIdParam) {
      const isUserMemberOfTeam = userAcceptedTeams.some((team) => team.id === parsedTeamIdParam);
      if (!isUserMemberOfTeam) {
        throw new Error(ERROR_MESSAGES.userNotInTeam);
      }
    }

    if (parsedStepParam == AppOnboardingSteps.EVENT_TYPES_STEP) {
      if (!showEventTypesStep) {
        return {
          redirect: {
            permanent: false,
            destination: `/apps/installed/${appMetadata.categories[0]}?hl=${appMetadata.slug}`,
          },
        };
      }
      eventTypes = await getEventTypes(user.id, parsedTeamIdParam);
      if (isConferencing) {
        const t = await getTranslation(context.locale ?? "en", "common");
        const locationOptions = await getLocationGroupedOptions({ userId: user.id }, t);
        for (let index = 0; index < eventTypes.length; index++) {
          let eventType = eventTypes[index];
          let destinationCalendar = eventType.destinationCalendar;
          if (!destinationCalendar) {
            destinationCalendar = await prisma.destinationCalendar.findFirst({
              where: {
                userId: user.id,
                eventTypeId: null,
              },
            });

            eventType = { ...eventType, destinationCalendar };
          }
          if (eventType.schedulingType === SchedulingType.MANAGED) {
            eventType = {
              ...eventType,
              locationOptions: [
                {
                  label: t("default"),
                  options: [
                    {
                      label: t("members_default_location"),
                      value: "",
                      icon: "/user-check.svg",
                    },
                  ],
                },
                ...locationOptions,
              ],
            };
          } else {
            eventType = { ...eventType, locationOptions };
          }
          eventTypes[index] = eventType;
        }
      }

      if (eventTypes.length === 0) {
        return {
          redirect: {
            permanent: false,
            destination: `/apps/installed/${appMetadata.categories[0]}?hl=${appMetadata.slug}`,
          },
        };
      }
    }

    const personalAccount = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      alreadyInstalled: appInstalls.some((install) => !Boolean(install.teamId) && install.userId === user.id),
    };

    const teamsWithIsAppInstalled = hasTeams
      ? userAcceptedTeams.map((team) => ({
          ...team,
          alreadyInstalled: appInstalls.some(
            (install) => Boolean(install.teamId) && install.teamId === team.id
          ),
        }))
      : [];
    let credentialId = null;
    if (parsedTeamIdParam) {
      credentialId =
        appInstalls.find((item) => !!item.teamId && item.teamId == parsedTeamIdParam)?.id ?? null;
    } else {
      credentialId = appInstalls.find((item) => !!item.userId && item.userId == user.id)?.id ?? null;
    }
    return {
      props: {
        ...(await serverSideTranslations(locale, ["common"])),
        app,
        appMetadata,
        showEventTypesStep,
        step: parsedStepParam,
        teams: teamsWithIsAppInstalled,
        personalAccount,
        eventTypes,
        teamId: parsedTeamIdParam ?? null,
        userName: user.username,
        credentialId,
        isConferencing,
      } as OnboardingPageProps,
    };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { redirect: { permanent: false, destination: "/apps" } };
    }

    if (err instanceof Error) {
      switch (err.message) {
        case ERROR_MESSAGES.userNotAuthed:
          return { redirect: { permanent: false, destination: "/auth/login" } };
        case ERROR_MESSAGES.userNotFound:
          return { redirect: { permanent: false, destination: "/auth/login" } };
        default:
          return { redirect: { permanent: false, destination: "/apps" } };
      }
    }
  }
};

OnboardingPage.PageWrapper = PageWrapper;

export default OnboardingPage;

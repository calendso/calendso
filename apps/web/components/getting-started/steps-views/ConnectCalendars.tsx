import { ArrowRightIcon } from "@heroicons/react/solid";

import classNames from "@calcom/lib/classNames";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { trpc } from "@calcom/trpc/react";
import { List } from "@calcom/ui/List";
import { SkeletonContainer, SkeletonText } from "@calcom/ui/v2";

import { CalendarItem } from "../components/CalendarItem";
import { ConnectedCalendarItem } from "../components/ConnectedCalendarItem";
import { CreateEventsOnCalendarSelect } from "../components/CreateEventsOnCalendarSelect";

interface IConnectCalendarsProps {
  nextStep: () => void;
}

const ConnectedCalendars = (props: IConnectCalendarsProps) => {
  const { nextStep } = props;
  const queryConnectedCalendars = trpc.useQuery(["viewer.connectedCalendars"]);
  const { t } = useLocale();
  const queryIntegrations = trpc.useQuery([
    "viewer.integrations",
    { variant: "calendar", onlyInstalled: false },
  ]);

  const firstCalendar = queryConnectedCalendars.data?.connectedCalendars.find(
    (item) => item.calendars && item.calendars?.length > 0
  );
  const disabledNextButton = firstCalendar === undefined;
  const destinationCalendar = queryConnectedCalendars.data?.destinationCalendar;
  return (
    <>
      {/* Already connected calendars  */}
      {firstCalendar &&
        firstCalendar.integration &&
        firstCalendar.integration.title &&
        firstCalendar.integration.imageSrc && (
          <>
            <List className="rounded-md border border-gray-200 bg-white p-0 dark:bg-black">
              <ConnectedCalendarItem
                key={firstCalendar.integration.title}
                name={firstCalendar.integration.title}
                logo={firstCalendar.integration.imageSrc}
                externalId={
                  firstCalendar && firstCalendar.calendars && firstCalendar.calendars.length > 0
                    ? firstCalendar.calendars[0].externalId
                    : ""
                }
                calendars={firstCalendar.calendars}
                integrationType={firstCalendar.integration.type}
              />
            </List>
            {/* Create event on selected calendar */}
            <CreateEventsOnCalendarSelect calendar={destinationCalendar} />
            <p className="mt-7 text-sm text-gray-500">{t("connect_calendars_from_app_store")}</p>
          </>
        )}

      {/* Connect calendars list */}
      {firstCalendar === undefined && queryIntegrations.data && queryIntegrations.data.items.length > 0 && (
        <List className="rounded-md border border-gray-200 bg-white p-0 dark:bg-black">
          {queryIntegrations.data &&
            queryIntegrations.data.items.map((item, index) => (
              <>
                {item.title && item.imageSrc && (
                  <CalendarItem
                    type={item.type}
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    imageSrc={item.imageSrc}
                  />
                )}
                {index < queryIntegrations.data.items.length - 1 && (
                  <div className="h-[1px] w-full border-b border-gray-200" />
                )}
              </>
            ))}
        </List>
      )}

      {queryConnectedCalendars.isLoading && (
        <>
          <SkeletonContainer className="mb-1">
            <SkeletonText width="full" height="20" />
          </SkeletonContainer>
          <SkeletonContainer className="mb-1">
            <SkeletonText width="full" height="20" />
          </SkeletonContainer>
          <SkeletonContainer className="mb-1">
            <SkeletonText width="full" height="20" />
          </SkeletonContainer>
        </>
      )}
      <button
        type="button"
        data-testid="save-calendar-button"
        className={classNames(
          "mt-8 flex w-full flex-row justify-center rounded-md border border-black bg-black p-2 text-center text-sm text-white",
          disabledNextButton ? "cursor-not-allowed opacity-20" : ""
        )}
        onClick={() => nextStep()}
        disabled={disabledNextButton}>
        {firstCalendar ? `${t("continue")}` : `${t("next_step_text")}`}
        <ArrowRightIcon className="ml-2 h-4 w-4 self-center" aria-hidden="true" />
      </button>
    </>
  );
};

export { ConnectedCalendars };

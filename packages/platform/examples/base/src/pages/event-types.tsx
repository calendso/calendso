import { Navbar } from "@/components/Navbar";
import { Inter } from "next/font/google";
// eslint-disable-next-line @calcom/eslint/deprecated-imports-next-router
import { useRouter } from "next/router";
import { useState } from "react";

import {
  useEventTypes,
  useTeamEventTypes,
  useTeams,
  EventTypeSettings,
  CreateEventType,
} from "@calcom/atoms";

const inter = Inter({ subsets: ["latin"] });

export default function Bookings(props: { calUsername: string; calEmail: string }) {
  const [eventTypeId, setEventTypeId] = useState<number | null>(null);
  const [isTeamEvent, setIsTeamEvent] = useState<boolean>(false);
  const router = useRouter();
  const { isLoading: isLoadingEvents, data: eventTypes, refetch } = useEventTypes(props.calUsername);
  const { data: teams } = useTeams();
  const {
    isLoading: isLoadingTeamEvents,
    data: teamEventTypes,
    refetch: refetchTeamEvents,
  } = useTeamEventTypes(teams?.[0]?.id || 0);
  const rescheduleUid = (router.query.rescheduleUid as string) ?? "";

  return (
    <main
      className={`flex min-h-screen flex-col ${inter.className} main text-default flex min-h-full w-full flex-col items-center overflow-visible`}>
      <Navbar username={props.calUsername} />
      <div>
        <h1 className="mx-10 my-4 text-2xl font-semibold">
          EventTypes{eventTypeId ? `: ${eventTypeId}` : ""}
        </h1>

        {isLoadingEvents && !eventTypeId && <p>Loading...</p>}

        {!isLoadingEvents && !eventTypeId && Boolean(eventTypes?.length) && !rescheduleUid && (
          <div className="flex flex-col gap-4">
            {eventTypes?.map(
              (event: { id: number; slug: string; title: string; lengthInMinutes: number }) => {
                const formatEventSlug = event.slug
                  .split("-")
                  .map((item) => `${item[0].toLocaleUpperCase()}${item.slice(1)}`)
                  .join(" ");

                return (
                  <div
                    onClick={() => {
                      setEventTypeId(event.id);
                      setIsTeamEvent(false);
                    }}
                    className="mx-10 w-[80vw] cursor-pointer rounded-md border-[0.8px] border-black px-10 py-4"
                    key={event.id}>
                    <h1 className="text-lg font-semibold">{formatEventSlug}</h1>
                    <p>{`/${event.slug}`}</p>
                    <span className="border-none bg-gray-800 px-2 text-white">{event?.lengthInMinutes}</span>
                  </div>
                );
              }
            )}
          </div>
        )}

        {!isLoadingTeamEvents && !eventTypeId && Boolean(teamEventTypes?.length) && !rescheduleUid && (
          <div className="flex flex-col gap-4">
            <h1>Team event types</h1>
            {teamEventTypes?.map(
              (event: { id: number; slug: string; title: string; lengthInMinutes: number }) => {
                const formatEventSlug = event.slug
                  .split("-")
                  .map((item) => `${item[0].toLocaleUpperCase()}${item.slice(1)}`)
                  .join(" ");

                return (
                  <div
                    onClick={() => {
                      setEventTypeId(event.id);
                      setIsTeamEvent(true);
                    }}
                    className="mx-10 w-[80vw] cursor-pointer rounded-md border-[0.8px] border-black px-10 py-4"
                    key={event.id}>
                    <h1 className="text-lg font-semibold">{formatEventSlug}</h1>
                    <p>{`/${event.slug}`}</p>
                    <span className="border-none bg-gray-800 px-2 text-white">{event?.lengthInMinutes}</span>
                  </div>
                );
              }
            )}
          </div>
        )}
        {eventTypeId && (
          <div>
            <EventTypeSettings
              customClassNames={{
                atomsWrapper: "!w-[50vw] !m-auto",
                eventAdvancedTab: {
                  destinationCalendar: {
                    container: "bg-purple-50 border border-purple-200 shadow-md",
                    select: "border border-purple-300 shadow-sm",
                    innerClassNames: {
                      input: "",
                      option: "",
                      control: "",
                      singleValue: "",
                      valueContainer: "",
                      multiValue: "",
                      menu: "",
                      menuList: "",
                    },
                    label: "",
                  },
                  eventName: {
                    container: "bg-purple-50 border border-purple-200 shadow-sm",
                    input: "border border-purple-300 shadow-inner",
                    label: "",
                    addOn: "",
                  },
                  addToCalendarEmailOrganizer: {
                    switch: {
                      container: "bg-purple-50 border border-purple-200 shadow-inner",
                      thumb: "bg-purple-300 border border-purple-400 shadow-sm",
                    },
                    select: {
                      container: "",
                      select: "",
                      displayEmailLabel: "",
                    },
                  },
                  requiresConfirmation: {
                    toggle: {
                      switchContainer: "bg-purple-50 border border-purple-200 shadow-md",
                      label: "",
                      description: "",
                      children: "",
                    },
                    radioGroupContainer: "",
                    alwaysConfirmationRadio: "",
                    conditionalConfirmationRadio: {
                      container: "",
                      timeInput: "",
                      timeUnitSelect: "",
                      checkbox: "",
                      checkboxDescription: "",
                    },
                  },
                  bookerEmailVerification: {
                    switchContainer: "bg-purple-50 border border-purple-200 shadow-md",
                    label: "",
                    description: "",
                    children: "",
                  },
                  calendarNotes: {
                    switchContainer: "bg-purple-50 border border-purple-200 shadow-md",
                    label: "",
                    description: "",
                    children: "",
                  },
                  eventDetailsVisibility: {
                    switchContainer: "bg-purple-50 border border-purple-200 shadow-md",
                    label: "",
                    description: "",
                    children: "",
                  },
                  bookingRedirect: {
                    switchContainer: "bg-purple-50 border border-purple-200 shadow-md",
                    label: "",
                    description: "",
                    children: "",
                    textFieldClassNames: {
                      container: "bg-purple-50 border border-purple-200 shadow-sm",
                      label: "",
                      input: "",
                      addOn: "",
                    },
                    forwardParamsCheckboxClassNames: {
                      checkbox: "",
                      description: "",
                      container: "bg-purple-50 border border-purple-300 shadow-sm",
                    },
                    error: "bg-purple-50 text-purple-700 border border-purple-300",
                  },
                  seatsOptions: {
                    switchContainer: "bg-purple-50 border border-purple-200 shadow-md",
                    label: "",
                    description: "",
                    children: "",
                    textInputClassNames: {
                      container: "bg-purple-50 border border-purple-200 shadow-sm",
                      label: "",
                      input: "",
                      addOn: "",
                    },
                    showAttendeesCheckboxClassNames: {
                      checkbox: "",
                      description: "",
                      container: "",
                    },
                    showAvalableSeatCountCheckboxClassNames: {
                      checkbox: "",
                      description: "",
                      container: "",
                    },
                  },
                  timezoneLockToggle: {
                    switchContainer: "bg-purple-50 border border-purple-200 shadow-md",
                    label: "",
                    description: "",
                    children: "",
                  },
                  eventTypeColors: {
                    switchContainer: "bg-purple-50 border border-purple-200 shadow-md",
                    label: "",
                    description: "",
                    children: "",
                    warningText: "",
                  },
                  roundRobinReschedule: {
                    switchContainer: "bg-purple-50 border border-purple-200 shadow-md",
                    label: "",
                    description: "",
                    children: "",
                  },
                  emailNotifications: {
                    settingsToggle: {
                      switchContainer: "bg-purple-50 border border-purple-200 shadow-md",
                      label: "",
                      description: "",
                      children: "",
                    },
                    confirmationDialog: {
                      container: "bg-purple-50 border border-purple-300 shadow-lg",
                      dialogTitle: "",
                      description: "",
                      confirmInput: {
                        container: "",
                        label: "",
                        input: "",
                        addOn: "",
                      },
                      dialogFooter: {
                        container: "bg-purple-50",
                        confirmButton: "",
                        cancelButton: "",
                      },
                    },
                  },
                },
              }}
              allowDelete={true}
              id={eventTypeId}
              tabs={["setup", "limits", "recurring", "advanced", "availability", "team", "payments"]}
              onSuccess={(eventType) => {
                setEventTypeId(null);
                refetch();
              }}
              onError={(eventType, error) => {
                console.log(eventType);
                console.error(error);
              }}
              onDeleteSuccess={() => {
                refetch();
                refetchTeamEvents();
                setEventTypeId(null);
              }}
              onDeleteError={console.error}
            />
          </div>
        )}

        {!eventTypeId && (
          <div className="mt-8 flex flex-row items-center justify-center gap-24">
            <div className="flex w-[30vw] flex-col gap-2">
              <h1 className="font-semibold">Create Event Type</h1>
              <CreateEventType
                customClassNames={{
                  atomsWrapper: "border p-4 shadow-md rounded-md",
                  buttons: { container: "justify-center", submit: "bg-red-500", cancel: "bg-gray-300" },
                }}
                onSuccess={() => {
                  refetch();
                }}
              />
            </div>

            <div className="flex w-[30vw] flex-col gap-2">
              <h1 className="font-semibold">Create Team Event Type</h1>
              {teams?.[0]?.id && (
                <CreateEventType
                  customClassNames={{
                    atomsWrapper: "border shadow-md p-4 rounded-md ",
                    buttons: {
                      container: "justify-center flex-row-reverse",
                      submit: "bg-green-500",
                      cancel: "bg-stone-300",
                    },
                  }}
                  teamId={teams?.[0]?.id}
                  onCancel={() => {
                    console.log("cancel team event type creation");
                  }}
                  onSuccess={() => {
                    refetchTeamEvents();
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

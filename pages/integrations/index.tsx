import Head from "next/head";
import Link from "next/link";
import prisma from "../../lib/prisma";
import Shell from "../../components/Shell";
import { useEffect, useState, useRef } from "react";
import { getSession, useSession } from "next-auth/client";
import { CheckCircleIcon, ChevronRightIcon, PlusIcon, XCircleIcon } from "@heroicons/react/solid";
import { InformationCircleIcon } from "@heroicons/react/outline";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTrigger } from "@components/Dialog";
import Switch from "@components/ui/Switch";
import Loader from "@components/Loader";
import AddCalDavIntegration from "@lib/integrations/components/AddCalDavIntegration";
import request from "@lib/request";

type Integration = {
  installed: boolean;
  credential: unknown;
  type: string;
  title: string;
  imageSrc: string;
  description: string;
};

type Props = {
  integrations: Integration[];
};

export default function Home({ integrations }: Props) {
  const [, loading] = useSession();

  const [selectableCalendars, setSelectableCalendars] = useState([]);
  const [showAddCalDavIntegrationModal, setShowAddCalDavIntegrationModal] = useState(false);
  const addCalDavIntegrationRef = useRef<HTMLFormElement>(null);

  function handleAddCalDavIntegrationSaveButtonPress() {
    const form = addCalDavIntegrationRef.current.elements;
    const url = form.url.value;
    const password = form.password.value;
    const username = form.username.value;
    try {
      handleAddCalDavIntegration({ username, password, url });
      setShowAddCalDavIntegrationModal(false);
    } catch (reason) {
      console.error(reason);
    }
  }

  function handleAddCalDavIntegrationCloseButtonPress() {
    setShowAddCalDavIntegrationModal(false);
  }

  function loadCalendars() {
    fetch("api/availability/calendar")
      .then((response) => response.json())
      .then((data) => {
        setSelectableCalendars(data);
      });
  }

  function integrationHandler(type) {
    if (type === "caldav_calendar") {
      console.log("CalDav");
      setShowAddCalDavIntegrationModal(true);
      return;
    }

    fetch("/api/integrations/" + type.replace("_", "") + "/add")
      .then((response) => response.json())
      .then((data) => (window.location.href = data.url));
  }

  const handleAddCalDavIntegration = async ({ url, username, password }) => {
    await request.post("/api/integrations/caldav/add", {
      url,
      username,
      password,
    });
  };

  function calendarSelectionHandler(calendar) {
    return (selected) => {
      const i = selectableCalendars.findIndex((c) => c.externalId === calendar.externalId);
      selectableCalendars[i].selected = selected;
      if (selected) {
        fetch("api/availability/calendar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectableCalendars[i]),
        }).then((response) => response.json());
      } else {
        fetch("api/availability/calendar", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(selectableCalendars[i]),
        }).then((response) => response.json());
      }
    };
  }

  function getCalendarIntegrationImage(integrationType: string) {
    switch (integrationType) {
      case "google_calendar":
        return "integrations/google-calendar.svg";
      case "office365_calendar":
        return "integrations/outlook.svg";
      case "caldav_calendar":
        return "integrations/generic-calendar.png";
      default:
        return "";
    }
  }

  function onCloseSelectCalendar() {
    setSelectableCalendars([...selectableCalendars]);
  }

  useEffect(loadCalendars, [integrations]);

  if (loading) {
    return <Loader />;
  }

  const ConnectNewAppDialog = () => (
    <Dialog>
      <DialogTrigger className="py-2 px-4 mt-6 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900">
        <PlusIcon className="w-5 h-5 mr-1 inline" />
        Connect a new App
      </DialogTrigger>

      <DialogContent>
        <DialogHeader title="Connect a new App" subtitle="Connect a new app to your account." />
        <div className="my-4">
          <ul className="divide-y divide-gray-200">
            {integrations
              .filter((integration) => integration.installed)
              .map((integration) => (
                <li key={integration.type} className="flex py-4">
                  <div className="w-1/12 mr-4 pt-2">
                    <img className="h-8 w-8 mr-2" src={integration.imageSrc} alt={integration.title} />
                  </div>
                  <div className="w-10/12">
                    <h2 className="text-gray-800 font-medium">{integration.title}</h2>
                    <p className="text-gray-400 text-sm">{integration.description}</p>
                  </div>
                  <div className="w-2/12 text-right pt-2">
                    <button
                      onClick={() => integrationHandler(integration.type)}
                      className="font-medium text-neutral-900 hover:text-neutral-500">
                      Add
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <DialogClose as="button" className="btn btn-white mx-2">
            Cancel
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );

  const SelectCalendarDialog = () => (
    <Dialog onOpenChange={(open) => !open && onCloseSelectCalendar()}>
      <DialogTrigger className="py-2 px-4 mt-6 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900">
        Select calendars
      </DialogTrigger>

      <DialogContent>
        <DialogHeader
          title="Select calendars"
          subtitle="If no entry is selected, all calendars will be checked"
        />
        <div className="my-4">
          <ul className="divide-y divide-gray-200">
            {selectableCalendars.map((calendar) => (
              <li key={calendar.name} className="flex py-4">
                <div className="w-1/12 mr-4 pt-2">
                  <img
                    className="h-8 w-8 mr-2"
                    src={getCalendarIntegrationImage(calendar.integration)}
                    alt={calendar.integration}
                  />
                </div>
                <div className="w-10/12 pt-3">
                  <h2 className="text-gray-800 font-medium">{calendar.name}</h2>
                </div>
                <div className="w-2/12 text-right pt-3">
                  <Switch
                    defaultChecked={calendar.selected}
                    onCheckedChange={calendarSelectionHandler(calendar)}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <DialogClose as="button" className="btn btn-white mx-2">
            Cancel
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div>
      <Head>
        <title>App Store | Calendso</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Shell heading="App Store" subtitle="Connect your favourite apps." CTA={<ConnectNewAppDialog />}>
        <div className="bg-white border border-gray-200 overflow-hidden rounded-sm mb-8">
          {integrations.filter((ig) => ig.credential).length !== 0 ? (
            <ul className="divide-y divide-gray-200">
              {integrations
                .filter((ig) => ig.credential)
                .map((ig) => (
                  <li key={ig.credential.id}>
                    <Link href={"/integrations/" + ig.credential.id}>
                      <a className="block hover:bg-gray-50">
                        <div className="flex items-center px-4 py-4 sm:px-6">
                          <div className="min-w-0 flex-1 flex items-center">
                            <div className="flex-shrink-0">
                              <img className="h-10 w-10 mr-2" src={ig.imageSrc} alt={ig.title} />
                            </div>
                            <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                              <div>
                                <p className="text-sm font-medium text-neutral-900 truncate">{ig.title}</p>
                                <p className="flex items-center text-sm text-gray-500">
                                  {ig.type.endsWith("_calendar") && (
                                    <span className="truncate">Calendar Integration</span>
                                  )}
                                  {ig.type.endsWith("_video") && (
                                    <span className="truncate">Video Conferencing</span>
                                  )}
                                </p>
                              </div>
                              <div className="hidden md:block">
                                {ig.credential.key && (
                                  <p className="mt-2 flex items-center text text-gray-500">
                                    <CheckCircleIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" />
                                    Connected
                                  </p>
                                )}
                                {!ig.credential.key && (
                                  <p className="mt-3 flex items-center text text-gray-500">
                                    <XCircleIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-yellow-400" />
                                    Not connected
                                  </p>
                                )}
                              </div>
                            </div>
                            <div>
                              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="bg-white shadow rounded-sm">
              <div className="flex">
                <div className="py-9 pl-8">
                  <InformationCircleIcon className="text-neutral-900 w-16" />
                </div>
                <div className="py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    You don&apos;t have any apps connected.
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      You currently do not have any apps connected. Connect your first app to get started.
                    </p>
                  </div>
                  <ConnectNewAppDialog />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white border border-gray-200 rounded-sm mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Select calendars</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Select which calendars are checked for availability to prevent double bookings.</p>
            </div>
            <SelectCalendarDialog />
          </div>
        </div>
        <div className="border border-gray-200 rounded-sm">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Launch your own App</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>If you want to add your own App here, get in touch with us.</p>
            </div>
            <div className="mt-5">
              <a href="mailto:apps@calendso.com" className="btn btn-white">
                Contact us
              </a>
            </div>
          </div>
        </div>
        {showAddCalDavIntegrationModal && (
          <div
            className="fixed z-50 inset-0 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-sm px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-neutral-100 sm:mx-0 sm:h-10 sm:w-10">
                    <PlusIcon className="h-6 w-6 text-neutral-900" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Connect to CalDav Server
                    </h3>
                    <div>
                      <p className="text-sm text-gray-400">Your credentials will be stored and encrypted.</p>
                    </div>
                  </div>
                </div>
                <div className="my-4">
                  <AddCalDavIntegration
                    ref={addCalDavIntegrationRef}
                    onSubmit={handleAddCalDavIntegrationSaveButtonPress}
                  />
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:space-x-2 sm:space-x-reverse sm:flex-row-reverse">
                  <button
                    type="submit"
                    form={"addCalDav"}
                    className="flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900">
                    Save
                  </button>
                  <button
                    onClick={handleAddCalDavIntegrationCloseButtonPress}
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-sm border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 sm:mt-0 sm:w-auto sm:text-sm">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Shell>
    </div>
  );
}

const validJson = (jsonString: string) => {
  try {
    const o = JSON.parse(jsonString);
    if (o && typeof o === "object") {
      return o;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { permanent: false, destination: "/auth/login" } };
  }
  const user = await prisma.user.findFirst({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  const credentials = await prisma.credential.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      type: true,
      key: true,
    },
  });

  const integrations = [
    {
      installed: !!(process.env.GOOGLE_API_CREDENTIALS && validJson(process.env.GOOGLE_API_CREDENTIALS)),
      credential: credentials.find((integration) => integration.type === "google_calendar") || null,
      type: "google_calendar",
      title: "Google Calendar",
      imageSrc: "integrations/google-calendar.svg",
      description: "For personal and business calendars",
    },
    {
      installed: !!(process.env.MS_GRAPH_CLIENT_ID && process.env.MS_GRAPH_CLIENT_SECRET),
      type: "office365_calendar",
      credential: credentials.find((integration) => integration.type === "office365_calendar") || null,
      title: "Office 365 / Outlook.com Calendar",
      imageSrc: "integrations/outlook.svg",
      description: "For personal and business calendars",
    },
    {
      installed: !!(process.env.ZOOM_CLIENT_ID && process.env.ZOOM_CLIENT_SECRET),
      type: "zoom_video",
      credential: credentials.find((integration) => integration.type === "zoom_video") || null,
      title: "Zoom",
      imageSrc: "integrations/zoom.svg",
      description: "Video Conferencing",
    },
    {
      installed: true,
      type: "caldav_calendar",
      credential: credentials.find((integration) => integration.type === "caldav_calendar") || null,
      title: "CalDav Server",
      imageSrc: "integrations/generic-calendar.png",
      description: "For personal and business calendars",
    },
  ];

  return {
    props: { integrations },
  };
}

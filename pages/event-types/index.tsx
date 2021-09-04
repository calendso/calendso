import { Dialog, DialogClose, DialogContent } from "@components/Dialog";
import Loader from "@components/Loader";
import { Tooltip } from "@components/Tooltip";
import { Button } from "@components/ui/Button";
import { Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  DotsHorizontalIcon,
  ExternalLinkIcon,
  LinkIcon,
  PlusIcon,
  UsersIcon,
} from "@heroicons/react/solid";
import classNames from "@lib/classNames";
import { getSession, useSession } from "next-auth/client";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useRef } from "react";
import Shell from "../../components/Shell";
import prisma from "../../lib/prisma";
import { User, EventType, SchedulingType } from "@prisma/client";
import showToast from "@lib/notification";
import Avatar from "@components/Avatar";
import { UserCalendarImage } from "@components/svg/UserCalendarImage";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import EventTypeDescription from "@components/eventtype/EventTypeDescription";
import * as RadioArea from "@components/ui/form/radio-area";

export default function Availability({ eventTypes, profiles }: { eventTypes: EventType[]; profiles: [] }) {
  const [loading] = useSession();

  if (loading) {
    return <Loader />;
  }

  const CreateFirstEventTypeView = () => (
    <div className="md:py-20">
      <UserCalendarImage />
      <div className="text-center block md:max-w-screen-sm mx-auto">
        <h3 className="mt-2 text-xl font-bold text-neutral-900">Create your first event type</h3>
        <p className="mt-1 text-md text-neutral-600 mb-2">
          Event types enable you to share links that show available times on your calendar and allow people to
          make bookings with you.
        </p>
        <CreateNewEventDialog profiles={profiles} />
      </div>
    </div>
  );

  const EventTypeListHeading = ({ profile, membershipCount }) => (
    <div className="flex mb-3">
      <Avatar
        displayName={profile.name}
        imageSrc={profile.image}
        className="w-8 mt-1 h-8 rounded-full inline mr-2"
      />
      <div>
        <span className="font-bold">{profile.name}</span>
        {membershipCount && (
          <span className="text-neutral-500 ml-2">
            <UsersIcon className="w-4 h-4 inline" /> {membershipCount}
          </span>
        )}
        <Link href={profile.slug}>
          <a className="block text-neutral-500 leading-none">{`calendso.com/${profile.slug}`}</a>
        </Link>
      </div>
    </div>
  );

  const EventTypeList = ({
    readOnly,
    types,
    profile,
  }: {
    profile;
    readOnly: boolean;
    types: EventType[];
  }) => (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden -mx-4 sm:mx-0 mb-4">
      <ul className="divide-y divide-neutral-200">
        {types.map((type: EventType) => (
          <li key={type.id}>
            <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-neutral-50">
              <Link href={"/event-types/" + type.id}>
                <a className="truncate flex-grow text-sm">
                  <div>
                    <span className="font-medium text-neutral-900 truncate">{type.title}</span>
                    {type.hidden && (
                      <span className="ml-2 inline items-center px-1.5 py-0.5 rounded-sm text-xs font-medium bg-yellow-100 text-yellow-800">
                        Hidden
                      </span>
                    )}
                    {readOnly && (
                      <span className="ml-2 inline items-center px-1.5 py-0.5 rounded-sm text-xs font-medium bg-gray-100 text-gray-800">
                        Readonly
                      </span>
                    )}
                  </div>
                  <EventTypeDescription eventType={type} />
                </a>
              </Link>

              <div className="hidden sm:flex mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                <div className="flex items-center overflow-hidden space-x-5">
                  {type.organizers.length > 1 && (
                    <ul className="inline-flex">
                      {type.organizers.map((organizer, idx: number) => (
                        <li key={idx} className={"h-6 w-6 " + (idx ? "-ml-1" : "")}>
                          <Avatar displayName={organizer.name} imageSrc={organizer.avatar} />
                        </li>
                      ))}
                    </ul>
                  )}
                  <Tooltip content="Preview">
                    <a
                      href={`/${profile.slug}/${type.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="group cursor-pointer text-neutral-400 p-2 border border-transparent hover:border-gray-200">
                      <ExternalLinkIcon className="group-hover:text-black w-5 h-5" />
                    </a>
                  </Tooltip>

                  <Tooltip content="Copy link">
                    <button
                      onClick={() => {
                        showToast("Link copied!", "success");
                        navigator.clipboard.writeText(
                          window.location.hostname + "/" + profile.slug + "/" + type.slug
                        );
                      }}
                      className="group text-neutral-400 p-2 border border-transparent hover:border-gray-200">
                      <LinkIcon className="group-hover:text-black w-5 h-5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
              <div className="flex sm:hidden ml-5 flex-shrink-0">
                <Menu as="div" className="inline-block text-left">
                  {({ open }) => (
                    <>
                      <div>
                        <Menu.Button className="text-neutral-400 mt-1 p-2 border border-transparent hover:border-gray-200">
                          <span className="sr-only">Open options</span>
                          <DotsHorizontalIcon className="h-5 w-5" aria-hidden="true" />
                        </Menu.Button>
                      </div>

                      <Transition
                        show={open}
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95">
                        <Menu.Items
                          static
                          className="origin-top-right absolute right-0 mt-2 w-56 rounded-sm shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-neutral-100">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  href={`/${slug}/${type.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={classNames(
                                    active ? "bg-neutral-100 text-neutral-900" : "text-neutral-700",
                                    "group flex items-center px-4 py-2 text-sm font-medium"
                                  )}>
                                  <ExternalLinkIcon
                                    className="mr-3 h-4 w-4 text-neutral-400 group-hover:text-neutral-500"
                                    aria-hidden="true"
                                  />
                                  Preview
                                </a>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    showToast("Link copied!", "success");
                                    navigator.clipboard.writeText(
                                      window.location.hostname + `/${slug}/${type.slug}`
                                    );
                                  }}
                                  className={classNames(
                                    active ? "bg-neutral-100 text-neutral-900" : "text-neutral-700",
                                    "group flex items-center px-4 py-2 text-sm w-full font-medium"
                                  )}>
                                  <LinkIcon
                                    className="mr-3 h-4 w-4 text-neutral-400 group-hover:text-neutral-500"
                                    aria-hidden="true"
                                  />
                                  Copy link to event
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </>
                  )}
                </Menu>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div>
      <Head>
        <title>Event Types | Calendso</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Shell
        heading="Event Types"
        subtitle="Create events to share for people to book on your calendar."
        CTA={eventTypes.length !== 0 && <CreateNewEventDialog profiles={profiles} />}>
        {eventTypes &&
          eventTypes.map((input) => (
            <>
              <EventTypeListHeading
                profile={input.profile}
                membershipCount={input.metadata?.membershipCount}
              />
              <EventTypeList
                types={input.eventTypes}
                profile={input.profile}
                readOnly={input.metadata?.readOnly}
              />
            </>
          ))}

        {eventTypes.length === 0 && teams && <CreateFirstEventTypeView />}
      </Shell>
    </div>
  );
}

const CreateNewEventDialog = ({ profiles }) => {
  const router = useRouter();
  const dialogOpen = router.query.new === "1";
  const teamId: number | null = Number(router.query.teamId) || null;
  const titleRef = useRef<HTMLInputElement>();
  const slugRef = useRef<HTMLInputElement>();

  function autoPopulateSlug() {
    let t = titleRef.current.value;
    t = t.replace(/\s+/g, "-").toLowerCase();
    slugRef.current.value = t;
  }

  async function createEventTypeHandler(event) {
    event.preventDefault();

    const formData = Object.fromEntries(new FormData(event.target).entries());
    const payload: {
      title: string;
      url: string;
      description: string;
      length: number;
      schedulingType?: "collective" | "roundRobin";
      teamId?: number;
    } = {
      ...formData,
      length: Number(formData.length),
      ...(router.query.teamId
        ? {
            teamId: Number(router.query.teamId),
          }
        : {}),
    };

    await fetch("/api/availability/eventtype", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });

    await router.push({ pathname: router.pathname });

    showToast("Event Type created", "success");
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(isOpen) => {
        const newQuery = {
          ...router.query,
        };
        delete newQuery["new"];
        delete newQuery["eventPage"];
        delete newQuery["teamId"];
        if (!isOpen) {
          router.push({ pathname: router.pathname, query: newQuery });
        }
      }}>
      {!profiles.filter((profile) => profile.teamId).length && (
        <Button href={{ query: { ...router.query, new: "1" } }} StartIcon={PlusIcon}>
          New event type
        </Button>
      )}
      {profiles.filter((profile) => profile.teamId).length > 0 && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger as="span">
            <Button EndIcon={ChevronDownIcon}>New event type</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" className="shadow-sm rounded-sm bg-white text-sm mt-1">
            <DropdownMenu.Label className="text-neutral-500 px-3 py-2">
              Create an event type under
              <br />
              your name or a team.
            </DropdownMenu.Label>
            <DropdownMenu.Separator className="h-px bg-gray-200" />
            {profiles.map((profile) => (
              <DropdownMenu.Item
                key={profile.slug}
                className="px-3 py-2 cursor-pointer"
                onSelect={() =>
                  router.push({
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      new: "1",
                      eventPage: profile.slug,
                      ...(profile.teamId
                        ? {
                            teamId: profile.teamId,
                          }
                        : {}),
                    },
                  })
                }>
                {profile.name}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )}
      <DialogContent>
        <div className="mb-8">
          <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
            Add a new {teamId ? "team " : ""}event type
          </h3>
          <div>
            <p className="text-sm text-gray-500">Create a new event type for people to book times with.</p>
          </div>
        </div>
        <form onSubmit={createEventTypeHandler}>
          <div>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <div className="mt-1">
                <input
                  onChange={autoPopulateSlug}
                  ref={titleRef}
                  type="text"
                  name="title"
                  id="title"
                  required
                  className="shadow-sm focus:ring-neutral-900 focus:border-neutral-900 block w-full sm:text-sm border-gray-300 rounded-sm"
                  placeholder="Quick Chat"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                URL
              </label>
              <div className="mt-1">
                <div className="flex rounded-sm shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    {location.hostname}/{teamId ? router.query.eventPage : profiles[0].slug}/
                  </span>
                  <input
                    ref={slugRef}
                    type="text"
                    name="slug"
                    id="slug"
                    required
                    className="flex-1 block w-full focus:ring-neutral-900 focus:border-neutral-900 min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                  />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                <textarea
                  name="description"
                  id="description"
                  className="shadow-sm focus:ring-neutral-900 focus:border-neutral-900 block w-full sm:text-sm border-gray-300 rounded-sm"
                  placeholder="A quick video meeting."
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="length" className="block text-sm font-medium text-gray-700">
                Length
              </label>
              <div className="mt-1 relative rounded-sm shadow-sm">
                <input
                  type="number"
                  name="length"
                  id="length"
                  required
                  className="focus:ring-neutral-900 focus:border-neutral-900 block w-full pr-20 sm:text-sm border-gray-300 rounded-sm"
                  placeholder="15"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 text-sm">
                  minutes
                </div>
              </div>
            </div>
          </div>
          {teamId && (
            <div className="mb-4">
              <label htmlFor="schedulingType" className="block text-sm font-medium text-gray-700">
                Scheduling Type
              </label>
              <RadioArea.Group
                name="schedulingType"
                className="flex space-x-6 mt-1 relative rounded-sm shadow-sm">
                <RadioArea.Item value={SchedulingType.COLLECTIVE} className="text-sm w-1/2">
                  <strong className="block mb-1">Collective</strong>
                  <p>Schedule meetings when all selected team members are available.</p>
                </RadioArea.Item>
                <RadioArea.Item value={SchedulingType.ROUND_ROBIN} className="text-sm w-1/2">
                  <strong className="block mb-1">Round Robin</strong>
                  <p>Cycle meetings between multiple team members.</p>
                </RadioArea.Item>
              </RadioArea.Group>
            </div>
          )}
          <div className="mt-8 sm:flex sm:flex-row-reverse">
            <DialogClose as="span" className="ml-2">
              <Button type="submit">Continue</Button>
            </DialogClose>
            <DialogClose as={Button} color="secondary">
              Cancel
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { permanent: false, destination: "/auth/login" } };
  }

  const user: User = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      username: true,
      name: true,
      startTime: true,
      endTime: true,
      bufferTime: true,
      avatar: true,
      teams: {
        select: {
          role: true,
          team: {
            select: {
              id: true,
              name: true,
              slug: true,
              members: {
                select: {
                  userId: true,
                },
              },
              eventTypes: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  length: true,
                  schedulingType: true,
                  slug: true,
                  hidden: true,
                  organizers: {
                    select: {
                      id: true,
                      avatar: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      eventTypes: {
        where: {
          team: null,
        },
        select: {
          id: true,
          title: true,
          description: true,
          length: true,
          schedulingType: true,
          slug: true,
          hidden: true,
          organizers: {
            select: {
              id: true,
              avatar: true,
              name: true,
            },
          },
        },
      },
    },
  });

  let eventTypes = [];

  if (user.eventTypes) {
    eventTypes.push({
      teamId: null,
      profile: {
        slug: user.username,
        name: user.name,
        image: user.avatar,
      },
      eventTypes: user.eventTypes,
    });
  }

  eventTypes = [].concat(
    eventTypes,
    user.teams.map((membership) => ({
      teamId: membership.team.id,
      profile: {
        name: membership.team.name,
        logo: membership.team.logo || "",
        slug: "team/" + membership.team.slug,
      },
      metadata: {
        membershipCount: membership.team.members.length,
        readOnly: membership.role !== "OWNER",
      },
      eventTypes: membership.team.eventTypes,
    }))
  );

  return {
    props: {
      user,
      // don't display event teams without event types,
      eventTypes: eventTypes.filter((groupBy) => groupBy.eventTypes.length > 0),
      // so we can show a dropdown when the user has teams
      profiles: eventTypes.map((group) => ({
        teamId: group.teamId,
        ...group.profile,
        ...group.metadata,
      })),
    },
  };
}

import type { Prisma, Credential } from "@prisma/client";
import { v4 as uuid } from "uuid";

import { DailyLocationType } from "@calcom/app-store/locations";
import slugify from "@calcom/lib/slugify";
import { PeriodType, SchedulingType } from "@calcom/prisma/enums";
import type { userSelect } from "@calcom/prisma/selects";
import type { CustomInputSchema } from "@calcom/prisma/zod-utils";
import { EventTypeMetaDataSchema } from "@calcom/prisma/zod-utils";

type User = Prisma.UserGetPayload<typeof userSelect>;

type UsernameSlugLinkProps = {
  users: {
    id?: number;
    username: string | null;
    email?: string;
    name?: string | null;
    bio?: string | null;
    avatar?: string | null;
    theme?: string | null;
    away?: boolean;
    verified?: boolean | null;
    allowDynamicBooking?: boolean | null;
  }[];
  slug: string;
};

const user: User & { credentials: Credential[] } = {
  metadata: null,
  theme: null,
  credentials: [],
  username: "john.doe",
  timeZone: "",
  bufferTime: 0,
  availability: [],
  id: 0,
  startTime: 0,
  endTime: 0,
  selectedCalendars: [],
  schedules: [],
  defaultScheduleId: null,
  locale: "en",
  email: "john.doe@example.com",
  name: "John doe",
  destinationCalendar: null,
  hideBranding: true,
  brandColor: "#797979",
  darkBrandColor: "#efefef",
  allowDynamicBooking: true,
  timeFormat: 12,
  organizationId: null,
};

const customInputs: CustomInputSchema[] = [];

const commons = {
  isDynamic: true,
  periodCountCalendarDays: true,
  periodStartDate: null,
  periodEndDate: null,
  beforeEventBuffer: 0,
  afterEventBuffer: 0,
  periodType: PeriodType.UNLIMITED,
  periodDays: null,
  slotInterval: null,
  offsetStart: 0,
  locations: [{ type: DailyLocationType }],
  customInputs,
  disableGuests: true,
  minimumBookingNotice: 120,
  schedule: null,
  timeZone: null,
  successRedirectUrl: "",
  teamId: null,
  scheduleId: null,
  availability: [],
  currency: "usd",
  schedulingType: SchedulingType.COLLECTIVE,
  seatsPerTimeSlot: null,
  seatsShowAttendees: null,
  seatsShowAvailabilityCount: null,
  id: 0,
  hideCalendarNotes: false,
  recurringEvent: null,
  destinationCalendar: null,
  team: null,
  requiresConfirmation: false,
  requiresBookerEmailVerification: false,
  bookingLimits: null,
  durationLimits: null,
  hidden: false,
  userId: 0,
  parentId: null,
  owner: null,
  workflows: [],
  users: [user],
  hosts: [],
  metadata: EventTypeMetaDataSchema.parse({}),
  bookingFields: [],
};

const dynamicEvent = {
  length: 30,
  slug: "dynamic",
  title: "Dynamic",
  uid: uuid(),
  price: 0,
  amount: 0,
  eventName: "Dynamic Event",
  description: "",
  descriptionAsSafeHTML: "",
  position: 0,
  ...commons,
};

const defaultEvents = [dynamicEvent];

export const getDynamicEventDescription = (dynamicUsernames: string[], slug: string): string => {
  return `Book a ${slug} min event with ${dynamicUsernames.join(", ")}`;
};

export const getDynamicEventName = (dynamicNames: string[], slug: string): string => {
  const lastUser = dynamicNames.pop();
  return `Dynamic Collective ${slug} min event with ${dynamicNames.join(", ")} & ${lastUser}`;
};

export const getDefaultEvent = (slug: string) => {
  const event = defaultEvents.find((obj) => {
    return obj.slug === slug;
  });
  return event || dynamicEvent;
};

export const getGroupName = (usernameList: string[]): string => {
  return usernameList.join(", ");
};

export const getUsernameSlugLink = ({ users, slug }: UsernameSlugLinkProps): string => {
  let slugLink = ``;
  if (users.length > 1) {
    const combinedUsername = users.map((user) => user.username).join("+");
    slugLink = `/${combinedUsername}/${slug}`;
  } else {
    slugLink = `/${users[0].username}/${slug}`;
  }
  return slugLink;
};

const arrayCast = (value: unknown | unknown[]) => {
  return Array.isArray(value) ? value : value ? [value] : [];
};

export const getUsernameList = (users: string | string[] | undefined): string[] => {
  // Multiple users can come in case of a team round-robin booking and in that case dynamic link won't be a user.
  // So, even though this code handles even if individual user is dynamic link, that isn't a possibility right now.
  users = arrayCast(users);

  const allUsers = users.map((user) => user.replace(/( |%20|%2b)/g, "+").split("+")).flat();
  return Array.prototype.concat(...allUsers.map((userSlug) => slugify(userSlug)));
};

export default defaultEvents;

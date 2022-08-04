import type { EventTypeCustomInput } from "@prisma/client";
import { PeriodType, Prisma, SchedulingType, UserPlan } from "@prisma/client";

import { baseUserSelect } from "@calcom/prisma/selects";

const userSelectData = Prisma.validator<Prisma.UserArgs>()({ select: baseUserSelect });
type User = Prisma.UserGetPayload<typeof userSelectData>;

type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>;

export type DefaultEventType = {
  currency: string;
  description: string | null;
  hidden: boolean;
  id: number;
  length: number;
  locations: string[];
  metadata: JSONValue;
  price: number;
  recurringEvent: JSONValue;
  requiresConfirmation: boolean;
  schedulingType: SchedulingType | null;
  seatsPerTimeSlot: number | null;
  slug: string;
  title: string;
  position: number;
  userId: number | null;
  teamId: number | null;
  eventName: string | null;
  users: User[];
  timeZone: string;
  periodType: PeriodType;
  periodStartDate: Date | null;
  periodEndDate: Date | null;
  periodDays: number | null;
  periodCountCalendarDays: boolean | null;
  disableGuests: boolean;
  hideCalendarNotes: boolean;
  minimumBookingNotice: number;
  beforeEventBuffer: number;
  afterEventBuffer: number;
  scheduleId: number | null;
  slotInterval: number | null;
  successRedirectUrl: string | null;
};

type UsernameSlugLinkProps = {
  users: {
    id?: number;
    username: string | null;
    email?: string;
    name?: string | null;
    bio?: string | null;
    avatar?: string | null;
    theme?: string | null;
    plan?: UserPlan;
    away?: boolean;
    verified?: boolean | null;
    allowDynamicBooking?: boolean | null;
  }[];
  slug: string;
};

const customInputs: EventTypeCustomInput[] = [];

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
  locations: [{ type: "integrations:daily" }],
  customInputs,
  disableGuests: true,
  minimumBookingNotice: 120,
  schedule: null,
  timeZone: null,
  successRedirectUrl: "",
  availability: [],
  price: 0,
  currency: "usd",
  schedulingType: SchedulingType.COLLECTIVE,
  seatsPerTimeSlot: null,
  id: 0,
  metadata: {
    smartContractAddress: "",
  },
  isWeb3Active: false,
  hideCalendarNotes: false,
  recurringEvent: null,
  destinationCalendar: null,
  team: null,
  requiresConfirmation: false,
  hidden: false,
  userId: 0,
  workflows: [],
  users: [
    {
      id: 0,
      plan: UserPlan.PRO,
      email: "jdoe@example.com",
      name: "John Doe",
      username: "jdoe",
      avatar: "",
      hideBranding: true,
      timeZone: "",
      destinationCalendar: null,
      credentials: [],
      bufferTime: 0,
      locale: "en",
      theme: null,
      brandColor: "#292929",
      darkBrandColor: "#fafafa",
      availability: [],
      selectedCalendars: [],
      startTime: 0,
      endTime: 0,
      schedules: [],
      defaultScheduleId: null,
    } as User,
  ],
};

const min15Event = {
  length: 15,
  slug: "15",
  title: "15min",
  eventName: "Dynamic Collective 15min Event",
  description: "Dynamic Collective 15min Event",
  ...commons,
};
const min30Event = {
  length: 30,
  slug: "30",
  title: "30min",
  eventName: "Dynamic Collective 30min Event",
  description: "Dynamic Collective 30min Event",
  ...commons,
};
const min60Event = {
  length: 60,
  slug: "60",
  title: "60min",
  eventName: "Dynamic Collective 60min Event",
  description: "Dynamic Collective 60min Event",
  ...commons,
};

const defaultEvents = [min15Event, min30Event, min60Event];

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
  return event || min15Event;
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

  const allUsers = users.map((user) =>
    user
      .toLowerCase()
      .replace(/( |%20)/g, "+")
      .split("+")
  );

  return Array.prototype.concat(...allUsers);
};

export default defaultEvents;

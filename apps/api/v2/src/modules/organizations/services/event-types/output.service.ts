import { OutputEventTypesService_2024_06_14 } from "@/ee/event-types/event-types_2024_06_14/services/output-event-types.service";
import { Injectable } from "@nestjs/common";
import type { EventType, User, Schedule, Host } from "@prisma/client";

import { HostPriority } from "@calcom/platform-types";

type EventTypeRelations = { users: User[]; schedule: Schedule | null; hosts: Host[] };
type DatabaseEventType = EventType & EventTypeRelations;

type Input = Pick<
  DatabaseEventType,
  | "id"
  | "length"
  | "title"
  | "description"
  | "disableGuests"
  | "slotInterval"
  | "minimumBookingNotice"
  | "beforeEventBuffer"
  | "afterEventBuffer"
  | "slug"
  | "schedulingType"
  | "requiresConfirmation"
  | "price"
  | "currency"
  | "lockTimeZoneToggleOnBookingPage"
  | "seatsPerTimeSlot"
  | "forwardParamsSuccessRedirect"
  | "successRedirectUrl"
  | "seatsShowAvailabilityCount"
  | "isInstantEvent"
  | "locations"
  | "bookingFields"
  | "recurringEvent"
  | "metadata"
  | "users"
  | "schedule"
  | "hosts"
  | "teamId"
>;

@Injectable()
export class OutputOrganizationsEventTypesService {
  constructor(private readonly outputEventTypesService: OutputEventTypesService_2024_06_14) {}

  async getResponseTeamEventType(teamId: number, databaseEventType: Input) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ownerId, users, ...rest } = await this.outputEventTypesService.getResponseEventType(
      0,
      databaseEventType
    );
    const hosts = this.transformHosts(databaseEventType.hosts);

    return {
      ...rest,
      hosts,
      teamId,
    };
  }

  transformHosts(hosts: Host[]) {
    if (!hosts) return [];

    return hosts.map((host) => {
      return {
        userId: host.userId,
        mandatory: host.isFixed,
        priority: getPriorityLabel(host.priority || 2),
      };
    });
  }
}

function getPriorityLabel(priority: number): keyof typeof HostPriority {
  switch (priority) {
    case 0:
      return "lowest";
    case 1:
      return "low";
    case 2:
      return "medium";
    case 3:
      return "high";
    case 4:
      return "highest";
    default:
      throw new Error("Invalid HostPriority value");
  }
}

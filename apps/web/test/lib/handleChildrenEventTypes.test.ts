import type { EventType } from "@prisma/client";

import updateChildrenEventTypes from "@calcom/lib/handleChildrenEventTypes";
import { buildEventType } from "@calcom/lib/test/builder";
import type { CompleteEventType } from "@calcom/prisma/zod";

import { prismaMock } from "../../../../tests/config/singleton";

const mockFindFirstEventType = (data?: Partial<CompleteEventType>) => {
  const eventType = buildEventType(data as Partial<EventType>);
  prismaMock.eventType.findFirst.mockResolvedValue(eventType as EventType);
  return eventType;
};

jest.mock("@calcom/emails/email-manager", () => {
  return {
    sendSlugReplacementEmail: () => ({}),
  };
});

describe("handleChildrenEventTypes", () => {
  describe("Shortcircuits", () => {
    it("Throws 'No managed event type'", async () => {
      mockFindFirstEventType();
      const result = await updateChildrenEventTypes({
        eventTypeId: 1,
        oldEventType: { children: [], team: { name: "" } },
        children: [],
        updatedEventType: { schedulingType: null, slug: "something" },
        currentUserId: 1,
        hashedLink: undefined,
        connectedLink: null,
        prisma: prismaMock,
      });
      expect(result.newUserIds).toEqual(undefined);
      expect(result.oldUserIds).toEqual(undefined);
      expect(result.deletedUserIds).toEqual(undefined);
      // expect(result.deletedExistentEventTypes)
      expect(result.message).toBe("No managed event type");
    });

    it("Throws 'No managed event metadata'", async () => {
      mockFindFirstEventType();
      const result = await updateChildrenEventTypes({
        eventTypeId: 1,
        oldEventType: { children: [], team: { name: "" } },
        children: [],
        updatedEventType: { schedulingType: "MANAGED", slug: "something" },
        currentUserId: 1,
        hashedLink: undefined,
        connectedLink: null,
        prisma: prismaMock,
      });
      expect(result.newUserIds).toEqual(undefined);
      expect(result.oldUserIds).toEqual(undefined);
      expect(result.deletedUserIds).toEqual(undefined);
      // expect(result.deletedExistentEventTypes)
      expect(result.message).toBe("No managed event metadata");
    });

    it("Throws 'Missing event type'", async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      prismaMock.eventType.findFirst.mockImplementation(() => {
        return new Promise((resolve) => {
          resolve(null);
        });
      });
      const result = await updateChildrenEventTypes({
        eventTypeId: 1,
        oldEventType: { children: [], team: { name: "" } },
        children: [],
        updatedEventType: { schedulingType: "MANAGED", slug: "something" },
        currentUserId: 1,
        hashedLink: undefined,
        connectedLink: null,
        prisma: prismaMock,
      });
      expect(result.newUserIds).toEqual(undefined);
      expect(result.oldUserIds).toEqual(undefined);
      expect(result.deletedUserIds).toEqual(undefined);
      // expect(result.deletedExistentEventTypes)
      expect(result.message).toBe("Missing event type");
    });
  });

  describe("Happy paths", () => {
    it("Adds new users", async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { schedulingType, id, teamId, timeZone, users, ...evType } = mockFindFirstEventType({
        id: 123,
        metadata: { managedEventConfig: {} },
        locations: [],
      });
      const result = await updateChildrenEventTypes({
        eventTypeId: 1,
        oldEventType: { children: [], team: { name: "" } },
        children: [{ hidden: false, owner: { id: 4, name: "", email: "", eventTypeSlugs: [] } }],
        updatedEventType: { schedulingType: "MANAGED", slug: "something" },
        currentUserId: 1,
        hashedLink: undefined,
        connectedLink: null,
        prisma: prismaMock,
      });
      expect(prismaMock.eventType.create).toHaveBeenCalledWith({
        data: {
          ...evType,
          parentId: 1,
          users: { connect: [{ id: 4 }] },
          bookingLimits: undefined,
          durationLimits: undefined,
          recurringEvent: undefined,
          webhooks: undefined,
          workflows: undefined,
          userId: 4,
        },
      });
      expect(result.newUserIds).toEqual([4]);
      expect(result.oldUserIds).toEqual([]);
      expect(result.deletedUserIds).toEqual([]);
      // expect(result.deletedExistentEventTypes)
    });

    it("Updates old users", async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const { schedulingType, id, teamId, timeZone, users, locations, parentId, userId, ...evType } =
        mockFindFirstEventType({
          metadata: { managedEventConfig: {} },
          locations: [],
        });
      const result = await updateChildrenEventTypes({
        eventTypeId: 1,
        oldEventType: { children: [{ userId: 4 }], team: { name: "" } },
        children: [{ hidden: false, owner: { id: 4, name: "", email: "", eventTypeSlugs: [] } }],
        updatedEventType: { schedulingType: "MANAGED", slug: "something" },
        currentUserId: 1,
        hashedLink: undefined,
        connectedLink: null,
        prisma: prismaMock,
      });
      expect(prismaMock.eventType.update).toHaveBeenCalledWith({
        data: {
          ...evType,
          bookingLimits: undefined,
          durationLimits: undefined,
          recurringEvent: undefined,
          scheduleId: undefined,
        },
        where: {
          userId_parentId: {
            userId: 4,
            parentId: 1,
          },
        },
      });
      expect(result.newUserIds).toEqual([]);
      expect(result.oldUserIds).toEqual([4]);
      expect(result.deletedUserIds).toEqual([]);
      // expect(result.deletedExistentEventTypes)
    });

    it("Deletes old users", async () => {
      mockFindFirstEventType({ users: [], metadata: { managedEventConfig: {} }, locations: [] });
      const result = await updateChildrenEventTypes({
        eventTypeId: 1,
        oldEventType: { children: [{ userId: 4 }], team: { name: "" } },
        children: [],
        updatedEventType: { schedulingType: "MANAGED", slug: "something" },
        currentUserId: 1,
        hashedLink: undefined,
        connectedLink: null,
        prisma: prismaMock,
      });
      expect(result.newUserIds).toEqual([]);
      expect(result.oldUserIds).toEqual([]);
      expect(result.deletedUserIds).toEqual([4]);
      // expect(result.deletedExistentEventTypes)
    });

    it("Adds new users and updates/delete old users", async () => {
      mockFindFirstEventType({
        metadata: { managedEventConfig: {} },
        locations: [],
      });
      const result = await updateChildrenEventTypes({
        eventTypeId: 1,
        oldEventType: { children: [{ userId: 4 }, { userId: 1 }], team: { name: "" } },
        children: [
          { hidden: false, owner: { id: 4, name: "", email: "", eventTypeSlugs: [] } },
          { hidden: false, owner: { id: 5, name: "", email: "", eventTypeSlugs: [] } },
        ],
        updatedEventType: { schedulingType: "MANAGED", slug: "something" },
        currentUserId: 1,
        hashedLink: undefined,
        connectedLink: null,
        prisma: prismaMock,
      });
      // Have been called
      expect(result.newUserIds).toEqual([5]);
      expect(result.oldUserIds).toEqual([4]);
      expect(result.deletedUserIds).toEqual([1]);
      // expect(result.deletedExistentEventTypes)
    });
  });

  /*describe("Slug conflicts", () => {
    it("Deletes existent event types for new users added", () => {});
    it("Deletes existent event types for old users updated", () => {});
  });*/
});

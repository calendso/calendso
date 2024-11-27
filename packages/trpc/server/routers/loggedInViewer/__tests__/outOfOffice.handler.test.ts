import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { vi } from "vitest";

import { prisma } from "@calcom/prisma";

import { outOfOfficeCreateOrUpdate } from "../outOfOffice.handler";

const prismaMock = {
  outOfOfficeEntry: {
    findFirst: vi.fn().mockResolvedValue(undefined),
  },
};
vi.spyOn(prisma.outOfOfficeEntry, "findFirst").mockImplementation(prismaMock.outOfOfficeEntry.findFirst);

afterEach(() => {
  prismaMock.outOfOfficeEntry.findFirst.mockClear();
});

const mockUser = {
  id: 4,
  username: "pro",
  email: "pro@example.com",
  password: {
    hash: "",
    userId: 0,
  },
  completedOnboarding: true,
  identityProvider: "CAL",
  profiles: [],
  avatar: "",
  organization: null,
  organizationId: null,
  locale: "en",
  timeZone: "UTC",
  defaultScheduleId: null,
  email_verified: true,
  name: null,
  theme: null,
} as const;

describe("outOfOfficeCreateOrUpdate", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.setSystemTime(new Date("2024-11-22T03:23:45Z"));
  });

  it("should throw error if start date is after end date", async () => {
    const input = {
      dateRange: {
        startDate: new Date("2024-11-23T23:00:00.000Z"),
        endDate: new Date("2024-11-22T23:00:00.000Z"),
      },
      offset: 60,
      reasonId: 1,
      notes: "",
      toTeamUserId: null,
    };

    await expect(outOfOfficeCreateOrUpdate({ ctx: { user: mockUser }, input })).rejects.toThrow(
      "start_date_must_be_before_end_date"
    );
  });

  it("should throw error if start date is before today", async () => {
    // today: "2024-11-22T03:23:45Z"
    const input = {
      dateRange: {
        startDate: new Date("2024-11-21T23:00:00.000Z"), // same as today, "2024-11-22T00:00:00+01:00"
        endDate: new Date("2024-11-23T23:00:00.000Z"),
      },
      offset: 60,
      reasonId: 1,
      notes: "",
      toTeamUserId: null,
    };

    await expect(outOfOfficeCreateOrUpdate({ ctx: { user: mockUser }, input })).resolves.not.toThrow();

    input.dateRange.startDate = new Date("2024-11-20T23:00:00.000Z"); // a day before today, "2024-11-21T00:00:00+01:00"

    await expect(outOfOfficeCreateOrUpdate({ ctx: { user: mockUser }, input })).rejects.toThrow(
      "start_date_must_be_in_the_future"
    );
  });

  it("should handle timezone offset correctly", async () => {
    const input = {
      dateRange: {
        startDate: new Date("2024-11-23T23:00:00.000Z"),
        endDate: new Date("2024-11-23T23:00:00.000Z"),
      },
      offset: 60, // Paris timezone offset in minutes
      reasonId: 1,
      notes: "",
      toTeamUserId: null,
    };
    const startTimeUtc = "2024-11-24T00:00:00.000Z";
    const endTimeUtc = "2024-11-24T23:59:59.999Z";

    await outOfOfficeCreateOrUpdate({
      ctx: { user: mockUser },
      input,
    });

    expect(prisma.outOfOfficeEntry.findFirst).toHaveBeenNthCalledWith(1, {
      select: {
        toUserId: true,
        userId: true,
      },
      where: {
        OR: [
          {
            AND: [
              {
                start: {
                  lte: endTimeUtc,
                },
              },
              {
                end: {
                  gte: startTimeUtc,
                },
              },
            ],
          },
          {
            AND: [
              {
                start: {
                  gte: startTimeUtc,
                },
              },
              {
                end: {
                  lte: endTimeUtc,
                },
              },
            ],
          },
        ],
        toUserId: 4,
      },
    });
  });
});

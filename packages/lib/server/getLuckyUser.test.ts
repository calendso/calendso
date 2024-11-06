import prismaMock from "../../../tests/libs/__mocks__/prismaMock";

import { expect, it, describe } from "vitest";

import { buildUser, buildBooking } from "@calcom/lib/test/builder";

import { DistributionMethod, getLuckyUser } from "./getLuckyUser";

type NonEmptyArray<T> = [T, ...T[]];

it("can find lucky user with maximize availability", async () => {
  const user1 = buildUser({
    id: 1,
    username: "test1",
    name: "Test User 1",
    email: "test1@example.com",
    bookings: [
      {
        createdAt: new Date("2022-01-25T05:30:00.000Z"),
      },
      {
        createdAt: new Date("2022-01-25T06:30:00.000Z"),
      },
    ],
  });
  const user2 = buildUser({
    id: 2,
    username: "test2",
    name: "Test User 2",
    email: "test2@example.com",
    bookings: [
      {
        createdAt: new Date("2022-01-25T04:30:00.000Z"),
      },
    ],
  });
  const users: NonEmptyArray<ReturnType<typeof buildUser>> = [user1, user2];
  // TODO: we may be able to use native prisma generics somehow?
  prismaMock.user.findMany.mockResolvedValue(users);
  prismaMock.host.findMany.mockResolvedValue([]);
  prismaMock.booking.findMany.mockResolvedValue([]);

  await expect(
    getLuckyUser(DistributionMethod.PRIORITIZE_AVAILABILITY, {
      availableUsers: users,
      eventType: {
        id: 1,
        isRRWeightsEnabled: false,
      },
      allRRHosts: [],
    })
  ).resolves.toStrictEqual(users[1]);
});

it("can find lucky user with maximize availability and priority ranking", async () => {
  const user1 = buildUser({
    id: 1,
    username: "test1",
    name: "Test User 1",
    email: "test1@example.com",
    priority: 2,
    bookings: [
      {
        createdAt: new Date("2022-01-25T05:30:00.000Z"),
      },
      {
        createdAt: new Date("2022-01-25T06:30:00.000Z"),
      },
    ],
  });
  const user2 = buildUser({
    id: 2,
    username: "test2",
    name: "Test User 2",
    email: "test2@example.com",
    bookings: [
      {
        createdAt: new Date("2022-01-25T04:30:00.000Z"),
      },
    ],
  });

  const users: NonEmptyArray<ReturnType<typeof buildUser>> = [user1, user2];
  // TODO: we may be able to use native prisma generics somehow?
  prismaMock.user.findMany.mockResolvedValue(users);
  prismaMock.host.findMany.mockResolvedValue([]);
  prismaMock.booking.findMany.mockResolvedValue([]);

  // both users have medium priority (one user has no priority set, default to medium) so pick least recently booked
  await expect(
    getLuckyUser(DistributionMethod.PRIORITIZE_AVAILABILITY, {
      availableUsers: users,
      eventType: {
        id: 1,
        isRRWeightsEnabled: false,
      },
      allRRHosts: [],
    })
  ).resolves.toStrictEqual(users[1]);

  const userLowest = buildUser({
    id: 1,
    username: "test1",
    name: "Test User 1",
    email: "test1@example.com",
    priority: 0,
    bookings: [
      {
        createdAt: new Date("2022-01-25T03:30:00.000Z"),
      },
    ],
  });
  const userMedium = buildUser({
    id: 2,
    username: "test2",
    name: "Test User 2",
    email: "test2@example.com",
    priority: 2,
    bookings: [
      {
        createdAt: new Date("2022-01-25T04:30:00.000Z"),
      },
    ],
  });

  const userHighest = buildUser({
    id: 2,
    username: "test2",
    name: "Test User 2",
    email: "test2@example.com",
    priority: 4,
    bookings: [
      {
        createdAt: new Date("2022-01-25T05:30:00.000Z"),
      },
    ],
  });

  const usersWithPriorities: NonEmptyArray<ReturnType<typeof buildUser>> = [
    userLowest,
    userMedium,
    userHighest,
  ];
  // TODO: we may be able to use native prisma generics somehow?
  prismaMock.user.findMany.mockResolvedValue(usersWithPriorities);
  prismaMock.booking.findMany.mockResolvedValue([]);
  prismaMock.host.findMany.mockResolvedValue([]);
  // pick the user with the highest priority
  await expect(
    getLuckyUser(DistributionMethod.PRIORITIZE_AVAILABILITY, {
      availableUsers: usersWithPriorities,
      eventType: {
        id: 1,
        isRRWeightsEnabled: false,
      },
      allRRHosts: [],
    })
  ).resolves.toStrictEqual(usersWithPriorities[2]);

  const userLow = buildUser({
    id: 1,
    username: "test1",
    name: "Test User 1",
    email: "test1@example.com",
    priority: 0,
    bookings: [
      {
        createdAt: new Date("2022-01-25T02:30:00.000Z"),
      },
    ],
  });
  const userHighLeastRecentBooking = buildUser({
    id: 2,
    username: "test2",
    name: "Test User 2",
    email: "tes2t@example.com",
    priority: 3,
    bookings: [
      {
        createdAt: new Date("2022-01-25T03:30:00.000Z"),
      },
    ],
  });

  const userHighRecentBooking = buildUser({
    id: 3,
    username: "test3",
    name: "Test User 3",
    email: "test3@example.com",
    priority: 3,
    bookings: [
      {
        createdAt: new Date("2022-01-25T04:30:00.000Z"),
      },
    ],
  });

  const usersWithSamePriorities: NonEmptyArray<ReturnType<typeof buildUser>> = [
    userLow,
    userHighLeastRecentBooking,
    userHighRecentBooking,
  ];
  // TODO: we may be able to use native prisma generics somehow?
  prismaMock.user.findMany.mockResolvedValue(usersWithSamePriorities);
  prismaMock.booking.findMany.mockResolvedValue([]);
  prismaMock.host.findMany.mockResolvedValue([]);

  // pick the least recently booked user of the two with the highest priority
  await expect(
    getLuckyUser(DistributionMethod.PRIORITIZE_AVAILABILITY, {
      availableUsers: usersWithSamePriorities,
      eventType: {
        id: 1,
        isRRWeightsEnabled: false,
      },
      allRRHosts: [],
    })
  ).resolves.toStrictEqual(usersWithSamePriorities[1]);
});

describe("maximize availability and weights", () => {
  it("can find lucky user if hosts have same weights", async () => {
    const user1 = buildUser({
      id: 1,
      username: "test1",
      name: "Test User 1",
      email: "test1@example.com",
      priority: 3,
      weight: 100,
      bookings: [
        {
          createdAt: new Date("2022-01-25T06:30:00.000Z"),
        },
        {
          createdAt: new Date("2022-01-25T03:30:00.000Z"),
        },
      ],
    });
    const user2 = buildUser({
      id: 2,
      username: "test2",
      name: "Test User 2",
      email: "test2@example.com",
      priority: 3,
      weight: 100,
      bookings: [
        {
          createdAt: new Date("2022-01-25T05:30:00.000Z"),
        },
        {
          createdAt: new Date("2022-01-25T04:30:00.000Z"),
        },
      ],
    });

    prismaMock.user.findMany.mockResolvedValue([user1, user2]);
    prismaMock.host.findMany.mockResolvedValue([]);
    prismaMock.booking.findMany.mockResolvedValue([
      buildBooking({
        id: 1,
        userId: 1,
        createdAt: new Date("2022-01-25T06:30:00.000Z"),
      }),
      buildBooking({
        id: 2,
        userId: 1,
        createdAt: new Date("2022-01-25T03:30:00.000Z"),
      }),
      buildBooking({
        id: 3,
        userId: 2,
        createdAt: new Date("2022-01-25T05:30:00.000Z"),
      }),
      buildBooking({
        id: 4,
        userId: 2,
        createdAt: new Date("2022-01-25T04:30:00.000Z"),
      }),
    ]);

    const allRRHosts = [
      {
        user: { id: user1.id, email: user1.email },
        weight: user1.weight,
        createdAt: new Date(0),
      },
      {
        user: { id: user2.id, email: user2.email },
        weight: user2.weight,
        createdAt: new Date(0),
      },
    ];

    await expect(
      getLuckyUser(DistributionMethod.PRIORITIZE_AVAILABILITY, {
        availableUsers: [user1, user2],
        eventType: {
          id: 1,
          isRRWeightsEnabled: true,
        },
        allRRHosts,
      })
    ).resolves.toStrictEqual(user2);
  });

  it("can find lucky user if hosts have different weights", async () => {
    const user1 = buildUser({
      id: 1,
      username: "test1",
      name: "Test User 1",
      email: "test1@example.com",
      priority: 3,
      weight: 200,
      bookings: [
        {
          createdAt: new Date("2022-01-25T08:30:00.000Z"),
        },
        {
          createdAt: new Date("2022-01-25T07:30:00.000Z"),
        },
        {
          createdAt: new Date("2022-01-25T05:30:00.000Z"),
        },
      ],
    });
    const user2 = buildUser({
      id: 2,
      username: "test2",
      name: "Test User 2",
      email: "test2@example.com",
      priority: 3,
      weight: 100,
      bookings: [
        {
          createdAt: new Date("2022-01-25T06:30:00.000Z"),
        },
        {
          createdAt: new Date("2022-01-25T03:30:00.000Z"),
        },
      ],
    });

    prismaMock.user.findMany.mockResolvedValue([user1, user2]);
    prismaMock.host.findMany.mockResolvedValue([]);
    prismaMock.booking.findMany.mockResolvedValue([
      buildBooking({
        id: 1,
        userId: 1,
        createdAt: new Date("2022-01-25T08:30:00.000Z"),
      }),
      buildBooking({
        id: 2,
        userId: 1,
        createdAt: new Date("2022-01-25T07:30:00.000Z"),
      }),
      buildBooking({
        id: 3,
        userId: 1,
        createdAt: new Date("2022-01-25T05:30:00.000Z"),
      }),
      buildBooking({
        id: 4,
        userId: 2,
        createdAt: new Date("2022-01-25T06:30:00.000Z"),
      }),
      buildBooking({
        id: 4,
        userId: 2,
        createdAt: new Date("2022-01-25T03:30:00.000Z"),
      }),
    ]);

    const allRRHosts = [
      {
        user: { id: user1.id, email: user1.email },
        weight: user1.weight,
        createdAt: new Date(0),
      },
      {
        user: { id: user2.id, email: user2.email },
        weight: user2.weight,
        createdAt: new Date(0),
      },
    ];

    await expect(
      getLuckyUser(DistributionMethod.PRIORITIZE_AVAILABILITY, {
        availableUsers: [user1, user2],
        eventType: {
          id: 1,
          isRRWeightsEnabled: true,
        },
        allRRHosts,
      })
    ).resolves.toStrictEqual(user1);
  });

  it("can find lucky user with weights and adjusted weights", async () => {
    const user1 = buildUser({
      id: 1,
      username: "test1",
      name: "Test User 1",
      email: "test1@example.com",
      priority: 3,
      weight: 150,
      bookings: [
        {
          createdAt: new Date("2022-01-25T07:30:00.000Z"),
        },
        {
          createdAt: new Date("2022-01-25T05:30:00.000Z"),
        },
        {
          createdAt: new Date("2022-01-25T03:30:00.000Z"),
        },
      ],
    });
    const user2 = buildUser({
      id: 2,
      username: "test2",
      name: "Test User 2",
      email: "test2@example.com",
      priority: 3,
      weight: 100,
      bookings: [
        {
          createdAt: new Date("2022-01-25T06:30:00.000Z"),
        },
        {
          createdAt: new Date("2022-01-25T03:30:00.000Z"),
        },
      ],
    });

    prismaMock.user.findMany.mockResolvedValue([user1, user2]);
    prismaMock.host.findMany.mockResolvedValue([]);
    prismaMock.booking.findMany.mockResolvedValue([
      buildBooking({
        id: 1,
        userId: 1,
        createdAt: new Date("2022-01-25T05:30:00.000Z"),
      }),
      buildBooking({
        id: 2,
        userId: 1,
        createdAt: new Date("2022-01-25T03:30:00.000Z"),
      }),
      buildBooking({
        id: 3,
        userId: 1,
        createdAt: new Date("2022-01-25T07:30:00.000Z"),
      }),
      buildBooking({
        id: 4,
        userId: 2,
        createdAt: new Date("2022-01-25T06:30:00.000Z"),
      }),
      buildBooking({
        id: 4,
        userId: 2,
        createdAt: new Date("2022-01-25T03:30:00.000Z"),
      }),
    ]);

    const allRRHosts = [
      {
        user: { id: user1.id, email: user1.email },
        weight: user1.weight,
        createdAt: new Date(0),
      },
      {
        user: { id: user2.id, email: user2.email },
        weight: user2.weight,
        createdAt: new Date(0),
      },
    ];

    await expect(
      getLuckyUser(DistributionMethod.PRIORITIZE_AVAILABILITY, {
        availableUsers: [user1, user2],
        eventType: {
          id: 1,
          isRRWeightsEnabled: true,
        },
        allRRHosts,
      })
    ).resolves.toStrictEqual(user1);
  });
});

function convertHostsToUsers(
  hosts: {
    userId: number;
    isFixed: boolean;
    priority: number;
    weight: number;
    newHost?: boolean;
  }[]
) {
  return hosts.map((host) => {
    return {
      id: host.userId,
      email: `test${host.userId}@example.com`,
      hosts: host.newHost
        ? []
        : [
            {
              isFixed: host.isFixed,
              priority: host.priority,
              weight: host.weight,
            },
          ],
    };
  });
}

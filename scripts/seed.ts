import { hashPassword } from "../lib/auth";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function createUserAndEventType(opts: {
  user: Omit<Prisma.UserCreateArgs["data"], "password" | "email"> & { password: string; email: string };
  eventTypes: Array<Prisma.EventTypeCreateArgs["data"]>;
}) {
  const userData: Prisma.UserCreateArgs["data"] = {
    ...opts.user,
    password: await hashPassword(opts.user.password),
    emailVerified: new Date(),
  };
  const user = await prisma.user.upsert({
    where: { email: opts.user.email },
    update: userData,
    create: userData,
  });
  for (const rawData of opts.eventTypes) {
    const eventTypeData: Prisma.EventTypeCreateArgs["data"] = { ...rawData };
    eventTypeData.userId = user.id;
    await prisma.eventType.upsert({
      where: {
        userId_slug: {
          slug: eventTypeData.slug,
          userId: user.id,
        },
      },
      update: eventTypeData,
      create: eventTypeData,
    });
  }
  console.log(
    `👤 Created user '${opts.user.username}' with email "${opts.user.email}" & password "${opts.user.password}". Booking page 👉 http://localhost:3000/${opts.user.username}`
  );
}

async function main() {
  await createUserAndEventType({
    user: {
      email: "free@example.com",
      password: "free",
      username: "free",
      plan: "FREE",
    },
    eventTypes: [
      {
        title: "30min",
        slug: "30min",
        length: 30,
      },
    ],
  });
  await createUserAndEventType({
    user: {
      email: "pro@example.com",
      password: "pro",
      username: "pro",
      plan: "PRO",
    },

    eventTypes: [
      {
        title: "30min",
        slug: "30min",
        length: 30,
      },
      {
        title: "60min",
        slug: "60min",
        length: 60,
      },
    ],
  });
  await createUserAndEventType({
    user: {
      email: "trial@example.com",
      password: "trial",
      username: "trial",
      plan: "TRIAL",
    },
    eventTypes: [
      {
        title: "30min",
        slug: "30min",
        length: 30,
      },
      {
        title: "60min",
        slug: "60min",
        length: 60,
      },
    ],
  });

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log("🌱 Seeded db");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

import { BookingStatus, Prisma } from "@prisma/client";
import _ from "lodash";
import { getErrorFromUnknown } from "pages/_error";
import { z } from "zod";

import { checkPremiumUsername } from "@ee/lib/core/checkPremiumUsername";

import { checkRegularUsername } from "@lib/core/checkRegularUsername";
import { ALL_INTEGRATIONS } from "@lib/integrations/getIntegrations";
import slugify from "@lib/slugify";

import { TRPCError } from "@trpc/server";

import { getCalendarAdapterOrNull } from "../../lib/calendarClient";
import { createProtectedRouter, createRouter } from "../createRouter";
import { resizeBase64Image } from "../lib/resizeBase64Image";

const checkUsername =
  process.env.NEXT_PUBLIC_APP_URL === "https://cal.com" ? checkPremiumUsername : checkRegularUsername;

// things that unauthenticated users can query about themselves
const publicViewerRouter = createRouter()
  .query("session", {
    resolve({ ctx }) {
      return ctx.session;
    },
  })
  .query("i18n", {
    async resolve({ ctx }) {
      const { locale, i18n } = ctx;
      return {
        i18n,
        locale,
      };
    },
  });

// routes only available to authenticated users
const loggedInViewerRouter = createProtectedRouter()
  .query("me", {
    resolve({ ctx }) {
      const {
        // pick only the part we want to expose in the API
        id,
        name,
        username,
        email,
        startTime,
        endTime,
        bufferTime,
        locale,
        avatar,
        createdDate,
        completedOnboarding,
        twoFactorEnabled,
      } = ctx.user;
      const me = {
        id,
        name,
        username,
        email,
        startTime,
        endTime,
        bufferTime,
        locale,
        avatar,
        createdDate,
        completedOnboarding,
        twoFactorEnabled,
      };
      return me;
    },
  })
  .query("eventTypes", {
    async resolve({ ctx }) {
      const { prisma } = ctx;
      const eventTypeSelect = Prisma.validator<Prisma.EventTypeSelect>()({
        id: true,
        title: true,
        description: true,
        length: true,
        schedulingType: true,
        slug: true,
        hidden: true,
        price: true,
        currency: true,
        users: {
          select: {
            id: true,
            avatar: true,
            name: true,
          },
        },
      });

      const user = await prisma.user.findUnique({
        where: {
          id: ctx.user.id,
        },
        select: {
          id: true,
          username: true,
          name: true,
          startTime: true,
          endTime: true,
          bufferTime: true,
          avatar: true,
          plan: true,
          teams: {
            where: {
              accepted: true,
            },
            select: {
              role: true,
              team: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logo: true,
                  members: {
                    select: {
                      userId: true,
                    },
                  },
                  eventTypes: {
                    select: eventTypeSelect,
                  },
                },
              },
            },
          },
          eventTypes: {
            where: {
              team: null,
            },
            select: eventTypeSelect,
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      // backwards compatibility, TMP:
      const typesRaw = await prisma.eventType.findMany({
        where: {
          userId: ctx.user.id,
        },
        select: eventTypeSelect,
      });

      type EventTypeGroup = {
        teamId?: number | null;
        profile: {
          slug: typeof user["username"];
          name: typeof user["name"];
          image: typeof user["avatar"];
        };
        metadata: {
          membershipCount: number;
          readOnly: boolean;
        };
        eventTypes: (typeof user.eventTypes[number] & { $disabled?: boolean })[];
      };

      let eventTypeGroups: EventTypeGroup[] = [];
      const eventTypesHashMap = user.eventTypes.concat(typesRaw).reduce((hashMap, newItem) => {
        const oldItem = hashMap[newItem.id] || {};
        hashMap[newItem.id] = { ...oldItem, ...newItem };
        return hashMap;
      }, {} as Record<number, EventTypeGroup["eventTypes"][number]>);
      const mergedEventTypes = Object.values(eventTypesHashMap).map((et, index) => ({
        ...et,
        $disabled: user.plan === "FREE" && index > 0,
      }));

      eventTypeGroups.push({
        teamId: null,
        profile: {
          slug: user.username,
          name: user.name,
          image: user.avatar,
        },
        eventTypes: mergedEventTypes,
        metadata: {
          membershipCount: 1,
          readOnly: false,
        },
      });

      eventTypeGroups = ([] as EventTypeGroup[]).concat(
        eventTypeGroups,
        user.teams.map((membership) => ({
          teamId: membership.team.id,
          profile: {
            name: membership.team.name,
            image: membership.team.logo || "",
            slug: "team/" + membership.team.slug,
          },
          metadata: {
            membershipCount: membership.team.members.length,
            readOnly: membership.role !== "OWNER",
          },
          eventTypes: membership.team.eventTypes,
        }))
      );

      const canAddEvents = user.plan !== "FREE" || eventTypeGroups[0].eventTypes.length < 1;

      return {
        canAddEvents,
        user,
        // don't display event teams without event types,
        eventTypeGroups: eventTypeGroups.filter((groupBy) => !!groupBy.eventTypes?.length),
        // so we can show a dropdown when the user has teams
        profiles: eventTypeGroups.map((group) => ({
          teamId: group.teamId,
          ...group.profile,
          ...group.metadata,
        })),
      };
    },
  })
  .query("bookings", {
    input: z.object({
      status: z.enum(["upcoming", "past", "cancelled"]),
    }),
    async resolve({ ctx, input }) {
      const { prisma, user } = ctx;
      const bookingListingByStatus = input.status;
      const bookingListingFilters: Record<typeof bookingListingByStatus, Prisma.BookingWhereInput[]> = {
        upcoming: [{ endTime: { gte: new Date() }, NOT: { status: { equals: BookingStatus.CANCELLED } } }],
        past: [{ endTime: { lte: new Date() }, NOT: { status: { equals: BookingStatus.CANCELLED } } }],
        cancelled: [{ status: { equals: BookingStatus.CANCELLED } }],
      };
      const bookingListingOrderby: Record<typeof bookingListingByStatus, Prisma.BookingOrderByInput> = {
        upcoming: { startTime: "desc" },
        past: { startTime: "asc" },
        cancelled: { startTime: "asc" },
      };
      const passedBookingsFilter = bookingListingFilters[bookingListingByStatus];
      const orderBy = bookingListingOrderby[bookingListingByStatus];

      const bookingsQuery = await prisma.booking.findMany({
        where: {
          OR: [
            {
              userId: user.id,
            },
            {
              attendees: {
                some: {
                  email: user.email,
                },
              },
            },
          ],
          AND: passedBookingsFilter,
        },
        select: {
          uid: true,
          title: true,
          description: true,
          attendees: true,
          confirmed: true,
          rejected: true,
          id: true,
          startTime: true,
          endTime: true,
          eventType: {
            select: {
              team: {
                select: {
                  name: true,
                },
              },
            },
          },
          status: true,
        },
        orderBy,
      });

      const bookings = bookingsQuery.reverse().map((booking) => {
        return {
          ...booking,
          startTime: booking.startTime.toISOString(),
          endTime: booking.endTime.toISOString(),
        };
      });

      return bookings;
    },
  })
  .query("integrations", {
    async resolve({ ctx }) {
      const { user } = ctx;
      const { credentials } = user;

      function countActive(items: { credentialIds: unknown[] }[]) {
        return items.reduce((acc, item) => acc + item.credentialIds.length, 0);
      }
      const integrations = ALL_INTEGRATIONS.map((integration) => ({
        ...integration,
        credentialIds: credentials
          .filter((credential) => credential.type === integration.type)
          .map((credential) => credential.id),
      }));
      // `flatMap()` these work like `.filter()` but infers the types correctly
      const conferencing = integrations.flatMap((item) => (item.variant === "conferencing" ? [item] : []));
      const payment = integrations.flatMap((item) => (item.variant === "payment" ? [item] : []));
      const calendar = integrations.flatMap((item) => (item.variant === "calendar" ? [item] : []));

      // get user's credentials + their connected integrations
      const calendarCredentials = user.credentials
        .filter((credential) => credential.type.endsWith("_calendar"))
        .flatMap((credential) => {
          const integration = ALL_INTEGRATIONS.find((integration) => integration.type === credential.type);

          const adapter = getCalendarAdapterOrNull({
            ...credential,
            userId: user.id,
          });
          return integration && adapter && integration.variant === "calendar"
            ? [{ integration, credential, adapter }]
            : [];
        });

      // get all the connected integrations' calendars (from third party)
      const connectedCalendars = await Promise.all(
        calendarCredentials.map(async (item) => {
          const { adapter, integration, credential } = item;

          const credentialId = credential.id;
          try {
            const cals = await adapter.listCalendars();
            const calendars = _(cals)
              .map((cal) => ({
                ...cal,
                isSelected: user.selectedCalendars.some((selected) => selected.externalId === cal.externalId),
              }))
              .sortBy(["primary"])
              .value();
            const primary = calendars.find((item) => item.primary) ?? calendars[0];
            if (!primary) {
              throw new Error("No primary calendar found");
            }
            return {
              integration,
              credentialId,
              primary,
              calendars,
            };
          } catch (_error) {
            const error = getErrorFromUnknown(_error);
            return {
              integration,
              credentialId,
              error: {
                message: error.message,
              },
            };
          }
        })
      );

      const webhooks = await ctx.prisma.webhook.findMany({
        where: {
          userId: user.id,
        },
      });
      return {
        conferencing: {
          items: conferencing,
          numActive: countActive(conferencing),
        },
        calendar: {
          items: calendar,
          numActive: countActive(calendar),
        },
        payment: {
          items: payment,
          numActive: countActive(payment),
        },
        connectedCalendars,
        webhooks,
      };
    },
  })
  .mutation("updateProfile", {
    input: z.object({
      username: z.string().optional(),
      name: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().optional(),
      timeZone: z.string().optional(),
      weekStart: z.string().optional(),
      hideBranding: z.boolean().optional(),
      theme: z.string().optional().nullable(),
      completedOnboarding: z.boolean().optional(),
      locale: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      const { user, prisma } = ctx;
      const data: Prisma.UserUpdateInput = {
        ...input,
      };
      if (input.username) {
        const username = slugify(input.username);
        // Only validate if we're changing usernames
        if (username !== user.username) {
          data.username = username;
          const response = await checkUsername(username);
          if (!response.available) {
            throw new TRPCError({ code: "BAD_REQUEST", message: response.message });
          }
        }
      }
      if (input.avatar) {
        data.avatar = await resizeBase64Image(input.avatar);
      }

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data,
      });
    },
  });

export const viewerRouter = createRouter().merge(publicViewerRouter).merge(loggedInViewerRouter);

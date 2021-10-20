import { ReminderType } from "@prisma/client";
import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";

import { CalendarEvent } from "@lib/calendarClient";
import EventOrganizerRequestReminderMail from "@lib/emails/EventOrganizerRequestReminderMail";
import prisma from "@lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const apiKey = req.headers.authorization || req.query.apiKey;
  if (process.env.CRON_API_KEY !== apiKey) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ message: "Invalid method" });
    return;
  }

  if (req.method == "POST") {
    const reminderIntervalMinutes = [48 * 60, 24 * 60, 3 * 60];
    let notificationsSent = 0;
    for (const interval of reminderIntervalMinutes) {
      const bookings = await prisma.booking.findMany({
        where: {
          confirmed: false,
          rejected: false,
          createdAt: {
            lte: dayjs().add(-interval, "minutes").toDate(),
          },
        },
        select: {
          title: true,
          description: true,
          startTime: true,
          endTime: true,
          attendees: true,
          user: true,
          id: true,
          uid: true,
        },
      });

      const reminders = await prisma.reminderMail.findMany({
        where: {
          reminderType: ReminderType.PENDING_BOOKING_CONFIRMATION,
          referenceId: {
            in: bookings.map((b) => b.id),
          },
          elapsedMinutes: {
            gte: interval,
          },
        },
      });

      for (const booking of bookings.filter((b) => !reminders.some((r) => r.referenceId == b.id))) {
        const evt: CalendarEvent = {
          type: booking.title,
          title: booking.title,
          description: booking.description,
          startTime: booking.startTime.toISOString(),
          endTime: booking.endTime.toISOString(),
          organizer: { email: booking.user.email, name: booking.user.name, timeZone: booking.user.timeZone },
          attendees: booking.attendees,
        };

        await new EventOrganizerRequestReminderMail(evt, booking.uid).sendEmail();
        await prisma.reminderMail.create({
          data: {
            referenceId: booking.id,
            reminderType: ReminderType.PENDING_BOOKING_CONFIRMATION,
            elapsedMinutes: interval,
          },
        });
        notificationsSent++;
      }
    }
    res.status(200).json({ notificationsSent });
  }
}

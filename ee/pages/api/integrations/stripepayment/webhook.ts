import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

import stripe from "@ee/lib/stripe/server";

import { CalendarEvent, AdditionInformation } from "@lib/calendarClient";
import { IS_PRODUCTION } from "@lib/config/constants";
import { HttpError } from "@lib/core/http/error";
import { sendScheduledEmails } from "@lib/emails/email-manager";
import { getErrorFromUnknown } from "@lib/errors";
import EventManager from "@lib/events/EventManager";
import logger from "@lib/logger";
import prisma from "@lib/prisma";
import { Ensure } from "@lib/types/utils";

import { getTranslation } from "@server/lib/i18n";

const log = logger.getChildLogger({ prefix: ["[api] book:user"] });

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handlePaymentSuccess(event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const payment = await prisma.payment.update({
    where: {
      externalId: paymentIntent.id,
    },
    data: {
      success: true,
      booking: {
        update: {
          paid: true,
        },
      },
    },
    select: {
      bookingId: true,
      booking: {
        select: {
          title: true,
          description: true,
          startTime: true,
          endTime: true,
          confirmed: true,
          attendees: true,
          location: true,
          userId: true,
          id: true,
          uid: true,
          paid: true,
          user: {
            select: {
              id: true,
              credentials: true,
              timeZone: true,
              email: true,
              name: true,
              locale: true,
              destinationCalendar: true,
            },
          },
        },
      },
    },
  });

  if (!payment) throw new Error("No payment found");

  const { booking } = payment;

  if (!booking) throw new Error("No booking found");

  const { user } = booking;

  if (!user) throw new Error("No user found");

  const t = await getTranslation(user.locale ?? "en", "common");

  const evt: Ensure<CalendarEvent, "language"> = {
    type: booking.title,
    title: booking.title,
    description: booking.description || undefined,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    organizer: { email: user.email!, name: user.name!, timeZone: user.timeZone },
    attendees: booking.attendees,
    uid: booking.uid,
    language: t,
  };

  if (booking.location) evt.location = booking.location;

  if (booking.confirmed) {
    const eventManager = new EventManager(user);
    const scheduleResult = await eventManager.create(evt);

    await prisma.booking.update({
      where: {
        id: payment.bookingId,
      },
      data: {
        references: {
          create: scheduleResult.referencesToCreate,
        },
      },
    });

    const results = scheduleResult.results;

    if (results.length > 0 && results.every((res) => !res.success)) {
      const error = {
        errorCode: "BookingCreatingMeetingFailed",
        message: "Booking failed",
      };
      log.error(`Booking ${user.name} failed`, error, results);
    } else {
      const metadata: AdditionInformation = {};

      if (results.length) {
        // TODO: Handle created event metadata more elegantly
        metadata.hangoutLink = results[0].createdEvent?.hangoutLink;
        metadata.conferenceData = results[0].createdEvent?.conferenceData;
        metadata.entryPoints = results[0].createdEvent?.entryPoints;
      }
      log.info(`Booking ${user.name} succeeded.`, results);
      await sendScheduledEmails({ ...evt, additionInformation: metadata });
    }
  }
}

type WebhookHandler = (event: Stripe.Event) => Promise<void>;

const webhookHandlers: Record<string, WebhookHandler | undefined> = {
  "payment_intent.succeeded": handlePaymentSuccess,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      throw new HttpError({ statusCode: 405, message: "Method Not Allowed" });
    }
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      throw new HttpError({ statusCode: 400, message: "Missing stripe-signature" });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new HttpError({ statusCode: 500, message: "Missing process.env.STRIPE_WEBHOOK_SECRET" });
    }
    const requestBuffer = await buffer(req);
    const payload = requestBuffer.toString();

    const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);

    const handler = webhookHandlers[event.type];
    if (handler) {
      await handler(event);
    } else {
      /** Not really an error, just letting Stripe know that the webhook was received but unhandled */
      throw new HttpError({
        statusCode: 202,
        message: `Unhandled Stripe Webhook event type ${event.type}`,
      });
    }
  } catch (_err) {
    const err = getErrorFromUnknown(_err);
    console.error(`Webhook Error: ${err.message}`);
    res.status(err.statusCode ?? 500).send({
      message: err.message,
      stack: IS_PRODUCTION ? undefined : err.stack,
    });
    return;
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
}

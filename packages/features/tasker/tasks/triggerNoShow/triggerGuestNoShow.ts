import { WebhookTriggerEvents } from "@calcom/prisma/enums";

import { calculateMaxStartTime, sendWebhookPayload, prepareNoShowTrigger, log } from "./common";

const markAllGuestNoshowInBooking = async ({ bookingId, hostsThatJoinedTheCall }) => {
  try {
    const hostsThatJoinedTheCallEmails = hostsThatJoinedTheCall.map((h) => h.email);

    await prisma.attendee.updateMany({
      where: {
        bookingId,
        email: { notIn: hostsThatJoinedTheCallEmails },
      },
      data: { noShow: true },
    });
  } catch (err) {
    log.error("Error marking hosts as no show in booking", error);
  }
};

export async function triggerGuestNoShow(payload: string): Promise<void> {
  const result = await prepareNoShowTrigger(payload);
  if (!result) return;

  const { webhook, booking, hostsThatJoinedTheCall, didGuestJoinTheCall } = result;

  const maxStartTime = calculateMaxStartTime(booking.startTime, webhook.time, webhook.timeUnit);

  if (!didGuestJoinTheCall) {
    await sendWebhookPayload(
      webhook,
      WebhookTriggerEvents.AFTER_GUESTS_CAL_VIDEO_NO_SHOW,
      booking,
      maxStartTime
    );

    await markAllGuestNoshowInBooking({ bookingId: booking.id, hostsThatJoinedTheCall });
  }
}

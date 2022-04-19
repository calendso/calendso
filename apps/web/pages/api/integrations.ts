import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@lib/auth";
import prisma from "@lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!["GET", "DELETE"].includes(req.method!)) {
    return res.status(405).end();
  }

  // Check that user is authenticated
  const session = await getSession({ req });

  if (!session) {
    res.status(401).json({ message: "You must be logged in to do this" });
    return;
  }

  if (req.method === "GET") {
    const credentials = await prisma.credential.findMany({
      where: {
        userId: session.user?.id,
      },
      select: {
        type: true,
      },
    });

    res.status(200).json(credentials);
  }

  if (req.method == "DELETE") {
    /** Get the id from the stripe_payment credential for this user */
    const paymentCredential = await prisma.credential.findFirst({
      where: {
        userId: session?.user?.id,
        type: "stripe_payment",
      },
      select: {
        id: true,
      },
    });
    const credentialToDeleteId = req.body.id;

    await prisma.user.update({
      where: {
        id: session?.user?.id,
      },
      data: {
        credentials: {
          delete: {
            id: credentialToDeleteId
          },
        },
      },
    });

    /** This validates if you disconnect the Stripe credential.
    When you disconnect this credential, you have to delete the information from payment 
    and then update the booking status to Rejected, this is just for those booking that are unconfirmed and 
    unpaid*/
    if (paymentCredential?.id === credentialToDeleteId) {
      try {
        const bookingWithPaymentIds = await prisma.booking
          .findMany({
            where: {
              userId: session?.user?.id,
              paid: false,
              NOT: {
                payment: {
                  every: {
                    booking: null,
                  },
                },
              },
            },
            select: {
              id: true,
            },
          })
          .then((bookings) => bookings.map((booking) => booking.id));
        const deletePayments = prisma.payment.deleteMany({
          where: {
            bookingId: {
              in: bookingWithPaymentIds,
            },
            success: false,
          },
        });

        const updateBookings = prisma.booking.updateMany({
          where: {
            id: {
              in: bookingWithPaymentIds,
            },
          },
          data: {
            rejected: true,
            status: "REJECTED",
            rejectionReason: "Payment provider got removed",
          },
        });

        const bookingReferences = await prisma.booking
          .findMany({
            where: {
              confirmed: true,
              rejected: false,
            },
            select: {
              id: true,
            },
          })
          .then((bookings) => bookings.map((booking) => booking.id));

        const deleteBookingReferences = prisma.bookingReference.deleteMany({
          where: {
            bookingId: {
              in: bookingReferences,
            },
          },
        });

        await prisma.$transaction([deletePayments, updateBookings, deleteBookingReferences]);
      } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Integration can not be deleted" });
      }
    }
    res.status(200).json({ message: "Integration deleted successfully" });
  }
}

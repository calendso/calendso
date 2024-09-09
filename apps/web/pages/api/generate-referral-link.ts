import type { NextApiRequest, NextApiResponse } from "next";

import { dub } from "@calcom/features/auth/lib/dub";
import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import prisma from "@calcom/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getServerSession({ req, res });

  if (!session?.user?.username) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Check if user already has a referral link
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      referralLinkId: true,
    },
  });

  if (user?.referralLinkId) {
    const link = await dub.links.get({
      linkId: user.referralLinkId,
    });

    if (!link) {
      console.error(`User ${session.user.id} has a referral link ID, but failed to get the link`);
      return res.status(500).json({ message: "Failed to get referral link" });
    }

    return res.status(200).json({ shortLink: link.shortLink });
  }

  const { id: referralLinkId, shortLink } = await dub.links.create({
    domain: "refer.cal.com",
    key: session?.user?.username,
    url: "https://cal.com",
    externalId: session.user.id.toString(), // @see https://d.to/externalId
    trackConversion: true, // enable conversion tracking @see https://d.to/conversions
  });

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      referralLinkId,
    },
  });

  return res.status(200).json({ shortLink });
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import prisma from "../../lib/prismaClient";

type Data = {
  users: {
    email: string;
    username: string;
    id: number | null;
    accessToken: string;
  }[];
};

// example endpoint to create a managed cal.com user
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const existingUsers = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  if (existingUsers && existingUsers.length > 2) {
    return res.status(200).json({
      users: existingUsers.map((item) => ({
        id: item.calcomUserId,
        email: item.email,
        username: item.calcomUsername ?? "",
        accessToken: item.accessToken ?? "",
      })),
    });
  }
  return res.status(400).json({ users: [] });
}

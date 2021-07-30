import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { hashPassword } from "../../../../lib/auth";
import { User } from ".prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createAmiliUser = async (req: NextApiRequest, res: NextApiResponse): Promise<User | any> => {
  const data = req.body;
  const { password, email, healthCoachId, name } = data;

  // Check valid method
  if (req.method !== "POST") return;

  // Check valid email
  const existingUser = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });

  if (existingUser) return res.status(409).json({ message: "Email address is already registered" });

  // Create user
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      username: healthCoachId,
      email,
      password: hashedPassword,
    },
  });

  return user;
};

export default createAmiliUser;

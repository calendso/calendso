// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { X_CAL_SECRET_KEY } from "@calcom/platform-constants";

import prisma from "../../lib/prismaClient";

type Data = {
  email: string;
  id: string;
  accessToken: string;
};

// endpoint to create a manated user cal.com user
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { email } = JSON.parse(req.body);
  const localUser = await prisma.user.create({
    data: {
      email,
    },
  });
  const response = await fetch(
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    `http://localhost:5555/api/v2/oauth-clients/${process.env.NEXT_PUBLIC_X_CAL_ID}/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        [X_CAL_SECRET_KEY]: process.env.X_CAL_SECRET_KEY ?? "",
      },
      body: JSON.stringify({
        email,
      }),
    }
  );
  const body = await response.json();
  await prisma.user.update({
    data: {
      refreshToken: (body.data.refreshToken as string) ?? "",
      accessToken: (body.data.accessToken as string) ?? "",
      calcomUserId: body.data.user.id,
    },
    where: { id: localUser.id },
  });
  return res.status(200).json({
    id: (body?.data?.user?.id as string) ?? "",
    email: (body.data.user.email as string) ?? "",
    accessToken: (body.data.accessToken as string) ?? "",
  });
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { X_CAL_SECRET_KEY } from "@calcom/platform-constants";

import prisma from "../../lib/prismaClient";

type Data = {
  accessToken: string;
};

// endpoint called by the client to refresh the access token of cal.com managed user
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const authHeader = req.headers.authorization;

  const accessToken = authHeader?.split("Bearer ")[1];

  if (accessToken) {
    const localUser = await prisma.user.findUnique({
      where: {
        accessToken: accessToken as string,
      },
    });
    if (localUser?.refreshToken) {
      const response = await fetch(
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        `http://localhost:5555/api/v2/oauth/${process.env.NEXT_PUBLIC_X_CAL_ID ?? ""}/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // eslint-disable-next-line turbo/no-undeclared-env-vars
            [X_CAL_SECRET_KEY]: process.env.X_CAL_SECRET_KEY ?? "",
          },
          body: JSON.stringify({
            refreshToken: localUser.refreshToken,
          }),
        }
      );
      if (response.status === 200) {
        const resp = await response.json();
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = resp.data;

        await prisma.user.update({
          data: {
            refreshToken: (newRefreshToken as string) ?? "",
            accessToken: (newAccessToken as string) ?? "",
          },
          where: { id: localUser.id },
        });
        return res.status(200).json({ accessToken: newAccessToken });
      }
      console.log(await response.json());
      return res.status(400).json({ accessToken: "" });
    }
  }

  return res.status(404).json({ accessToken: "" });
}

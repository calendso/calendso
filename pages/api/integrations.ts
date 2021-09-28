import { getSession } from "@lib/auth";

import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Check that user is authenticated
    const session = await getSession({ req: req });

    if (!session) {
      res.status(401).json({ message: "You must be logged in to do this" });
      return;
    }

    const credentials = await prisma.credential.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        type: true,
      },
    });

    res.status(200).json(credentials);
  }

  if (req.method == "DELETE") {
    const session = await getSession({ req: req });

    if (!session) {
      res.status(401).json({ message: "You must be logged in to do this" });
      return;
    }

    const id = req.body.id;

    await prisma.credential.delete({
      where: {
        id: id,
      },
    });

    res.status(200).json({ message: "Integration deleted successfully" });
  }
}

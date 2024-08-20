import type { PrismaClient } from "@prisma/client";
import axios from "axios";
import type { NextApiRequest } from "next";

import { defaultResponder } from "@calcom/lib/server";

import { zohoClient } from "../../lib/zoho";

async function getHandler(req: NextApiRequest & { prisma: any }) {
  const prisma: PrismaClient = req.prisma;
  const schedulingSetupEntries = await prisma.zohoSchedulingSetup.findMany();

  // prepare request to get zoho mail users
  const requestBody = {
    url: `${process.env.ZOHO_MAIL_BASE_URL}/organization/${process.env.ZOHO_MAIL_ORG_ID}/accounts`,
    method: "get",
    data: {},
  };

  const [crmUsersResponse, zohoMailAccountsResponse] = await Promise.all([
    zohoClient().crm().getRecords("users"),
    axios.post(`${process.env.MANAGER_URL}/manager/new`, requestBody),
  ]);

  const zohoMailAccounts = zohoMailAccountsResponse?.data?.data || [];
  const crmUsers = crmUsersResponse?.users || [];

  const users = crmUsers.map((u) => {
    const setupEntry = schedulingSetupEntries.find((entry) => String(entry.zuid) === String(u.zuid));
    const zohoMailAccount = zohoMailAccounts.find((account) => String(account.zuid) === String(u.zuid));

    return {
      userId: setupEntry.userId,
      zuid: u.zuid,
      email: u.email,
      name: `${u.first_name} ${u.last_name}`,
      hasZohoCalender: !!zohoMailAccount,
      timeZone: zohoMailAccount?.timeZone || u.time_zone,
      status: setupEntry?.status || "Not Started",
    };
  });

  return { crmUsers: users };
}

export default defaultResponder(getHandler);

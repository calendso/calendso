import prisma from "@calcom/prisma";

import * as twilio from "./smsProviders/twilioProvider";

export const sendVerificationCode = async (phoneNumber: string) => {
  return twilio.sendVerificationCode(phoneNumber);
};

export const verifyPhoneNumber = async (phoneNumber: string, code: string, userId: number) => {
  const verificationStatus = await twilio.verifyNumber(phoneNumber, code);

  if (verificationStatus === "approved") {
    await prisma.verifiedNumber.create({
      data: {
        userId,
        phoneNumber,
      },
    });
    return true;
  }
  return false;
};

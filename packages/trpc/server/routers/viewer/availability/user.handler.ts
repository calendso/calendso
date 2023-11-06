import { getUserAvailability } from "@calcom/core/getUserAvailability";

import type { TrpcSessionUser } from "../../../trpc";
import type { TUserInputSchema } from "./user.schema";

type UserOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
  input: TUserInputSchema;
};

export const userHandler = async ({ input, ctx: { user } }: UserOptions) => {
  return getUserAvailability(input, undefined, user.username === input.username);
};

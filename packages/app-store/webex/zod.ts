import { z } from "zod";

export const appDataSchema = z.object({});

export const appKeysSchema = z.object({
  client_id: z.string().min(64),
  client_secret: z.string().min(64),
});

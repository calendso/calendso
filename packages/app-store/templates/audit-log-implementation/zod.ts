import { z } from "zod";

export const appKeysSchema = z.object({
  apiKey: z.string().min(1),
  projectId: z.string().min(1),
});

export type AppKeys = z.infer<typeof appKeysSchema>;

export const appDataSchema = z.object({});

import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const CreateOAuthClientSchema = z.object({
  logo: z.string().optional(),
  name: z.string(),
  redirect_uris: z.array(z.string()),
  permissions: z.number(),
});

export class CreateOAuthClientDto extends createZodDto(CreateOAuthClientSchema) {}

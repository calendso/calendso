import { z } from "zod";
import { slugify } from "@lib/slugify";
import { LocationType } from "@lib/location";

export const eventTypeLocations = z.array(
  z.object({ type: z.nativeEnum(LocationType), address: z.string().optional() })
);

export const eventTypeSlug = z.string().transform((val) => slugify(val.trim()));
export const stringToDate = z.string().transform((a) => new Date(a));
export const stringOrNumber = z.union([z.string().transform((v) => parseInt(v, 10)), z.number().int()]);

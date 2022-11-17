import { z } from "zod";

const zodField = z.object({
  id: z.string(),
  label: z.string(),
  identifier: z.string().optional(),
  type: z.string(),
  selectText: z.string().optional(),
  required: z.boolean().optional(),
  deleted: z.boolean().optional(),
});

export const zodLocalField = zodField;
export const zodLocalFieldView = zodLocalField;

export const zodGlobalField = z.object({
  id: z.string(),
  globalRouterId: z.string(),
});

export const zodGlobalFieldView = zodLocalField.extend(zodGlobalField.shape).extend({
  globalRouter: z.object({
    name: z.string(),
    description: z.string(),
    id: z.string(),
  }),
});

export const zodFields = z.array(zodField).optional();

/**
 * Has some additional fields that are not supposed to be saved to DB but are required for the UI
 */
export const zodFieldView = z.union([zodLocalFieldView, zodGlobalFieldView]);

export const zodFieldsView = z.array(zodFieldView).optional();

export const zodLocalRoute = z.object({
  id: z.string(),
  queryValue: z.object({
    id: z.string().optional(),
    type: z.union([z.literal("group"), z.literal("switch_group")]),
    children1: z.any(),
    properties: z.any(),
  }),
  isFallback: z.boolean().optional(),
  action: z.object({
    // TODO: Make it a union type of "customPageMessage" and ..
    type: z.union([
      z.literal("customPageMessage"),
      z.literal("externalRedirectUrl"),
      z.literal("eventTypeRedirectUrl"),
    ]),
    value: z.string(),
  }),
});

export const zodLocalRouteView = zodLocalRoute;

export const zodGlobalRoute = z.object({
  // This is the id of the Form being used as router
  id: z.string(),
  // TODO: Rename it to isGlobalRouter or isLinkedRouter
  routerType: z.literal("global"),
});

export const zodRoute = z.union([zodLocalRoute, zodGlobalRoute]);

export const zodGlobalRouteView = zodGlobalRoute.extend({
  //TODO: Extend it from form
  name: z.string(),
  description: z.string().nullable(),
  routes: z.array(z.union([zodRoute, z.null()])),
});

export const zodRoutes = z.union([z.array(zodRoute), z.null()]).optional();

export const zodRouteView = z.union([zodLocalRouteView, zodGlobalRouteView]);

export const zodRoutesView = z.union([z.array(zodRouteView), z.null()]).optional();

// TODO: This is a requirement right now that zod.ts file (if it exists) must have appDataSchema export(which is only required by apps having EventTypeAppCard interface)
// This is a temporary solution and will be removed in future
export const appDataSchema = z.any();

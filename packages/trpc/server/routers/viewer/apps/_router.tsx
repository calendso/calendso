import { authedAdminProcedureWithAuditLogger } from "../../../procedures/authedProcedure";
import { router } from "../../../trpc";
import { createCallerFactory } from "../../../trpc";
import { checkGlobalKeysSchema } from "./checkGlobalKeys.schema";
import { ZListLocalInputSchema } from "./listLocal.schema";
import { ZQueryForDependenciesInputSchema } from "./queryForDependencies.schema";
import { ZSaveKeysInputSchema } from "./saveKeys.schema";
import { ZToggleInputSchema } from "./toggle.schema";
import { ZUpdateAppCredentialsInputSchema } from "./updateAppCredentials.schema";

type AppsRouterHandlerCache = {
  listLocal?: typeof import("./listLocal.handler").listLocalHandler;
  toggle?: typeof import("./toggle.handler").toggleHandler;
  saveKeys?: typeof import("./saveKeys.handler").saveKeysHandler;
  checkForGCal?: typeof import("./checkForGCal.handler").checkForGCalHandler;
  updateAppCredentials?: typeof import("./updateAppCredentials.handler").updateAppCredentialsHandler;
  queryForDependencies?: typeof import("./queryForDependencies.handler").queryForDependenciesHandler;
  checkGlobalKeys?: typeof import("./checkGlobalKeys.handler").checkForGlobalKeysHandler;
  updateCredentialSettings?: typeof import("./updateCredentialSettings.handler").updateCredentialSettingsHandler;
};

const UNSTABLE_HANDLER_CACHE: AppsRouterHandlerCache = {};

export const appsRouter = router({
  listLocal: authedAdminProcedureWithAuditLogger
    .input(ZListLocalInputSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.listLocal) {
        UNSTABLE_HANDLER_CACHE.listLocal = await import("./listLocal.handler").then(
          (mod) => mod.listLocalHandler
        );
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.listLocal) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.listLocal({
        ctx,
        input,
      });
    }),

  toggle: authedAdminProcedureWithAuditLogger.input(ZToggleInputSchema).mutation(async ({ ctx, input }) => {
    if (!UNSTABLE_HANDLER_CACHE.toggle) {
      UNSTABLE_HANDLER_CACHE.toggle = await import("./toggle.handler").then((mod) => mod.toggleHandler);
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.toggle) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.toggle({
      ctx,
      input,
    });
  }),

  saveKeys: authedAdminProcedureWithAuditLogger
    .input(ZSaveKeysInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.saveKeys) {
        UNSTABLE_HANDLER_CACHE.saveKeys = await import("./saveKeys.handler").then(
          (mod) => mod.saveKeysHandler
        );
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.saveKeys) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.saveKeys({
        ctx,
        input,
      });
    }),

  checkForGCal: authedAdminProcedureWithAuditLogger.query(async ({ ctx }) => {
    if (!UNSTABLE_HANDLER_CACHE.checkForGCal) {
      UNSTABLE_HANDLER_CACHE.checkForGCal = await import("./checkForGCal.handler").then(
        (mod) => mod.checkForGCalHandler
      );
    }

    // Unreachable code but required for type safety
    if (!UNSTABLE_HANDLER_CACHE.checkForGCal) {
      throw new Error("Failed to load handler");
    }

    return UNSTABLE_HANDLER_CACHE.checkForGCal({
      ctx,
    });
  }),

  updateAppCredentials: authedAdminProcedureWithAuditLogger
    .input(ZUpdateAppCredentialsInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.updateAppCredentials) {
        UNSTABLE_HANDLER_CACHE.updateAppCredentials = await import("./updateAppCredentials.handler").then(
          (mod) => mod.updateAppCredentialsHandler
        );
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.updateAppCredentials) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.updateAppCredentials({
        ctx,
        input,
      });
    }),

  queryForDependencies: authedAdminProcedureWithAuditLogger
    .input(ZQueryForDependenciesInputSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.queryForDependencies) {
        UNSTABLE_HANDLER_CACHE.queryForDependencies = await import("./queryForDependencies.handler").then(
          (mod) => mod.queryForDependenciesHandler
        );
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.queryForDependencies) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.queryForDependencies({
        ctx,
        input,
      });
    }),
  checkGlobalKeys: authedAdminProcedureWithAuditLogger
    .input(checkGlobalKeysSchema)
    .query(async ({ ctx, input }) => {
      if (!UNSTABLE_HANDLER_CACHE.checkGlobalKeys) {
        UNSTABLE_HANDLER_CACHE.checkGlobalKeys = await import("./checkGlobalKeys.handler").then(
          (mod) => mod.checkForGlobalKeysHandler
        );
      }

      // Unreachable code but required for type safety
      if (!UNSTABLE_HANDLER_CACHE.checkGlobalKeys) {
        throw new Error("Failed to load handler");
      }

      return UNSTABLE_HANDLER_CACHE.checkGlobalKeys({
        ctx,
        input,
      });
    }),
});

export const appsRouterCreateCaller = createCallerFactory(appsRouter);

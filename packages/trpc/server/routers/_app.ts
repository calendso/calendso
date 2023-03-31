/**
 * This file contains the root router of your tRPC-backend
 */
import { router } from "../trpc";
import { viewerRouter } from "./viewer";
import { slotsRouter } from "./viewer/slots";

/**
 * Create your application's root router
 * If you want to use SSG, you need export this
 * @link https://trpc.io/docs/ssg
 * @link https://trpc.io/docs/router
 */
export const appRouter = router({
  slots: slotsRouter,
  viewer: viewerRouter,
});

export type AppRouter = typeof appRouter;

import { postsRouter } from "./routers/posts";
import { profileRouter } from "./routers/profile";
import { searchRouter } from "./routers/search";

import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  posts: postsRouter,
  profile: profileRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

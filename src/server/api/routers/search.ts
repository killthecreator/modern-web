import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import filterUserForClient from "~/server/helpers/filterUserForClient";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import type { Post } from "@prisma/client";

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);
    if (!author || !author.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });
    return { post, author: { ...author, username: author.username } };
  });
};

export const searchRouter = createTRPCRouter({
  getPostsByContent: publicProcedure
    .input(z.object({ content: z.string() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        where: { content: { contains: input.content } },
      });

      if (!posts) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Posts not found" });
      }

      return await addUserDataToPosts(posts);
    }),
});

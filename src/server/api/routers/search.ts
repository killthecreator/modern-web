import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { addUserDataToPosts } from "~/server/helpers/addUserDataToPosts";

export const searchRouter = createTRPCRouter({
  getPostsByContent: publicProcedure
    .input(z.object({ content: z.string(), cursor: z.string().nullish() }))
    .query(async ({ ctx, input }) => {
      const { cursor } = input;
      const limit = 10;
      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        where: { content: { contains: input.content } },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!posts) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Posts not found" });
      }

      let nextCursor: typeof cursor | undefined = undefined;
      if (posts.length > limit) {
        const nextPost = posts.pop();
        nextCursor = nextPost!.id;
      }

      const postsWithUserdata = await addUserDataToPosts(posts);
      return { postsWithUserdata, nextCursor };
    }),
});

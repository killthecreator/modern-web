import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import filterUserForClient from "~/server/helpers/filterUserForClient";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      return filterUserForClient(user);
    }),
  updateUsername: publicProcedure
    .input(z.object({ username: z.string(), id: z.string() }))
    .mutation(async ({ input }) => {
      const user = await clerkClient.users.updateUser(input.id, {
        username: input.username,
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      return filterUserForClient(user);
    }),
});

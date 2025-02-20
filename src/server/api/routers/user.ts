import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { subscribeSchema } from "../schema";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  subscribe: publicProcedure
    .input(subscribeSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.insert(users).values({
          email: input.email,
        });
      } catch (error) {
        console.error("Error inserting user:", error);
        return new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to subscribe user",
        });
      }
    }),
  total: publicProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.select().from(users);
    return total.length;
  }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const allUsers = await ctx.db.select().from(users);
    return allUsers;
  }),
});

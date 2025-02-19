import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { subscribeSchema } from "../schema";

export const userRouter = createTRPCRouter({
  subscribe: publicProcedure
    .input(subscribeSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(users).values({
        email: input.email,
      });
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

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { issues } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const issueRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.select().from(issues);
    return total;
  }),
  getSubset: protectedProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.select().from(issues).limit(5);
    return total;
  }),
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const slug = input.slug.replace(/-/g, " ");
      const issue = await ctx.db
        .select()
        .from(issues)
        .where(eq(issues.title, slug))
        .limit(1);
      return issue[0];
    }),
});

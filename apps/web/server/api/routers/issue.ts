import { sendSingleIssue } from "@newsletter/agent";
import { issues } from "@newsletter/db/schema";
import { desc, eq } from "drizzle-orm";
import { start } from "workflow/api";
import { z } from "zod";

import { getAgentInput } from "@/server/agent-input";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { generateNewsletterWorkflow } from "@/workflows/generate-newsletter";

export const issueRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(issues).orderBy(desc(issues.createdAt));
  }),
  total: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.select().from(issues);
    return rows.length;
  }),
  /** Count of drafts sitting in the admin's approval queue. */
  pending: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.select().from(issues).where(eq(issues.status, "pending"));
    return rows.length;
  }),
  getSubset: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(issues).orderBy(desc(issues.createdAt)).limit(5);
  }),
  getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const [issue] = await ctx.db.select().from(issues).where(eq(issues.id, input.id));
    return issue ?? null;
  }),
  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const slug = input.slug.replace(/-/g, " ");
      const issue = await ctx.db.select().from(issues).where(eq(issues.title, slug)).limit(1);
      return issue[0];
    }),

  /**
   * Run the durable research -> draft -> critique -> rewrite workflow and store
   * the result as a `pending` issue. Awaits the workflow's return so the caller
   * gets the new issue id; the workflow itself is durable, so it still completes
   * and persists even if this request times out.
   */
  generate: protectedProcedure.mutation(async () => {
    const run = await start(generateNewsletterWorkflow, [getAgentInput()]);
    return run.returnValue;
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(256),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(issues)
        .set({ title: input.title, content: input.content })
        .where(eq(issues.id, input.id))
        .returning();
      return updated;
    }),

  approve: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(issues)
        .set({ status: "approved" })
        .where(eq(issues.id, input.id))
        .returning();
      return updated;
    }),

  reject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(issues)
        .set({ status: "rejected" })
        .where(eq(issues.id, input.id))
        .returning();
      return updated;
    }),

  /** Send a single approved issue to every subscriber right now. */
  sendNow: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    return sendSingleIssue(input.id);
  }),
});

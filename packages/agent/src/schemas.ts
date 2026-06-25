import { z } from "zod";

export const sourceSchema = z
  .object({
    title: z.string().describe("Title of the source article / page"),
    url: z.string().url().describe("Canonical URL of the source"),
  })
  .describe("A cited source backing a claim in the newsletter");

export const draftSchema = z.object({
  title: z.string().max(120).describe("Catchy, human-written-sounding issue title"),
  subject: z
    .string()
    .max(100)
    .describe("The email subject line. Short, compelling, no emoji spam."),
  summary: z.string().max(280).describe("A 1-2 sentence TL;DR shown above the fold."),
  content: z
    .string()
    .describe(
      "Full newsletter body in GitHub-flavored Markdown. 600-1000 words. Include section headings, bullet points, and inline markdown links to sources.",
    ),
  keyTakeaways: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("3-5 concise bullet takeaways for the end of the issue"),
  sources: z
    .array(sourceSchema)
    .min(3)
    .describe("Every source referenced in the body, for the footer + citations"),
});

export type Draft = z.infer<typeof draftSchema>;

/**
 * Serializable input handed to the durable workflow. Workflows cannot read
 * `process.env` or import Node-only modules, so the route (Node context) reads
 * env vars and passes this plain object as the workflow argument.
 */
export interface AgentInput {
  model: string;
  niche: string;
  tone: string;
  audience: string;
  scoreThreshold: number;
  maxRevisions: number;
}

export const critiqueSchema = z.object({
  score: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("Overall publish-readiness score, 1 (unusable) to 10 (ready to ship)"),
  isApproved: z
    .boolean()
    .describe("True only when the draft is genuinely ready to send to subscribers"),
  strengths: z.array(z.string()).describe("What works well in the draft"),
  weaknesses: z.array(z.string()).describe("Concrete problems that hurt quality"),
  suggestedImprovements: z
    .array(z.string())
    .describe("Specific, actionable edits to raise the score on the next pass"),
});

export type Critique = z.infer<typeof critiqueSchema>;

export const newsletterResultSchema = z.object({
  draft: draftSchema,
  revisions: z.number().int().min(0),
  finalScore: z.number().int().min(1).max(10),
  approved: z.boolean(),
});

export type NewsletterResult = z.infer<typeof newsletterResultSchema>;

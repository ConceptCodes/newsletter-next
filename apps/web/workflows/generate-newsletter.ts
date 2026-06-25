import { streamNewsletterAgent } from "@newsletter/agent/agent";
import { persistDraft } from "@newsletter/agent/persist";
import type { AgentInput, Draft } from "@newsletter/agent/schemas";

/**
 * Durable newsletter-generation workflow.
 *
 * 1. The WorkflowAgent researches the niche (web search), drafts an issue,
 *    critiques it, and revises until it's satisfied — all as durable, resumable
 *    steps.
 * 2. A final step persists the finished draft as a `pending` issue in the
 *    admin's approval queue.
 *
 * Triggered by the weekly Vercel Cron (`/api/cron/draft`) or the dashboard's
 * "Generate" button (`issue.generate`). Configuration arrives as a serializable
 * `input` argument (the workflow can't read `process.env`). Because it's durable
 * it survives restarts and deploys regardless of how long the agent takes.
 */
export async function generateNewsletterWorkflow(input: AgentInput) {
  "use workflow";

  const draft = await streamNewsletterAgent(input);
  const issue = await persistDraftStep(draft);

  return { issueId: issue.id, title: issue.title };
}

async function persistDraftStep(draft: Draft) {
  "use step";
  return persistDraft(draft);
}

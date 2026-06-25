import { db } from "@newsletter/db";
import { issues, type Issue } from "@newsletter/db/schema";

import type { Draft } from "./schemas";

/**
 * Persist the agent's draft as a `pending` issue in the admin's approval queue.
 *
 * This touches the database (Node-only), so it must only ever be called from a
 * `"use step"` function inside the workflow — never from workflow-context code.
 */
export async function persistDraft(draft: Draft): Promise<Issue> {
  const [issue] = await db
    .insert(issues)
    .values({
      title: draft.title,
      content: draft.content,
      sources: draft.sources,
      status: "pending",
    })
    .returning();

  if (!issue) throw new Error("Failed to persist generated issue");
  return issue;
}

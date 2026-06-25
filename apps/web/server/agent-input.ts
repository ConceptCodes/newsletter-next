import { env } from "@newsletter/config";
import type { AgentInput } from "@newsletter/agent/schemas";

/**
 * Build the serializable workflow input from environment variables. Routes run
 * in Node context (where env is available); the durable workflow itself can't
 * read `process.env`, so we hand it this plain object.
 */
export function getAgentInput(): AgentInput {
  return {
    model: env.AGENT_MODEL,
    niche: env.AGENT_NICHE,
    tone: env.AGENT_TONE ?? "sharp, concise, and genuinely useful",
    audience: env.AGENT_AUDIENCE ?? "curious professionals in this space",
    scoreThreshold: env.AGENT_SCORE_THRESHOLD,
    maxRevisions: env.AGENT_MAX_REVISIONS,
  };
}

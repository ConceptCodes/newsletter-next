export { type AgentInput } from "./schemas";

// Workflow-safe entrypoints (imported by the durable workflow):
//   import { streamNewsletterAgent } from "@newsletter/agent/agent";
//   import { persistDraft } from "@newsletter/agent/persist";
// They are intentionally NOT re-exported here so the barrel (which also pulls in
// the Node-only email/db code) never ends up in a workflow's import graph.

export {
  getMailer,
  renderIssueEmail,
  runSendCycle,
  sendIssueToSubscribers,
  sendSingleIssue,
  type RenderedEmail,
} from "./email";

export { type Critique, type Draft, critiqueSchema, draftSchema } from "./schemas";

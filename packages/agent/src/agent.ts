import { gateway } from "@ai-sdk/gateway";
import { Output, WorkflowAgent, type ModelCallStreamPart } from "@ai-sdk/workflow";
import { getWritable } from "workflow";

import { researchPrompt, researcherWriterSystem } from "./prompts";
import { type AgentInput, type Draft, draftSchema } from "./schemas";

/**
 * Run the durable newsletter agent inside the current workflow context and
 * return the finished draft.
 *
 * Must be awaited from within a `"use workflow"` function so that
 * `getWritable()` resolves and the agent's LLM/tool steps are durable. This
 * module intentionally imports only workflow-safe packages (no direct `ai`
 * imports, no Node-only code, no `process.env`) — all configuration arrives via
 * the serializable `input`.
 */
export async function streamNewsletterAgent(input: AgentInput): Promise<Draft> {
  const agent = new WorkflowAgent({
    model: input.model,
    instructions: researcherWriterSystem(input),
    tools: {
      // Gateway-hosted web search — executed server-side by the AI Gateway, so
      // it needs no local/Node execute function.
      web_search: gateway.tools.perplexitySearch({
        maxResults: 8,
        searchRecencyFilter: "week",
      }),
    },
    // The agent self-terminates when it emits the structured `output` issue;
    // the system prompt caps revisions at `input.maxRevisions`.
    output: Output.object({ schema: draftSchema }),
  });

  const result = await agent.stream({
    messages: [{ role: "user", content: researchPrompt(input) }],
    writable: getWritable<ModelCallStreamPart>(),
  });

  return result.output;
}

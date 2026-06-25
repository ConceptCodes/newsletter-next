import { NextResponse } from "next/server";
import { start } from "workflow/api";

import { getAgentInput } from "@/server/agent-input";
import { verifyCron } from "@/server/cron";
import { generateNewsletterWorkflow } from "@/workflows/generate-newsletter";

// The durable workflow runs in the background and is not bound by this route's
// lifetime, so a short duration is fine here.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  if (!verifyCron(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Fire-and-forget: the workflow researches, drafts, critiques, rewrites,
    // and persists a `pending` issue on its own. It survives restarts/deploys.
    const run = await start(generateNewsletterWorkflow, [getAgentInput()]);
    return NextResponse.json({ ok: true, runId: run.runId });
  } catch (error) {
    console.error("[cron][draft] failed:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

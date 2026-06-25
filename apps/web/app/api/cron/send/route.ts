import { runSendCycle } from "@newsletter/agent";
import { NextResponse } from "next/server";

import { verifyCron } from "@/server/cron";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

async function handle(request: Request) {
  if (!verifyCron(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await runSendCycle();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron][send] failed:", error);
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

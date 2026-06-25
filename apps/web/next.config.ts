import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@newsletter/config",
    "@newsletter/db",
    "@newsletter/ui",
    "@newsletter/agent",
  ],
  // These packages use Node built-ins / dynamic require (nodemailer, postgres)
  // or are runtimes meant to execute on the server (the Workflow DevKit). Keep
  // them external so Next/Turbopack doesn't try to bundle them into collected
  // chunks — they resolve from node_modules at runtime.
  serverExternalPackages: [
    "nodemailer",
    "postgres",
    "workflow",
    "@workflow/core",
    "@ai-sdk/workflow",
    "@ai-sdk/gateway",
    "@vercel/queue",
  ],
};

// `withWorkflow` enables the `"use workflow"` / `"use step"` directives used by
// the durable newsletter-generation workflow.
export default withWorkflow(config);

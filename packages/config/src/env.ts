import { z } from "zod";

const serverSchema = z.object({
  AUTH_SECRET: z.string().optional(),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  TOTP_SECRET: z.string(),
  ADMIN_EMAIL: z.string().email(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string(),

  // Secret used to authenticate Vercel Cron requests (sent as `authorization`
  // header from the dashboard, or compared against vercel-cron signature).
  CRON_SECRET: z.string(),

  // AI Gateway — single key for every model + hosted web search.
  AI_GATEWAY_API_KEY: z.string(),

  // The newsletter's niche/topic. The agent researches current news in this area.
  AGENT_NICHE: z.string(),

  // `creator/model` id as shown on https://vercel.com/ai-gateway/models.
  AGENT_MODEL: z.string().default("anthropic/claude-sonnet-4-5"),
  AGENT_TONE: z.string().optional(),
  AGENT_AUDIENCE: z.string().optional(),
  // How many critique -> rewrite passes before the draft is accepted as-is.
  AGENT_MAX_REVISIONS: z.coerce.number().int().min(0).max(10).default(3),
  // Critique score (1-10) at/above which a draft is considered approved.
  AGENT_SCORE_THRESHOLD: z.coerce.number().int().min(1).max(10).default(8),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

function parseEnv<T extends z.ZodType>(schema: T, prefix: string = ""): z.infer<T> {
  const result = schema.safeParse(
    Object.fromEntries(
      Object.entries(process.env)
        .filter(([key]) => (prefix ? key.startsWith(prefix) : !key.startsWith("NEXT_PUBLIC_")))
        .map(([key, value]) => [key, value]),
    ),
  );
  if (!result.success) {
    console.error(
      `Environment validation failed (${prefix || "server"}):`,
      result.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }
  return result.data as z.infer<T>;
}

const server = parseEnv(serverSchema);
const client = parseEnv(clientSchema, "NEXT_PUBLIC_");

export const env = {
  ...server,
  ...client,
  isDev: server.NODE_ENV === "development",
  isProd: server.NODE_ENV === "production",
  isTest: server.NODE_ENV === "test",
} satisfies ServerEnv & ClientEnv & { isDev: boolean; isProd: boolean; isTest: boolean };

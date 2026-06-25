import { z } from "zod";

const serverSchema = z.object({
  AUTH_SECRET: z.string().optional(),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  TOTP_SECRET: z.string(),
  ADMIN_EMAIL: z.string().email(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string(),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

function parseEnv<T extends z.ZodType>(
  schema: T,
  prefix: string = "",
): z.infer<T> {
  const result = schema.safeParse(
    Object.fromEntries(
      Object.entries(process.env)
        .filter(([key]) =>
          prefix ? key.startsWith(prefix) : !key.startsWith("NEXT_PUBLIC_")
        )
        .map(([key, value]) => [key.replace(prefix, ""), value]),
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

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof serverSchema> {}
  }
}

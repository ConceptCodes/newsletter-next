import { type Config } from "drizzle-kit";
import { env } from "@newsletter/config";

export default {
  schema: "./src/schema.ts",
  out: "../../drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["newsletter_*"],
} satisfies Config;

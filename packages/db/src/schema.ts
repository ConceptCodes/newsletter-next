import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `newsletter_${name}`);

export const ISSUE_STATUSES = ["pending", "approved", "sent", "rejected"] as const;
export type IssueStatus = (typeof ISSUE_STATUSES)[number];

export type NewsletterSource = {
  title: string;
  url: string;
};

export const issues = createTable(
  "issues",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    title: varchar("title", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(() => new Date()),
    content: text("content").notNull(),
    sources: jsonb("sources").$type<NewsletterSource[]>().default([]).notNull(),
    // pending  = drafted by the agent, awaiting admin review
    // approved = admin approved; will be sent on the next send-cron tick
    // sent     = delivered to subscribers
    // rejected = discarded by the admin
    status: varchar("status", { length: 32 }).$type<IssueStatus>().default("pending").notNull(),
    published: timestamp("published", { withTimezone: true }),
  },
  (example) => ({
    titleIndex: index("title_idx").on(example.title),
    statusIndex: index("status_idx").on(example.status),
  }),
);

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export type User = typeof users.$inferSelect;

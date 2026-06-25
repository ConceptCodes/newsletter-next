import { env } from "@newsletter/config";
import { db } from "@newsletter/db";
import { and, eq, isNull } from "drizzle-orm";
import { issues, type Issue, type NewsletterSource, users } from "@newsletter/db/schema";
import { marked } from "marked";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | undefined;

export function getMailer(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: Number(env.SMTP_PORT) === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

function renderSources(sources: NewsletterSource[]): string {
  if (!sources.length) return "";
  const items = sources
    .map((s) => `<li><a href="${escapeHtml(s.url)}">${escapeHtml(s.title)}</a></li>`)
    .join("");
  return `<hr/><h3>Sources</h3><ol>${items}</ol>`;
}

export function renderIssueEmail(
  issue: Pick<Issue, "title" | "content" | "sources">,
): RenderedEmail {
  const title = issue.title ?? "New issue";
  const bodyHtml = marked.parse(issue.content, { async: false }) as string;
  const sourcesHtml = renderSources(issue.sources ?? []);
  const html = [
    `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;line-height:1.6">`,
    `<h1 style="font-size:24px;margin:0 0 16px">${escapeHtml(title)}</h1>`,
    bodyHtml,
    sourcesHtml,
    `<hr/><p style="font-size:12px;color:#888">You're receiving this because you subscribed to ${escapeHtml(
      env.NEXT_PUBLIC_APP_NAME,
    )}. <a href="${escapeHtml(env.NEXT_PUBLIC_APP_URL ?? "#")}">Unsubscribe</a>.</p>`,
    `</body></html>`,
  ].join("");

  const text = `${title}\n\n${issue.content}\n\nSources:\n${(issue.sources ?? [])
    .map((s) => `- ${s.title} — ${s.url}`)
    .join("\n")}`;

  return { subject: title, html, text };
}

export async function sendIssueToSubscribers(issue: Issue): Promise<{ sent: number }> {
  const subscribers = await db.select({ email: users.email }).from(users);
  if (subscribers.length === 0) return { sent: 0 };

  const { subject, html, text } = renderIssueEmail(issue);

  // BCC keeps the subscriber list private; one message is far cheaper on the
  // SMTP provider (e.g. Resend) than one per recipient.
  await getMailer().sendMail({
    from: env.SMTP_FROM,
    bcc: subscribers.map((s) => s.email),
    subject,
    html,
    text,
  });

  await db
    .update(issues)
    .set({ status: "sent", published: new Date() })
    .where(eq(issues.id, issue.id));

  return { sent: subscribers.length };
}

export async function sendSingleIssue(issueId: number): Promise<{ sent: number }> {
  const [issue] = await db.select().from(issues).where(eq(issues.id, issueId));
  if (!issue) throw new Error(`Issue ${issueId} not found`);
  return sendIssueToSubscribers(issue);
}

/**
 * Send cycle: deliver every issue the admin has approved but not yet sent.
 * Invoked by a daily Vercel Cron (`/api/cron/send`) so that the moment an admin
 * approves an issue in the dashboard, it ships on the next tick.
 */
export async function runSendCycle(): Promise<{ sent: number; issues: number }> {
  const ready = await db
    .select()
    .from(issues)
    .where(and(eq(issues.status, "approved"), isNull(issues.published)));

  let totalSent = 0;
  for (const issue of ready) {
    const { sent } = await sendIssueToSubscribers(issue);
    totalSent += sent;
  }

  console.info(`[pipeline][send] sent ${totalSent} emails across ${ready.length} issue(s)`);
  return { sent: totalSent, issues: ready.length };
}

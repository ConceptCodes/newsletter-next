import { env } from "@newsletter/config";

/**
 * Vercel Cron invocations are authenticated with a shared bearer token. Set the
 * same `CRON_SECRET` in the cron job's Authorization header (Vercel dashboard)
 * and in your environment. The dashboard "Generate" button goes through tRPC
 * instead, so these routes are only ever hit by the scheduler.
 */
export function verifyCron(request: Request): boolean {
  if (!env.CRON_SECRET) return false;
  const header = request.headers.get("authorization");
  if (header === `Bearer ${env.CRON_SECRET}`) return true;
  // Convenience for local `curl` testing and for setups that pass the secret in
  // the URL configured via the Vercel dashboard.
  const secret = new URL(request.url).searchParams.get("secret");
  return secret === env.CRON_SECRET;
}

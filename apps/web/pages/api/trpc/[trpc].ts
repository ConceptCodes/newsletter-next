import { createNextApiHandler } from "@trpc/server/adapters/next";

import { env } from "@newsletter/config";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

// The `issue.generate` mutation runs the full agent pipeline (several minutes).
// Allow it to run long on Vercel (requires a Pro+ plan).
export const config = {
  maxDuration: 300,
};

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error }) => {
          console.error(`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`);
        }
      : undefined,
});

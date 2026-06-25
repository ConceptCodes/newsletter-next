import { userRouter } from "@/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { issueRouter } from "@/server/api/routers/issue";

export const appRouter = createTRPCRouter({
  user: userRouter,
  issue: issueRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);

import type { inferRouterOutputs } from "@trpc/server";

import { authRouter } from "./router/auth";
import { usersRouter } from "./router/users";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.auth.getSecretMessage();
 *       ^? string
 */
export const createCaller = createCallerFactory(appRouter);

export type RouterOutput = inferRouterOutputs<AppRouter>;

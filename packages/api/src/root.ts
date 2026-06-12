import type { inferRouterOutputs } from "@trpc/server";

import { authRouter } from "./router/auth";
import { rbacRouter } from "./router/rbac";
import { rolesRouter } from "./router/roles";
import { usersRouter } from "./router/users";
import { createCallerFactory, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  rbac: rbacRouter,
  roles: rolesRouter,
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

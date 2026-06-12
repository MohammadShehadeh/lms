import { PERMISSION_GROUPS } from "@nucleus/db/rbac";
import type { TRPCRouterRecord } from "@trpc/server";
import { requirePermission } from "../trpc";

export const rbacRouter = {
  /** The full permission catalog, grouped by resource — powers the role editor. */
  catalog: requirePermission("role:read").query(() => PERMISSION_GROUPS),
} satisfies TRPCRouterRecord;

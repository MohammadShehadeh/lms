import { randomUUID } from "node:crypto";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import {
  ALL_PERMISSION_KEYS,
  type PermissionKey,
  type StoredPermission,
} from "../rbac/permissions";

/** Zod schema for a single permission key, validated against the code catalog. */
export const permissionKeySchema = z.enum(
  ALL_PERMISSION_KEYS as [PermissionKey, ...PermissionKey[]]
);

export const role = pgTable("role", (t) => ({
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: t.text().notNull().unique(),
  // Stable key for referencing system roles in code/seeds (e.g. "super_admin").
  slug: t.text().notNull().unique(),
  description: t.text(),
  // Subset of the code-defined permission catalog this role grants.
  // `["*"]` (super admin) grants everything.
  permissions: t.text().array().$type<StoredPermission[]>().notNull().default([]),
  // Built-in roles that must not be deleted or structurally edited.
  isSystem: t.boolean().notNull().default(false),
  // The role assigned to new users on signup. Exactly one role should be default.
  isDefault: t.boolean().notNull().default(false),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => new Date()),
}));

export const roleInsertSchema = createInsertSchema(role, {
  permissions: z.array(permissionKeySchema),
});
export const roleSelectSchema = createSelectSchema(role);

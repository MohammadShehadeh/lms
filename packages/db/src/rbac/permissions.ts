/**
 * RBAC permission catalog — the single source of truth for every grantable
 * permission in the system.
 *
 * Roles (rows in the `role` table) store a subset of these keys. Authorization
 * is always checked by key (`resource:action`), never by role name, so adding a
 * new role never requires touching call sites. Grant new access by editing this
 * file; everything downstream (Zod validation, the role editor UI, middleware)
 * derives from it.
 */

export const PERMISSIONS = {
  user: ["list", "read", "update", "assign-role"],
  role: ["create", "read", "update", "delete"],
} as const;

export type Resource = keyof typeof PERMISSIONS;

/**
 * Wildcard granting every permission. Held by the seeded `super_admin` role so
 * the super admin always passes checks without enumerating the full catalog.
 */
export const WILDCARD_PERMISSION = "*" as const;

type PermissionKeyFor<R extends Resource> = `${R}:${(typeof PERMISSIONS)[R][number]}`;

/** Flattened `resource:action` union, e.g. "role:create" | "course:publish". */
export type PermissionKey = { [R in Resource]: PermissionKeyFor<R> }[Resource];

/**
 * A value persisted in a role's `permissions` column: a catalog key, or the
 * wildcard (super admin only). API writes are restricted to catalog keys; the
 * wildcard is set only by the seed.
 */
export type StoredPermission = PermissionKey | typeof WILDCARD_PERMISSION;

/** Every permission key, flattened. Useful for validation and seeding. */
export const ALL_PERMISSION_KEYS = Object.entries(PERMISSIONS).flatMap(([resource, actions]) =>
  actions.map((action) => `${resource}:${action}`)
) as PermissionKey[];

export interface PermissionGroup {
  resource: Resource;
  permissions: PermissionKey[];
}

/** The catalog grouped by resource — consumed by the role-editor UI. */
export const PERMISSION_GROUPS: PermissionGroup[] = Object.entries(PERMISSIONS).map(
  ([resource, actions]) => ({
    resource: resource as Resource,
    permissions: actions.map((action) => `${resource}:${action}` as PermissionKey),
  })
);

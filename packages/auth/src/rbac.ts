import { Redis } from "@nucleus/cache";
import { eq } from "@nucleus/db";
import { db } from "@nucleus/db/client";
import { roleCacheKey, SUPER_ADMIN_SLUG } from "@nucleus/db/rbac";
import { role, user } from "@nucleus/db/schema";

/** How long a role's permissions stay cached. Edits invalidate eagerly (see api). */
const ROLE_CACHE_TTL_SECONDS = 600;

/** A user's effective role + permissions, injected into the session. */
export interface UserRbac {
  roleId: string | null;
  roleName: string | null;
  roleSlug: string | null;
  permissions: string[];
}

const EMPTY_RBAC: UserRbac = {
  roleId: null,
  roleName: null,
  roleSlug: null,
  permissions: [],
};

/** Reads a single role's RBAC fields straight from the database. */
async function loadRoleRbac(roleId: string): Promise<UserRbac> {
  const [row] = await db
    .select({
      roleId: role.id,
      roleName: role.name,
      roleSlug: role.slug,
      permissions: role.permissions,
    })
    .from(role)
    .where(eq(role.id, roleId))
    .limit(1);

  if (!row) return EMPTY_RBAC;
  return { ...row, permissions: row.permissions ?? [] };
}

/**
 * Loads a user's role + effective permissions for session enrichment, keyed by
 * `roleId` (passed from better-auth's user object via the `roleId` additional
 * field, so no extra user query is needed). Cached in Redis and shared across
 * all users with the same role; `wrapWithCache` collapses concurrent misses.
 */
export async function loadUserRbac(roleId: string | null): Promise<UserRbac> {
  if (!roleId) return EMPTY_RBAC;
  return Redis.getInstance().wrapWithCache(() => loadRoleRbac(roleId), {
    key: roleCacheKey(roleId),
    ttl: ROLE_CACHE_TTL_SECONDS,
  });
}

/**
 * Resolves the role a new user should receive: super_admin if their email is
 * configured as such, otherwise the role flagged `isDefault`.
 */
async function resolveSignupRoleId(
  email: string,
  superAdminEmails: string[]
): Promise<string | null> {
  if (superAdminEmails.includes(email.trim().toLowerCase())) {
    const [superAdmin] = await db
      .select({ id: role.id })
      .from(role)
      .where(eq(role.slug, SUPER_ADMIN_SLUG))
      .limit(1);
    if (superAdmin) return superAdmin.id;
  }

  const [defaultRole] = await db
    .select({ id: role.id })
    .from(role)
    .where(eq(role.isDefault, true))
    .limit(1);

  return defaultRole?.id ?? null;
}

/** Assigns the appropriate role to a freshly created user (signup hook). */
export async function assignSignupRole(
  userId: string,
  email: string,
  superAdminEmails: string[]
): Promise<void> {
  const roleId = await resolveSignupRoleId(email, superAdminEmails);
  if (roleId) {
    await db.update(user).set({ roleId }).where(eq(user.id, userId));
  }
}

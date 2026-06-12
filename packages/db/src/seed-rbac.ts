import { inArray } from "drizzle-orm";
import { db } from "./client";
import {
  DEFAULT_ROLE_SLUG,
  type PermissionKey,
  SUPER_ADMIN_SLUG,
  WILDCARD_PERMISSION,
} from "./rbac";
import { role, user } from "./schema";

/**
 * Seeds the built-in RBAC roles and (optionally) promotes the users listed in
 * SUPER_ADMIN_EMAILS to super admin. Idempotent — safe to run repeatedly.
 *
 * Run with: `pnpm -F @nucleus/db seed`
 */

/**
 * Permissions granted to every new user via the default role. Members get
 * authenticated access with no administrative capabilities; widen as needed.
 */
const MEMBER_PERMISSIONS: PermissionKey[] = [];

async function seed() {
  // 1. Super admin — wildcard access, never the signup default.
  const [superAdmin] = await db
    .insert(role)
    .values({
      name: "Super Admin",
      slug: SUPER_ADMIN_SLUG,
      description: "Full, unrestricted access to every resource.",
      permissions: [WILDCARD_PERMISSION],
      isSystem: true,
      isDefault: false,
    })
    .onConflictDoUpdate({
      target: role.slug,
      set: { permissions: [WILDCARD_PERMISSION], isSystem: true },
    })
    .returning();

  // 2. Default member role — assigned to new signups.
  await db
    .insert(role)
    .values({
      name: "Member",
      slug: DEFAULT_ROLE_SLUG,
      description: "Default role for new users.",
      permissions: MEMBER_PERMISSIONS,
      isSystem: true,
      isDefault: true,
    })
    .onConflictDoUpdate({
      target: role.slug,
      set: { isSystem: true, isDefault: true },
    });

  console.info("✓ Seeded system roles: super_admin, member");

  // 3. Promote configured super-admin emails (better-auth stores emails lowercased).
  const emails = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (emails.length > 0 && superAdmin) {
    const promoted = await db
      .update(user)
      .set({ roleId: superAdmin.id })
      .where(inArray(user.email, emails))
      .returning({ email: user.email });

    console.info(
      `✓ Promoted ${promoted.length} user(s) to super_admin: ${
        promoted.map((p) => p.email).join(", ") || "(none matched yet)"
      }`
    );
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("RBAC seed failed:", error);
    process.exit(1);
  });

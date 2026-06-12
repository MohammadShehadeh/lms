import type { PermissionKey } from "./permissions";
import { WILDCARD_PERMISSION } from "./permissions";

/**
 * Pure permission checks. No DB or server imports, so these are safe to use in
 * tRPC middleware, the Next.js proxy, RSCs, and the client alike.
 *
 * `granted` is a role's effective permission keys (or `["*"]` for super admin).
 */

export function hasPermission(granted: readonly string[], required: PermissionKey): boolean {
  return granted.includes(WILDCARD_PERMISSION) || granted.includes(required);
}

export function hasAllPermissions(
  granted: readonly string[],
  required: readonly PermissionKey[]
): boolean {
  if (granted.includes(WILDCARD_PERMISSION)) return true;
  return required.every((permission) => granted.includes(permission));
}

export function hasAnyPermission(
  granted: readonly string[],
  required: readonly PermissionKey[]
): boolean {
  if (granted.includes(WILDCARD_PERMISSION)) return true;
  return required.some((permission) => granted.includes(permission));
}

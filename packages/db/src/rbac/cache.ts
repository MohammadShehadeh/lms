/**
 * Redis key for a cached role's effective permissions. Written/read during
 * session enrichment (auth) and invalidated when a role changes (api), so both
 * sides must agree on the format — hence it lives here in the shared rbac module.
 */
export function roleCacheKey(roleId: string): string {
  return `rbac:role:${roleId}`;
}

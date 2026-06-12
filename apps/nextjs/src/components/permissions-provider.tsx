"use client";

import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  type PermissionKey,
} from "@nucleus/db/rbac";
import { createContext, type ReactNode, useContext } from "react";

const PermissionsContext = createContext<string[]>([]);

interface PermissionsProviderProps {
  permissions: string[];
  children: ReactNode;
}

/** Seeds the current user's effective permissions (from the session) to the client tree. */
export function PermissionsProvider({ permissions, children }: PermissionsProviderProps) {
  return <PermissionsContext.Provider value={permissions}>{children}</PermissionsContext.Provider>;
}

export function usePermissions() {
  const permissions = useContext(PermissionsContext);
  return {
    permissions,
    can: (permission: PermissionKey) => hasPermission(permissions, permission),
    canAll: (required: PermissionKey[]) => hasAllPermissions(permissions, required),
    canAny: (required: PermissionKey[]) => hasAnyPermission(permissions, required),
  };
}

interface CanProps {
  permission?: PermissionKey;
  anyOf?: PermissionKey[];
  allOf?: PermissionKey[];
  fallback?: ReactNode;
  children: ReactNode;
}

/** Renders children only when the user satisfies the given permission(s). */
export function Can({ permission, anyOf, allOf, fallback = null, children }: CanProps) {
  const { can, canAny, canAll } = usePermissions();

  let allowed = true;

  if (permission) allowed = can(permission);
  else if (anyOf) allowed = canAny(anyOf);
  else if (allOf) allowed = canAll(allOf);

  return <>{allowed ? children : fallback}</>;
}

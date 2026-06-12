import type { PermissionKey } from "@nucleus/db/rbac";

// Define routes that require authentication
export const protectedRoutes = ["/dashboard"];

// Define routes that are only accessible when not authenticated
export const authRoutes = ["/register", "/login", "/reset-password"];

// Routes that additionally require a specific permission. Checked after the
// authentication gate; an authenticated user lacking the permission is bounced
// back to the dashboard.
export const routePermissions: { prefix: string; permission: PermissionKey }[] = [
  { prefix: "/dashboard/roles", permission: "role:read" },
  { prefix: "/dashboard/users", permission: "user:list" },
];

import { describe, expect, it } from "vitest";
import { hasAllPermissions, hasAnyPermission, hasPermission } from "./check";
import { WILDCARD_PERMISSION } from "./permissions";

describe("hasPermission", () => {
  it("returns true when the exact permission is granted", () => {
    expect(hasPermission(["role:read"], "role:read")).toBe(true);
  });

  it("returns false when the permission is missing", () => {
    expect(hasPermission(["role:read"], "role:create")).toBe(false);
  });

  it("returns true for any permission when the wildcard is granted", () => {
    expect(hasPermission([WILDCARD_PERMISSION], "user:assign-role")).toBe(true);
  });

  it("returns false for an empty grant list", () => {
    expect(hasPermission([], "role:read")).toBe(false);
  });
});

describe("hasAllPermissions", () => {
  it("requires every permission to be present", () => {
    expect(hasAllPermissions(["role:read", "role:create"], ["role:read", "role:create"])).toBe(
      true
    );
    expect(hasAllPermissions(["role:read"], ["role:read", "role:create"])).toBe(false);
  });

  it("passes with the wildcard regardless of the required set", () => {
    expect(hasAllPermissions([WILDCARD_PERMISSION], ["role:read", "user:list"])).toBe(true);
  });

  it("returns true for an empty required set", () => {
    expect(hasAllPermissions([], [])).toBe(true);
  });
});

describe("hasAnyPermission", () => {
  it("passes when at least one permission matches", () => {
    expect(hasAnyPermission(["user:list"], ["role:read", "user:list"])).toBe(true);
  });

  it("fails when none match", () => {
    expect(hasAnyPermission(["user:read"], ["role:read", "user:list"])).toBe(false);
  });

  it("passes with the wildcard", () => {
    expect(hasAnyPermission([WILDCARD_PERMISSION], ["role:delete"])).toBe(true);
  });
});

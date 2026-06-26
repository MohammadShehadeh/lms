import { describe, expect, it } from "vitest";
import {
  ALL_PERMISSION_KEYS,
  PERMISSION_GROUPS,
  PERMISSIONS,
  WILDCARD_PERMISSION,
} from "./permissions";

describe("permission catalog", () => {
  it("flattens every resource:action into ALL_PERMISSION_KEYS", () => {
    const expected = Object.entries(PERMISSIONS).flatMap(([resource, actions]) =>
      actions.map((action) => `${resource}:${action}`)
    );
    expect([...ALL_PERMISSION_KEYS].sort()).toEqual(expected.sort());
  });

  it("does not include the wildcard in the catalog", () => {
    expect(ALL_PERMISSION_KEYS).not.toContain(WILDCARD_PERMISSION);
  });

  it("contains no duplicate keys", () => {
    expect(new Set(ALL_PERMISSION_KEYS).size).toBe(ALL_PERMISSION_KEYS.length);
  });

  it("groups every permission by resource", () => {
    const totalGrouped = PERMISSION_GROUPS.reduce(
      (sum, group) => sum + group.permissions.length,
      0
    );
    expect(totalGrouped).toBe(ALL_PERMISSION_KEYS.length);
    expect(PERMISSION_GROUPS.map((group) => group.resource).sort()).toEqual(
      Object.keys(PERMISSIONS).sort()
    );
  });
});

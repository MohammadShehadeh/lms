import { randomUUID } from "node:crypto";
import { Redis } from "@nucleus/cache";
import { roleCacheKey, SUPER_ADMIN_SLUG } from "@nucleus/db/rbac";
import { permissionKeySchema, role } from "@nucleus/db/schema";
import { checkPostgresErrorCode, takeFirstOrNull } from "@nucleus/db/utils";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, asc, count, desc, eq, ilike, ne, or } from "drizzle-orm";
import { z } from "zod/v4";
import { assertCanGrant, requirePermission } from "../trpc";

/** Drops a role's cached permissions so the next session read reflects the change. */
function invalidateRoleCache(roleId: string) {
  return Redis.getInstance().del(roleCacheKey(roleId));
}

const sortSchema = z.array(
  z.object({
    id: z.string(),
    desc: z.boolean(),
  })
);

const sortableColumns = {
  name: role.name,
  createdAt: role.createdAt,
} as const;

const createRoleInput = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  permissions: z.array(permissionKeySchema).default([]),
});

const updateRoleInput = z.object({
  id: z.string(),
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).nullish(),
  permissions: z.array(permissionKeySchema).optional(),
});

/** Derives a stable slug from a role name (e.g. "Course Author" -> "course_author"). */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export const rolesRouter = {
  list: requirePermission("role:read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(50).default(10),
        sort: sortSchema.optional(),
        // column filters
        name: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, sort } = input;
      const offset = (page - 1) * perPage;

      const where = and(input.name ? ilike(role.name, `%${input.name}%`) : undefined);

      const orderBy = sort?.length
        ? sort
            .filter((s) => s.id in sortableColumns)
            .map((s) => {
              const column = sortableColumns[s.id as keyof typeof sortableColumns];
              return s.desc ? desc(column) : asc(column);
            })
        : [desc(role.createdAt)];

      const [data, total] = await Promise.all([
        ctx.db
          .select()
          .from(role)
          .where(where)
          .orderBy(...orderBy)
          .limit(perPage)
          .offset(offset),
        ctx.db.select({ count: count() }).from(role).where(where),
      ]);

      return {
        data,
        pageCount: Math.ceil((total[0]?.count ?? 0) / perPage),
      };
    }),

  /** Lightweight role list for the user role-assignment picker. */
  options: requirePermission("user:assign-role").query(({ ctx }) => {
    return ctx.db
      .select({ id: role.id, name: role.name, isDefault: role.isDefault })
      .from(role)
      .orderBy(asc(role.name));
  }),

  byId: requirePermission("role:read")
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return takeFirstOrNull(await ctx.db.select().from(role).where(eq(role.id, input.id)));
    }),

  create: requirePermission("role:create")
    .input(createRoleInput)
    .mutation(async ({ ctx, input }) => {
      assertCanGrant(ctx.session.user.permissions ?? [], input.permissions);

      // Names without latin characters (e.g. non-English) slugify to empty, so
      // fall back to a generated slug — only system roles need a meaningful one.
      const slug = slugify(input.name) || `role-${randomUUID().slice(0, 8)}`;

      const existing = takeFirstOrNull(
        await ctx.db
          .select({ id: role.id })
          .from(role)
          .where(or(eq(role.name, input.name), eq(role.slug, slug)))
      );
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A role with a similar name already exists.",
        });
      }

      try {
        return takeFirstOrNull(
          await ctx.db
            .insert(role)
            .values({
              name: input.name,
              slug,
              description: input.description,
              permissions: input.permissions,
            })
            .returning()
        );
      } catch (error) {
        // A concurrent create that passed the pre-check above still trips the
        // unique index — surface it as CONFLICT rather than a raw 500.
        if (checkPostgresErrorCode(error, "unique_violation")) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A role with a similar name already exists.",
          });
        }
        throw error;
      }
    }),

  update: requirePermission("role:update")
    .input(updateRoleInput)
    .mutation(async ({ ctx, input }) => {
      const existing = takeFirstOrNull(
        await ctx.db.select().from(role).where(eq(role.id, input.id))
      );
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      }
      // The super admin role is wildcard-based and must never be reshaped via the API.
      if (existing.slug === SUPER_ADMIN_SLUG) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "The super admin role cannot be modified.",
        });
      }
      if (existing.isSystem && input.name && input.name !== existing.name) {
        throw new TRPCError({ code: "FORBIDDEN", message: "System role names cannot be changed." });
      }
      if (input.permissions) {
        assertCanGrant(ctx.session.user.permissions ?? [], input.permissions);
      }

      const updated = takeFirstOrNull(
        await ctx.db
          .update(role)
          .set({
            name: input.name,
            description: input.description,
            permissions: input.permissions,
          })
          .where(eq(role.id, input.id))
          .returning()
      );
      await invalidateRoleCache(input.id);
      return updated;
    }),

  delete: requirePermission("role:delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = takeFirstOrNull(
        await ctx.db.select().from(role).where(eq(role.id, input.id))
      );
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      }
      if (existing.isSystem) {
        throw new TRPCError({ code: "FORBIDDEN", message: "System roles cannot be deleted." });
      }
      // A deleted default would leave new signups with no role (no permissions).
      if (existing.isDefault) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Set another role as default before deleting this one.",
        });
      }
      // Users holding this role have their role_id nulled via the FK (ON DELETE SET NULL).
      await ctx.db.delete(role).where(eq(role.id, input.id));
      await invalidateRoleCache(input.id);
      return { success: true };
    }),

  /** Marks a role as the one assigned to new signups (exactly one default). */
  setDefault: requirePermission("role:update")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const target = takeFirstOrNull(await ctx.db.select().from(role).where(eq(role.id, input.id)));
      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      }
      if (target.slug === SUPER_ADMIN_SLUG) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "The super admin role cannot be the default.",
        });
      }

      await ctx.db.transaction(async (tx) => {
        await tx.update(role).set({ isDefault: false }).where(ne(role.id, input.id));
        await tx.update(role).set({ isDefault: true }).where(eq(role.id, input.id));
      });
      return { success: true };
    }),
} satisfies TRPCRouterRecord;

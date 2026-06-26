import { SUPER_ADMIN_SLUG } from "@nucleus/db/rbac";
import { role, user, userInsertSchema, userSelectSchema } from "@nucleus/db/schema";
import { takeFirstOrNull } from "@nucleus/db/utils";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { z } from "zod/v4";
import { assertCanGrant, requirePermission } from "../trpc";

const sortSchema = z.array(
  z.object({
    id: z.string(),
    desc: z.boolean(),
  })
);

const sortableColumns = {
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
} as const;

export const usersRouter = {
  getById: requirePermission("user:read")
    .input(userSelectSchema.pick({ id: true }))
    .query(async ({ ctx, input }) => {
      return takeFirstOrNull(
        await ctx.db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            roleId: user.roleId,
            roleName: role.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })
          .from(user)
          .leftJoin(role, eq(user.roleId, role.id))
          .where(eq(user.id, input.id))
      );
    }),

  list: requirePermission("user:list")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(50).default(10),
        sort: sortSchema.optional(),
        // column filters
        name: z.string().optional(),
        email: z.string().optional(),
        emailVerified: z.array(z.string()).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, sort } = input;
      const offset = (page - 1) * perPage;

      const where = and(
        input.name ? ilike(user.name, `%${input.name}%`) : undefined,
        input.email ? ilike(user.email, `%${input.email}%`) : undefined,
        input.emailVerified && input.emailVerified.length > 0
          ? inArray(
              user.emailVerified,
              input.emailVerified.map((v) => v === "true")
            )
          : undefined
      );

      const orderBy = sort?.length
        ? sort
            .filter((s) => s.id in sortableColumns)
            .map((s) => {
              const column = sortableColumns[s.id as keyof typeof sortableColumns];
              return s.desc ? desc(column) : asc(column);
            })
        : [desc(user.createdAt)];

      const [data, total] = await Promise.all([
        ctx.db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            roleId: user.roleId,
            roleName: role.name,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })
          .from(user)
          .leftJoin(role, eq(user.roleId, role.id))
          .where(where)
          .orderBy(...orderBy)
          .limit(perPage)
          .offset(offset),
        ctx.db.select({ count: count() }).from(user).where(where),
      ]);

      return {
        data,
        pageCount: Math.ceil((total[0]?.count ?? 0) / perPage),
      };
    }),

  update: requirePermission("user:update")
    .input(userInsertSchema.pick({ id: true, email: true, name: true }))
    .mutation(async ({ ctx, input }) => {
      return takeFirstOrNull(
        await ctx.db
          .update(user)
          .set({ email: input.email, name: input.name })
          .where(eq(user.id, input.id))
          .returning()
      );
    }),

  setRole: requirePermission("user:assign-role")
    .input(z.object({ userId: z.string(), roleId: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      if (input.roleId) {
        const target = takeFirstOrNull(
          await ctx.db
            .select({ id: role.id, slug: role.slug, permissions: role.permissions })
            .from(role)
            .where(eq(role.id, input.roleId))
        );
        if (!target) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
        }
        // The wildcard super admin role can only be granted via the seed/bootstrap.
        if (target.slug === SUPER_ADMIN_SLUG) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "The super admin role cannot be assigned.",
          });
        }

        assertCanGrant(ctx.session.user.permissions ?? [], target.permissions ?? []);
      }

      return takeFirstOrNull(
        await ctx.db
          .update(user)
          .set({ roleId: input.roleId })
          .where(eq(user.id, input.userId))
          .returning({ id: user.id, roleId: user.roleId })
      );
    }),
} satisfies TRPCRouterRecord;

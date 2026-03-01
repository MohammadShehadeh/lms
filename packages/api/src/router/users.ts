import { user, userInsertSchema, userSelectSchema } from "@nucleus/db/schema";
import { takeFirstOrNull } from "@nucleus/db/utils";
import type { TRPCRouterRecord } from "@trpc/server";
import { and, asc, count, desc, eq, ilike, inArray } from "drizzle-orm";
import { z } from "zod/v4";
import { protectedProcedure } from "../trpc";

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
  getById: protectedProcedure
    .input(userSelectSchema.pick({ id: true }))
    .query(async ({ ctx, input }) => {
      return takeFirstOrNull(await ctx.db.select().from(user).where(eq(user.id, input.id)));
    }),

  list: protectedProcedure
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
          .select()
          .from(user)
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

  update: protectedProcedure
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
} satisfies TRPCRouterRecord;

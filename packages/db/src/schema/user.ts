import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { role } from "./rbac";

export const user = pgTable("user", (t) => ({
  id: t.text().primaryKey(),
  name: t.text().notNull(),
  email: t.text().notNull().unique(),
  emailVerified: t.boolean().notNull(),
  image: t.text(),
  roleId: t.text().references(() => role.id, { onDelete: "set null" }),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => new Date()),
}));

export const userInsertSchema = createInsertSchema(user);
export const userSelectSchema = createSelectSchema(user);

export const session = pgTable("session", (t) => ({
  id: t.text().primaryKey(),
  expiresAt: t.timestamp().notNull(),
  token: t.text().notNull().unique(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => new Date()),
  ipAddress: t.text(),
  userAgent: t.text(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
}));

export const sessionInsertSchema = createInsertSchema(session);
export const sessionSelectSchema = createSelectSchema(session);

export const account = pgTable("account", (t) => ({
  id: t.text().primaryKey(),
  accountId: t.text().notNull(),
  providerId: t.text().notNull(),
  userId: t
    .text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: t.text(),
  refreshToken: t.text(),
  idToken: t.text(),
  accessTokenExpiresAt: t.timestamp(),
  refreshTokenExpiresAt: t.timestamp(),
  scope: t.text(),
  password: t.text(),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => new Date()),
}));

export const accountInsertSchema = createInsertSchema(account);
export const accountSelectSchema = createSelectSchema(account);

export const verification = pgTable("verification", (t) => ({
  id: t.text().primaryKey(),
  identifier: t.text().notNull(),
  value: t.text().notNull(),
  expiresAt: t.timestamp().notNull(),
  createdAt: t.timestamp().defaultNow(),
  updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => new Date()),
}));

export const verificationInsertSchema = createInsertSchema(verification);
export const verificationSelectSchema = createSelectSchema(verification);

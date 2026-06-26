import { randomUUID } from "node:crypto";
import { pgTable } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

interface MediaMetadata {
  size: number;
  mimeType: string;
  [key: string]: unknown;
}

export const mediaLibrary = pgTable("mediaLibrary", (t) => ({
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  name: t.text().notNull().unique(),
  metadata: t.jsonb().$type<MediaMetadata>().notNull(),
  slug: t.text().notNull().unique(),
  description: t.text(),
  isDefault: t.boolean().notNull().default(false),
  createdAt: t.timestamp().notNull().defaultNow(),
  updatedAt: t.timestamp({ mode: "date", withTimezone: true }).$onUpdateFn(() => new Date()),
}));

export const mediaLibraryInsertSchema = createInsertSchema(mediaLibrary);
export const mediaLibrarySelectSchema = createSelectSchema(mediaLibrary);

import { relations } from "drizzle-orm";

import { role } from "../rbac";
import { user } from "../user";

export const roleRelations = relations(role, ({ many }) => ({
  users: many(user),
}));

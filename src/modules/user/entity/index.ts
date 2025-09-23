import { index, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { createTable } from "@/db/extras/db.utils";

export const user = createTable(
  "user",
  {
    id: serial("id").primaryKey(),
  },
  (table) => [index().on(table.id)]
);

export const userRelations = relations(user, ({ many, one }) => ({}));

export type UserTableType = InferSelectModel<typeof user>;


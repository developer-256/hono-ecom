import { index, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { createTable } from "@/db/extras/db.utils";

export const auth = createTable(
  "auth",
  {
    id: serial("id").primaryKey(),
  },
  (table) => [index().on(table.id)]
);

export const authRelations = relations(auth, ({ many, one }) => ({}));

export type AuthTableType = InferSelectModel<typeof auth>;


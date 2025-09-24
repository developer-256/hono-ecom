import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("user").notNull(), // Role-based authentication field
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// User relations (extend auth relations if needed)
export const userRelations = relations(user, ({ many, one }) => ({}));

// Export user type
export type UserTableType = InferSelectModel<typeof user>;

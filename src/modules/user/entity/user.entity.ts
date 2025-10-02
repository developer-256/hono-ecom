import { relations } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { DEFAULT_ROLE } from "@/modules/auth/entity/role.enum";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default(DEFAULT_ROLE).notNull(), // Role-based authentication field
  banned: boolean("banned").default(false), // Better Auth admin plugin field
  banReason: text("ban_reason"), // Better Auth admin plugin field
  banExpires: timestamp("ban_expires"), // Better Auth admin plugin field
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

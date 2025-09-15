import { pgTableCreator } from "drizzle-orm/pg-core";

export const table_filter = "hono_";
export const createTable = pgTableCreator((name) => `${table_filter}${name}`);

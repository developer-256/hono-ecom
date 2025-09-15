import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import env from "../env";
import postgres from "postgres";

const conn = postgres(env.DATABASE_URL);

/**
 * @todo remove logger
 */
export const db = drizzle(conn, { schema, logger: true });
export type dbType = typeof db;

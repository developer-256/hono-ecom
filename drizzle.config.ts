import type { Config } from "drizzle-kit";
import env from "./src/env";
import { table_filter } from "./src/db/extras/db.utils";

export default {
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: [table_filter],
} satisfies Config;

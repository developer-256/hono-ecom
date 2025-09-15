import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { z } from "zod";

expand(config());

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(9999),
  DATABASE_URL: z.string(),
  RESEND_API_KEY: z.string().nonempty(),

  // Sentry Configuration
  SENTRY_ENABLED: z.coerce.boolean().default(false),
  SENTRY_DSN: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  // NOTE: SENTRY_PROFILES_SAMPLE_RATE removed due to Bun compatibility issues
  // The @sentry/profiling-node package uses libuv functions not supported by Bun
  SENTRY_ENABLE_LOGS: z.coerce.boolean().default(true),
});

export type env = z.infer<typeof EnvSchema>;

// biome-ignore lint/nursery/noProcessEnv: <only place in app where this is used>
const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(z.prettifyError(error));
  process.exit(1);
}

// biome-ignore lint/style/noNonNullAssertion: <we know it is present bcz we have thrown error otherwise>
export default env!;

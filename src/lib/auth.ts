import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import env from "@/env";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // Enable email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  // User configuration with custom fields
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: true,
      },
    },
  },

  // Advanced configuration
  advanced: {
    // Cookie configuration for cross-origin requests
    cookies: {
      sessionToken: {
        attributes: {
          sameSite: "lax",
          secure: env.NODE_ENV === "production",
          httpOnly: true,
        },
      },
    },
  },

  // Email configuration using Resend
  emailVerification: {
    sendOnSignUp: false, // Set to true if you want email verification
    sendEmailVerificationOnEmailChange: false,
  },

  // Rate limiting
  rateLimit: {
    window: 60, // 1 minute
    max: 100, // 100 requests per minute
  },
});

// Export types for client-side usage
export type Session = typeof auth.$Infer.Session;

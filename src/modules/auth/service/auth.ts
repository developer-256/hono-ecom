import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import env from "@/env";
import {
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
} from "@/modules/mailer";
import { HONO_LOGGER } from "@/lib/core/hono-logger";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  // Debug logging
  logger: {
    level: "debug",
  },

  // Social providers configuration
  socialProviders:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},

  // Enable email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Enable email verification
  },

  // Email verification configuration - use default better-auth behavior
  // Better-auth uses JWT tokens for email verification by default

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

  // Email configuration using mailer module
  emailVerification: {
    sendVerificationEmail: async (
      data: { user: any; url: string; token: string },
      request?: Request
    ) => {
      await sendEmailVerificationEmail(
        data.user.email,
        data.url,
        data.user.name
      );
    },

    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 6, // 6 hours in seconds

    afterEmailVerification: async (user, req) => {
      HONO_LOGGER.sentry.captureMessage(
        "User email verified successfully",
        "info",
        {
          userId: user.id,
          email: user.email,
          name: user.name,
          verifiedAt: new Date().toISOString(),
          userAgent: req?.headers?.get("user-agent"),
          ipAddress:
            req?.headers?.get("x-forwarded-for") ||
            req?.headers?.get("x-real-ip"),
        }
      );

      HONO_LOGGER.info("User email verified successfully", {
        userId: user.id,
        email: user.email,
        name: user.name,
      });
    },
  },

  // Password reset configuration using mailer module
  forgetPassword: {
    sendResetPassword: async (
      data: { user: any; url: string; token: string },
      request?: Request
    ) => {
      await sendPasswordResetEmail(data.user.email, data.url);
    },
  },

  // Rate limiting
  rateLimit: {
    window: 60, // 1 minute
    max: 100, // 100 requests per minute
  },
});

// Export types for client-side usage
export type Session = typeof auth.$Infer.Session;

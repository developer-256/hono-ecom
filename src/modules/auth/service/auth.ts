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
    sendVerificationEmail: async (
      data: { user: any; url: string; token: string },
      request?: Request
    ) => {
      // Configure email sending via Resend
      const { Resend } = await import("resend");
      const resend = new Resend(env.RESEND_API_KEY);

      const { data: response, error } = await resend.emails.send({
        from: "noreply@yourapp.com", // Replace with your domain
        to: data.user.email,
        subject: "Verify your email address",
        html: `
            <div>
              <h2>Verify your email address</h2>
              <p>Click the link below to verify your email address:</p>
              <a href="${data.url}">Verify Email</a>
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          `,
      });
    },
  },

  // Password reset configuration
  forgetPassword: {
    sendResetPassword: async (
      data: { user: any; url: string; token: string },
      request?: Request
    ) => {
      const { Resend } = await import("resend");
      const resend = new Resend(env.RESEND_API_KEY);

      await resend.emails.send({
        from: "noreply@yourapp.com", // Replace with your domain
        to: data.user.email,
        subject: "Reset your password",
        html: `
          <div>
            <h2>Reset your password</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${data.url}">Reset Password</a>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
        `,
      });
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

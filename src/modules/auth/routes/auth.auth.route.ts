import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { moduleTags } from "../../module.tags";
import { APISchema } from "@/lib/schemas/api-schemas";
import { HTTP } from "@/lib/http/status-codes";
import { HONO_RESPONSE, HONO_ERROR } from "@/lib/utils";
import { optionalAuthMiddleware } from "@/lib/middlewares/auth.middleware";

// Sign up schema
const SignUpSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

// Sign in schema
const SignInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Password reset request schema
const ForgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

// Reset password schema
const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Email verification schema
const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// Resend verification email schema
const ResendVerificationSchema = z.object({
  email: z.email("Invalid email address"),
});

// ============ SIGN UP ROUTE ============
export const POST_SignUp_Route = createRoute({
  path: "/auth/sign-up",
  method: "post",
  tags: moduleTags.auth,
  summary: "Sign up with email and password",
  description: "Create a new user account with email verification",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignUpSchema,
        },
      },
    },
  },
  responses: {
    [HTTP.CREATED]: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z.object({
              user: z.object({
                id: z.string(),
                email: z.string(),
                name: z.string(),
                emailVerified: z.boolean(),
              }),
            }),
          }),
        },
      },
    },
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.CONFLICT]: APISchema.CONFLICT,
    [HTTP.UNPROCESSABLE_ENTITY]: APISchema.UNPROCESSABLE_ENTITY,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const POST_SignUp_Handler: RouteHandler<
  typeof POST_SignUp_Route
> = async (c) => {
  try {
    const { email, password, name } = c.req.valid("json");

    const { auth } = await import("@/modules/auth/service/auth.service");

    const result = await auth.api.signUpEmail({
      headers: c.req.raw.headers,
      body: {
        email,
        password,
        name,
      },
    });

    if (!result) {
      return c.json(
        HONO_ERROR("BAD_REQUEST", "Failed to create account", {
          issues: [{ message: "Sign up failed" }],
        }),
        HTTP.BAD_REQUEST
      );
    }

    return c.json(
      HONO_RESPONSE({
        message:
          "Account created successfully. Please check your email for verification.",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            emailVerified: result.user.emailVerified,
          },
        },
      }),
      HTTP.CREATED
    );
  } catch (error: any) {
    if (
      error.message?.includes("already exists") ||
      error.message?.includes("duplicate")
    ) {
      return c.json(
        HONO_ERROR("CONFLICT", "Account already exists", {
          issues: [{ message: "An account with this email already exists" }],
        }),
        HTTP.CONFLICT
      );
    }

    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to create account", {
        issues: [
          {
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        ],
      }),
      HTTP.INTERNAL_SERVER_ERROR
    );
  }
};

// ============ SIGN IN ROUTE ============
export const POST_SignIn_Route = createRoute({
  path: "/auth/sign-in",
  method: "post",
  tags: moduleTags.auth,
  summary: "Sign in with email and password",
  description: "Authenticate user with email and password",
  request: {
    body: {
      content: {
        "application/json": {
          schema: SignInSchema,
        },
      },
    },
  },
  responses: {
    [HTTP.OK]: {
      description: "Sign in successful",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z.object({
              user: z.object({
                id: z.string(),
                email: z.string(),
                name: z.string(),
                emailVerified: z.boolean(),
                role: z.string(),
              }),
              session: z.object({
                id: z.string(),
                userId: z.string(),
                expiresAt: z.string(),
              }),
            }),
          }),
        },
      },
    },
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.UNAUTHORIZED]: APISchema.UNAUTHORIZED,
    [HTTP.UNPROCESSABLE_ENTITY]: APISchema.UNPROCESSABLE_ENTITY,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const POST_SignIn_Handler: RouteHandler<
  typeof POST_SignIn_Route
> = async (c) => {
  try {
    const { email, password } = c.req.valid("json");

    const { auth } = await import("@/modules/auth/service/auth.service");

    const result = await auth.api.signInEmail({
      headers: c.req.raw.headers,
      body: {
        email,
        password,
      },
    });

    if (!result) {
      return c.json(
        HONO_ERROR("UNAUTHORIZED", "Invalid credentials", {
          issues: [{ message: "Email or password is incorrect" }],
        }),
        HTTP.UNAUTHORIZED
      );
    }

    return c.json(
      HONO_RESPONSE({
        message: "Sign in successful",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            emailVerified: result.user.emailVerified,
            role: (result.user as any).role || "user",
          },
          session: {
            id: (result as any).session?.id || "",
            userId: (result as any).session?.userId || result.user.id,
            expiresAt:
              (result as any).session?.expiresAt?.toISOString() ||
              new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      }),
      HTTP.OK
    );
  } catch (error: any) {
    if (
      error.message?.includes("Invalid credentials") ||
      error.message?.includes("Unauthorized")
    ) {
      return c.json(
        HONO_ERROR("UNAUTHORIZED", "Invalid credentials", {
          issues: [{ message: "Email or password is incorrect" }],
        }),
        HTTP.UNAUTHORIZED
      );
    }

    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to sign in", {
        issues: [
          {
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        ],
      }),
      HTTP.INTERNAL_SERVER_ERROR
    );
  }
};

// ============ GOOGLE SIGN IN ROUTE ============
export const GET_GoogleSignIn_Route = createRoute({
  path: "/auth/google",
  method: "get",
  tags: moduleTags.auth,
  summary: "Sign in with Google",
  description: "Initiate Google OAuth sign in flow",
  responses: {
    [HTTP.MOVED_TEMPORARILY]: {
      description: "Redirect to Google OAuth",
    },
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const GET_GoogleSignIn_Handler: RouteHandler<
  typeof GET_GoogleSignIn_Route
> = async (c) => {
  try {
    const { auth } = await import("@/modules/auth/service/auth.service");

    const result = await auth.api.signInSocial({
      headers: c.req.raw.headers,
      body: {
        provider: "google",
        callbackURL: `${process.env.BETTER_AUTH_URL}/auth/callback/google`,
      },
    });

    // Handle redirect response
    if (result && typeof result === "object" && "url" in result) {
      return c.redirect(result.url as string, HTTP.MOVED_TEMPORARILY);
    }

    return result as any;
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to initiate Google sign in", {
        issues: [
          {
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        ],
      }),
      HTTP.INTERNAL_SERVER_ERROR
    );
  }
};

// ============ SIGN OUT ROUTE ============
export const POST_SignOut_Route = createRoute({
  path: "/auth/sign-out",
  method: "post",
  tags: moduleTags.auth,
  summary: "Sign out user",
  description: "Sign out the current user and invalidate session",
  responses: {
    [HTTP.OK]: {
      description: "Sign out successful",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
          }),
        },
      },
    },
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const POST_SignOut_Handler: RouteHandler<
  typeof POST_SignOut_Route
> = async (c) => {
  try {
    const { auth } = await import("@/modules/auth/service/auth.service");

    await auth.api.signOut({
      headers: c.req.raw.headers,
    });

    return c.json(
      HONO_RESPONSE({
        message: "Sign out successful",
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to sign out", {
        issues: [
          {
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        ],
      }),
      HTTP.INTERNAL_SERVER_ERROR
    );
  }
};

// ============ FORGOT PASSWORD ROUTE ============
export const POST_ForgotPassword_Route = createRoute({
  path: "/auth/forgot-password",
  method: "post",
  tags: moduleTags.auth,
  summary: "Request password reset",
  description: "Send password reset email to user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ForgotPasswordSchema,
        },
      },
    },
  },
  responses: {
    [HTTP.OK]: {
      description: "Password reset email sent",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
          }),
        },
      },
    },
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.UNPROCESSABLE_ENTITY]: APISchema.UNPROCESSABLE_ENTITY,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const POST_ForgotPassword_Handler: RouteHandler<
  typeof POST_ForgotPassword_Route
> = async (c) => {
  try {
    const { email } = c.req.valid("json");

    const { auth } = await import("@/modules/auth/service/auth.service");

    await auth.api.forgetPassword({
      headers: c.req.raw.headers,
      body: {
        email,
        redirectTo: `${process.env.BETTER_AUTH_URL}/auth/reset-password`,
      },
    });

    return c.json(
      HONO_RESPONSE({
        message:
          "If an account with this email exists, a password reset link has been sent.",
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR(
        "INTERNAL_SERVER_ERROR",
        "Failed to send password reset email",
        {
          issues: [
            {
              message:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          ],
        }
      ),
      HTTP.INTERNAL_SERVER_ERROR
    );
  }
};

// ============ RESET PASSWORD ROUTE ============
export const POST_ResetPassword_Route = createRoute({
  path: "/auth/reset-password",
  method: "post",
  tags: moduleTags.auth,
  summary: "Reset password",
  description: "Reset user password with reset token",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResetPasswordSchema,
        },
      },
    },
  },
  responses: {
    [HTTP.OK]: {
      description: "Password reset successful",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
          }),
        },
      },
    },
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.UNAUTHORIZED]: APISchema.UNAUTHORIZED,
    [HTTP.UNPROCESSABLE_ENTITY]: APISchema.UNPROCESSABLE_ENTITY,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const POST_ResetPassword_Handler: RouteHandler<
  typeof POST_ResetPassword_Route
> = async (c) => {
  try {
    const { token, password } = c.req.valid("json");

    const { auth } = await import("@/modules/auth/service/auth.service");

    const result = await auth.api.resetPassword({
      headers: c.req.raw.headers,
      body: {
        token,
        newPassword: password,
      },
    });

    if (!result) {
      return c.json(
        HONO_ERROR("BAD_REQUEST", "Invalid or expired reset token", {
          issues: [{ message: "The reset token is invalid or has expired" }],
        }),
        HTTP.BAD_REQUEST
      );
    }

    return c.json(
      HONO_RESPONSE({
        message:
          "Password reset successful. You can now sign in with your new password.",
      }),
      HTTP.OK
    );
  } catch (error: any) {
    if (
      error.message?.includes("Invalid token") ||
      error.message?.includes("expired")
    ) {
      return c.json(
        HONO_ERROR("BAD_REQUEST", "Invalid or expired reset token", {
          issues: [{ message: "The reset token is invalid or has expired" }],
        }),
        HTTP.BAD_REQUEST
      );
    }

    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to reset password", {
        issues: [
          {
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        ],
      }),
      HTTP.INTERNAL_SERVER_ERROR
    );
  }
};

// ============ VERIFY EMAIL ROUTE ============
export const POST_VerifyEmail_Route = createRoute({
  path: "/auth/verify-email",
  method: "post",
  tags: moduleTags.auth,
  summary: "Verify email address",
  description: "Verify user email with verification token",
  request: {
    body: {
      content: {
        "application/json": {
          schema: VerifyEmailSchema,
        },
      },
    },
  },
  responses: {
    [HTTP.OK]: {
      description: "Email verification successful",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z.object({ callbackURL: z.string() }),
          }),
        },
      },
    },
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.UNPROCESSABLE_ENTITY]: APISchema.UNPROCESSABLE_ENTITY,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const POST_VerifyEmail_Handler: RouteHandler<
  typeof POST_VerifyEmail_Route
> = async (c) => {
  try {
    const { token: rawToken } = c.req.valid("json");

    // Parse token to remove callbackURL if present
    const token = rawToken.includes("&callbackURL=")
      ? rawToken.split("&callbackURL=")[0]
      : rawToken;

    const { auth } = await import("@/modules/auth/service/auth.service");

    const result = await auth.api.verifyEmail({
      headers: c.req.raw.headers,
      query: {
        token,
      },
    });

    if (!result) {
      return c.json(
        HONO_ERROR("BAD_REQUEST", "Invalid or expired verification token", {
          issues: [
            { message: "The verification token is invalid or has expired" },
          ],
        }),
        HTTP.BAD_REQUEST
      );
    }

    return c.json(
      HONO_RESPONSE({
        message: "Email verification successful. Your account is now verified.",
        data: {
          callbackURL: rawToken.includes("&callbackURL=")
            ? rawToken.split("&callbackURL=")[1]
            : "/",
        },
      }),
      HTTP.OK
    );
  } catch (error: any) {
    if (
      error.message?.includes("Invalid token") ||
      error.message?.includes("expired")
    ) {
      return c.json(
        HONO_ERROR("BAD_REQUEST", "Invalid or expired verification token", {
          issues: [
            { message: "The verification token is invalid or has expired" },
          ],
        }),
        HTTP.BAD_REQUEST
      );
    }

    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to verify email", {
        issues: [
          {
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        ],
      }),
      HTTP.INTERNAL_SERVER_ERROR
    );
  }
};

// ============ RESEND VERIFICATION EMAIL ROUTE ============
export const POST_ResendVerification_Route = createRoute({
  path: "/auth/resend-verification",
  method: "post",
  tags: moduleTags.auth,
  summary: "Resend verification email",
  description: "Resend email verification link to user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: ResendVerificationSchema,
        },
      },
    },
  },
  responses: {
    [HTTP.OK]: {
      description: "Verification email sent",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
          }),
        },
      },
    },
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.UNPROCESSABLE_ENTITY]: APISchema.UNPROCESSABLE_ENTITY,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const POST_ResendVerification_Handler: RouteHandler<
  typeof POST_ResendVerification_Route
> = async (c) => {
  try {
    const { email } = c.req.valid("json");

    const { auth } = await import("@/modules/auth/service/auth.service");

    await auth.api.sendVerificationEmail({
      headers: c.req.raw.headers,
      body: {
        email,
      },
    });

    return c.json(
      HONO_RESPONSE({
        message: "Verification email sent. Please check your inbox.",
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to send verification email", {
        issues: [
          {
            message:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
        ],
      }),
      HTTP.INTERNAL_SERVER_ERROR
    );
  }
};

// Export all auth routes (all public routes)
export const authRoutes = [
  {
    route: POST_SignUp_Route,
    handler: POST_SignUp_Handler,
    middleware: [],
  },
  {
    route: POST_SignIn_Route,
    handler: POST_SignIn_Handler,
    middleware: [],
  },
  {
    route: GET_GoogleSignIn_Route,
    handler: GET_GoogleSignIn_Handler,
    middleware: [],
  },
  {
    route: POST_SignOut_Route,
    handler: POST_SignOut_Handler,
    middleware: [optionalAuthMiddleware], // Optional auth for sign out
  },
  {
    route: POST_ForgotPassword_Route,
    handler: POST_ForgotPassword_Handler,
    middleware: [],
  },
  {
    route: POST_ResetPassword_Route,
    handler: POST_ResetPassword_Handler,
    middleware: [],
  },
  {
    route: POST_VerifyEmail_Route,
    handler: POST_VerifyEmail_Handler,
    middleware: [],
  },
  {
    route: POST_ResendVerification_Route,
    handler: POST_ResendVerification_Handler,
    middleware: [],
  },
];

import { HTTP } from "@/lib/http/status-codes";
import { APISchema } from "@/lib/schemas/api-schemas";
import { moduleTags } from "@/modules/module.tags";
import { createRoute, RouteHandler } from "@hono/zod-openapi";
import z from "zod";
import { Roles } from "../service/permissions";
import { HONO_ERROR, HONO_RESPONSE } from "@/lib/utils";
import { authClient } from "../service/auth-client";

/**
 * @todo
 * 
 * 💻 4. Frontend flow
// Step 1: Collect info
const formData = {
  email: "user@example.com",
  name: "Ali",
  image: "https://example.com/pic.png",
  callbackURL: "https://myapp.com/dashboard",
};

// Step 2: Request OTP
await authClient.emailOtp.sendVerificationOtp({
  email: formData.email,
  type: "sign-in",
});

// Step 3: User enters OTP
await authClient.signIn.emailOtp({
  email: formData.email,
  otp: "123456",
});

// Step 4: Once signed in, send extra info to backend
await fetch("/api/auth/save-user-info", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: formData.name,
    image: formData.image,
    callbackURL: formData.callbackURL,
  }),
});

// Step 5 (optional): Redirect
window.location.href = formData.callbackURL;
 */

// Sign up schema
export const SignUpSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  // role: z
  //   .enum([
  //     Role.CUSTOMER,
  //     Role.VENDOR,
  //     Role.CONTENT_EDITOR,
  //     Role.SALES_MANAGER,
  //   ] as const)
  //   .default(Role.CUSTOMER)
  //   .describe("User role - defaults to customer"),
  callbackURL: z
    .url("Invalid callback URL")
    .optional()
    .describe("URL to redirect after successful signup"),
  image: z.url("Invalid image URL").optional().describe("Profile image URL"),
  rememberMe: z
    .boolean()
    .optional()
    .default(false)
    .describe("Remember user session"),
});

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
                role: z.string().describe("User role"),
                emailVerified: z.boolean(),
                callbackURL: z.string().optional(),
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
    const { email, password, name, callbackURL, image, rememberMe } =
      c.req.valid("json");

    const { auth } = await import("@/modules/auth/service/auth");

    const otp = "asfd";
    // const something = auth.api.signInEmailOTP({
    //   headers: c.req.raw.headers,
    //   body: { email, otp },
    // });
    const somethign = authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });

    const result = await auth.api.signUpEmail({
      headers: c.req.raw.headers,
      body: {
        email,
        password,
        name,
        callbackURL,
        image,
        rememberMe,
        role: Roles.DEFAULT,
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
            role: (result.user as any).role || Roles.DEFAULT,
            emailVerified: result.user.emailVerified,
            callbackURL,
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
        error,
      }),
      HTTP.INTERNAL_SERVER_ERROR
    );
  }
};

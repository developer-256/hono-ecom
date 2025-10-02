import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { moduleTags } from "../../module.tags";
import { APISchema } from "@/lib/schemas/api-schemas";
import { HTTP } from "@/lib/http/status-codes";
import { HONO_RESPONSE, HONO_ERROR } from "@/lib/utils";
import {
  authMiddleware,
  optionalAuthMiddleware,
  AuthUser,
} from "@/lib/middlewares/auth.middleware";

// Get user profile route
export const GET_Profile_Route = createRoute({
  path: "/profile",
  method: "get",
  tags: moduleTags.user,
  summary: "Get user profile",
  description: "Retrieve the authenticated user's profile information",
  responses: {
    [HTTP.OK]: {
      description: "Profile retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z.object({
              user: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                emailVerified: z.boolean(),
                image: z.string().optional(),
                createdAt: z.string(),
                updatedAt: z.string(),
              }),
            }),
          }),
        },
      },
    },
    [HTTP.UNAUTHORIZED]: APISchema.UNAUTHORIZED,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const GET_Profile_Handler: RouteHandler<
  typeof GET_Profile_Route
> = async (c) => {
  try {
    const user = c.get("user") as AuthUser;

    return c.json(
      HONO_RESPONSE({
        message: "Profile retrieved successfully",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image || undefined,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          },
        },
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to retrieve profile", {
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

// Update profile schema
const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  image: z.string().url("Invalid image URL").optional(),
});

// Update user profile route
export const PATCH_Profile_Route = createRoute({
  path: "/profile",
  method: "patch",
  tags: moduleTags.user,
  summary: "Update user profile",
  description: "Update the authenticated user's profile information",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateProfileSchema,
        },
      },
    },
  },
  responses: {
    [HTTP.OK]: {
      description: "Profile updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z.object({
              user: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                emailVerified: z.boolean(),
                image: z.string().optional(),
                createdAt: z.string(),
                updatedAt: z.string(),
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

export const PATCH_Profile_Handler: RouteHandler<
  typeof PATCH_Profile_Route
> = async (c) => {
  try {
    const updateData = c.req.valid("json");
    const user = c.get("user") as AuthUser;

    // Import UserService for direct database updates
    const UserService = await import("../service/user.service");

    const updatedUser = await UserService.default.updateUser(
      user.id,
      updateData
    );

    if (!updatedUser) {
      return c.json(
        HONO_ERROR("BAD_REQUEST", "Failed to update profile", {
          issues: [{ message: "Profile update failed" }],
        }),
        HTTP.BAD_REQUEST
      );
    }

    return c.json(
      HONO_RESPONSE({
        message: "Profile updated successfully",
        data: {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            emailVerified: updatedUser.emailVerified,
            image: updatedUser.image || undefined,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
          },
        },
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to update profile", {
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

// Profile routes with middleware
export const profileRoutes = [
  {
    route: GET_Profile_Route,
    handler: GET_Profile_Handler,
    middleware: [authMiddleware],
  },
  {
    route: PATCH_Profile_Route,
    handler: PATCH_Profile_Handler,
    middleware: [authMiddleware],
  },
];

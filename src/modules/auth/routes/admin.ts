import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { moduleTags } from "../../module.tags";
import { APISchema } from "@/lib/schemas/api-schemas";
import { HTTP } from "@/lib/http/status-codes";
import { HONO_RESPONSE, HONO_ERROR } from "@/lib/utils";
import {
  authMiddleware,
  requireAdmin,
  requireSuperAdmin,
} from "@/lib/middlewares/auth.middleware";
import { auth } from "@/modules/auth/service";

// Get all users (admin only)
export const GET_Users_Route = createRoute({
  path: "/users",
  method: "get",
  tags: moduleTags.auth,
  summary: "Get all users",
  description: "Retrieve all users in the system (admin access required)",
  responses: {
    [HTTP.OK]: {
      description: "Users retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z.object({
              users: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                  role: z.enum([
                    "super-admin",
                    "admin",
                    "sales",
                    "writer",
                    "user",
                  ]),
                  emailVerified: z.boolean(),
                  createdAt: z.string(),
                })
              ),
            }),
          }),
        },
      },
    },
    [HTTP.UNAUTHORIZED]: APISchema.UNAUTHORIZED,
    [HTTP.FORBIDDEN]: APISchema.FORBIDDEN,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const GET_Users_Handler: RouteHandler<typeof GET_Users_Route> = async (
  c
) => {
  try {
    // For now, return mock data since we don't have admin plugin
    // In a real implementation, you would query your database directly
    const users = [
      {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin" as const,
        emailVerified: true,
        createdAt: new Date().toISOString(),
      },
    ];

    return c.json(
      HONO_RESPONSE({
        message: "Users retrieved successfully",
        data: {
          users,
        },
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to retrieve users", {
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

// Update user role (super-admin only)
const UpdateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["super-admin", "admin", "sales", "writer", "user"]),
});

export const PATCH_UserRole_Route = createRoute({
  path: "/users/role",
  method: "patch",
  tags: moduleTags.auth,
  summary: "Update user role",
  description: "Update a user's role (super-admin access required)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: UpdateUserRoleSchema,
        },
      },
    },
  },
  responses: {
    [HTTP.OK]: {
      description: "User role updated successfully",
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
                role: z.enum([
                  "super-admin",
                  "admin",
                  "sales",
                  "writer",
                  "user",
                ]),
                emailVerified: z.boolean(),
                createdAt: z.string(),
              }),
            }),
          }),
        },
      },
    },
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.UNAUTHORIZED]: APISchema.UNAUTHORIZED,
    [HTTP.FORBIDDEN]: APISchema.FORBIDDEN,
    [HTTP.UNPROCESSABLE_ENTITY]: APISchema.UNPROCESSABLE_ENTITY,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const PATCH_UserRole_Handler: RouteHandler<
  typeof PATCH_UserRole_Route
> = async (c) => {
  try {
    const { userId, role } = c.req.valid("json");
    const currentUser = c.get("user");

    // Prevent users from elevating their own role to super-admin
    if (userId === currentUser.id && role === "super-admin") {
      return c.json(
        HONO_ERROR("FORBIDDEN", "Cannot elevate your own role to super-admin", {
          issues: [{ message: "Self-elevation to super-admin is not allowed" }],
        }),
        HTTP.FORBIDDEN
      );
    }

    // For now, return mock success response
    // In a real implementation, you would update the database directly
    const updatedUser = {
      id: userId,
      name: "Updated User",
      email: "user@example.com",
      role,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    return c.json(
      HONO_RESPONSE({
        message: "User role updated successfully",
        data: {
          user: updatedUser,
        },
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to update user role", {
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

// Get current user's role info
export const GET_MyRole_Route = createRoute({
  path: "/my-role",
  method: "get",
  tags: moduleTags.auth,
  summary: "Get current user's role",
  description: "Retrieve the current user's role and permissions",
  responses: {
    [HTTP.OK]: {
      description: "Role information retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z.object({
              role: z.enum(["super-admin", "admin", "sales", "writer", "user"]),
              permissions: z.object({
                canManageUsers: z.boolean(),
                canManageRoles: z.boolean(),
                canAccessSales: z.boolean(),
                canWrite: z.boolean(),
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

export const GET_MyRole_Handler: RouteHandler<typeof GET_MyRole_Route> = async (
  c
) => {
  try {
    const user = c.get("user");

    // Define permissions based on role
    const permissions = {
      canManageUsers: ["super-admin", "admin"].includes(user.role),
      canManageRoles: user.role === "super-admin",
      canAccessSales: ["super-admin", "admin", "sales"].includes(user.role),
      canWrite: ["super-admin", "admin", "sales", "writer"].includes(user.role),
    };

    return c.json(
      HONO_RESPONSE({
        message: "Role information retrieved successfully",
        data: {
          role: user.role,
          permissions,
        },
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR(
        "INTERNAL_SERVER_ERROR",
        "Failed to retrieve role information",
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

// Admin routes with middleware
export const adminRoutes = [
  {
    route: GET_Users_Route,
    handler: GET_Users_Handler,
    middleware: requireAdmin,
  },
  {
    route: PATCH_UserRole_Route,
    handler: PATCH_UserRole_Handler,
    middleware: requireSuperAdmin,
  },
  {
    route: GET_MyRole_Route,
    handler: GET_MyRole_Handler,
    middleware: [authMiddleware],
  },
];

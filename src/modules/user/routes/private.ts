import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { moduleTags } from "../../module.tags";
import { APISchema } from "@/lib/schemas/api-schemas";
import { HTTP } from "@/lib/http/status-codes";
import { HONO_RESPONSE, HONO_ERROR } from "@/lib/utils";
import {
  authMiddleware,
  requireAdmin,
  requireSuperAdmin,
  AuthUser,
} from "@/lib/middlewares/auth.middleware";
import UserService from "../service";

// Update profile schema
const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  image: z.string().url("Invalid image URL").optional(),
});

// Admin user update schema
const AdminUpdateUserSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  role: z.enum(["super-admin", "admin", "sales", "writer", "user"]).optional(),
  image: z.string().url("Invalid image URL").optional(),
});

// User query filters schema
const UserFiltersSchema = z.object({
  role: z.string().optional(),
  emailVerified: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// ============ GET CURRENT USER PROFILE ROUTE ============
export const GET_Profile_Route = createRoute({
  path: "/user/profile",
  method: "get",
  tags: moduleTags.user,
  summary: "Get current user profile",
  description: "Retrieve the authenticated user's complete profile information",
  responses: {
    [HTTP.OK]: {
      description: "Profile retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z
              .object({
                user: z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                  emailVerified: z.boolean(),
                  image: z.string().nullable().optional(),
                  role: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              })
              .optional(),
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
            role: user.role,
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

// ============ UPDATE CURRENT USER PROFILE ROUTE ============
export const PATCH_Profile_Route = createRoute({
  path: "/user/profile",
  method: "patch",
  tags: moduleTags.user,
  summary: "Update current user profile",
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
            data: z
              .object({
                user: z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                  emailVerified: z.boolean(),
                  image: z.string().nullable().optional(),
                  role: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              })
              .optional(),
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

    // Update user using UserService instead of Better Auth directly
    const updatedUser = await UserService.updateUser(user.id, updateData);

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
            role: updatedUser.role,
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

// ============ DELETE CURRENT USER ACCOUNT ROUTE ============
export const DELETE_Account_Route = createRoute({
  path: "/user/account",
  method: "delete",
  tags: moduleTags.user,
  summary: "Delete current user account",
  description: "Permanently delete the authenticated user's account",
  responses: {
    [HTTP.OK]: {
      description: "Account deleted successfully",
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
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const DELETE_Account_Handler: RouteHandler<
  typeof DELETE_Account_Route
> = async (c) => {
  try {
    const user = c.get("user") as AuthUser;

    const deleted = await UserService.deleteUser(user.id);

    if (!deleted) {
      return c.json(
        HONO_ERROR("BAD_REQUEST", "Failed to delete account", {
          issues: [{ message: "Account deletion failed" }],
        }),
        HTTP.BAD_REQUEST
      );
    }

    return c.json(
      HONO_RESPONSE({
        message: "Account deleted successfully",
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to delete account", {
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

// ============ ADMIN: GET ALL USERS ROUTE ============
export const GET_Users_Route = createRoute({
  path: "/user/admin/users",
  method: "get",
  tags: moduleTags.user,
  summary: "Get all users (Admin only)",
  description: "Retrieve a paginated list of all users with optional filters",
  request: {
    query: UserFiltersSchema,
  },
  responses: {
    [HTTP.OK]: {
      description: "Users retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z
              .object({
                users: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                    email: z.string(),
                    emailVerified: z.boolean(),
                    image: z.string().nullable().optional(),
                    role: z.string(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                  })
                ),
                pagination: z.object({
                  page: z.number(),
                  limit: z.number(),
                  total: z.number(),
                  totalPages: z.number(),
                }),
              })
              .optional(),
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
    const filters = c.req.valid("query");
    const { page, limit, ...userFilters } = filters;
    const offset = (page - 1) * limit;

    const { users, total } = await UserService.getUsers(
      userFilters,
      limit,
      offset
    );

    const totalPages = Math.ceil(total / limit);

    return c.json(
      HONO_RESPONSE({
        message: "Users retrieved successfully",
        data: {
          users: users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image || undefined,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
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

// ============ ADMIN: GET USER BY ID ROUTE ============
export const GET_UserById_Route = createRoute({
  path: "/user/admin/{userId}",
  method: "get",
  tags: moduleTags.user,
  summary: "Get user by ID (Admin only)",
  description: "Retrieve complete information about a specific user",
  request: {
    params: z.object({
      userId: z.string().min(1, "User ID is required"),
    }),
  },
  responses: {
    [HTTP.OK]: {
      description: "User retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z
              .object({
                user: z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                  emailVerified: z.boolean(),
                  image: z.string().nullable().optional(),
                  role: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              })
              .optional(),
          }),
        },
      },
    },
    [HTTP.NOT_FOUND]: APISchema.NOT_FOUND,
    [HTTP.UNAUTHORIZED]: APISchema.UNAUTHORIZED,
    [HTTP.FORBIDDEN]: APISchema.FORBIDDEN,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const GET_UserById_Handler: RouteHandler<
  typeof GET_UserById_Route
> = async (c) => {
  try {
    const { userId } = c.req.valid("param");

    const user = await UserService.getUserById(userId);

    if (!user) {
      return c.json(
        HONO_ERROR("NOT_FOUND", "User not found", {
          issues: [{ message: "No user found with the provided ID" }],
        }),
        HTTP.NOT_FOUND
      );
    }

    return c.json(
      HONO_RESPONSE({
        message: "User retrieved successfully",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image || undefined,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          },
        },
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to retrieve user", {
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

// ============ ADMIN: UPDATE USER ROUTE ============
export const PATCH_User_Route = createRoute({
  path: "/user/admin/{userId}",
  method: "patch",
  tags: moduleTags.user,
  summary: "Update user (Admin only)",
  description: "Update any user's information including role changes",
  request: {
    params: z.object({
      userId: z.string().min(1, "User ID is required"),
    }),
    body: {
      content: {
        "application/json": {
          schema: AdminUpdateUserSchema,
        },
      },
    },
  },
  responses: {
    [HTTP.OK]: {
      description: "User updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z
              .object({
                user: z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                  emailVerified: z.boolean(),
                  image: z.string().nullable().optional(),
                  role: z.string(),
                  createdAt: z.string(),
                  updatedAt: z.string(),
                }),
              })
              .optional(),
          }),
        },
      },
    },
    [HTTP.NOT_FOUND]: APISchema.NOT_FOUND,
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.UNAUTHORIZED]: APISchema.UNAUTHORIZED,
    [HTTP.FORBIDDEN]: APISchema.FORBIDDEN,
    [HTTP.UNPROCESSABLE_ENTITY]: APISchema.UNPROCESSABLE_ENTITY,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const PATCH_User_Handler: RouteHandler<typeof PATCH_User_Route> = async (
  c
) => {
  try {
    const { userId } = c.req.valid("param");
    const updateData = c.req.valid("json");
    const currentUser = c.get("user") as AuthUser;

    // Prevent self-role modification by non-super-admins
    if (
      userId === currentUser.id &&
      updateData.role &&
      currentUser.role !== "super-admin"
    ) {
      return c.json(
        HONO_ERROR("FORBIDDEN", "Cannot modify your own role", {
          issues: [{ message: "You cannot change your own role" }],
        }),
        HTTP.FORBIDDEN
      );
    }

    const updatedUser = await UserService.updateUser(userId, updateData);

    if (!updatedUser) {
      return c.json(
        HONO_ERROR("NOT_FOUND", "User not found", {
          issues: [{ message: "No user found with the provided ID" }],
        }),
        HTTP.NOT_FOUND
      );
    }

    return c.json(
      HONO_RESPONSE({
        message: "User updated successfully",
        data: {
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            emailVerified: updatedUser.emailVerified,
            image: updatedUser.image,
            role: updatedUser.role,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
          },
        },
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to update user", {
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

// ============ ADMIN: DELETE USER ROUTE ============
export const DELETE_User_Route = createRoute({
  path: "/user/admin/{userId}",
  method: "delete",
  tags: moduleTags.user,
  summary: "Delete user (Admin only)",
  description: "Permanently delete a user account",
  request: {
    params: z.object({
      userId: z.string().min(1, "User ID is required"),
    }),
  },
  responses: {
    [HTTP.OK]: {
      description: "User deleted successfully",
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
    [HTTP.NOT_FOUND]: APISchema.NOT_FOUND,
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.UNAUTHORIZED]: APISchema.UNAUTHORIZED,
    [HTTP.FORBIDDEN]: APISchema.FORBIDDEN,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const DELETE_User_Handler: RouteHandler<
  typeof DELETE_User_Route
> = async (c) => {
  try {
    const { userId } = c.req.valid("param");
    const currentUser = c.get("user") as AuthUser;

    // Prevent self-deletion
    if (userId === currentUser.id) {
      return c.json(
        HONO_ERROR("BAD_REQUEST", "Cannot delete your own account", {
          issues: [
            {
              message:
                "Use the account deletion endpoint to delete your own account",
            },
          ],
        }),
        HTTP.BAD_REQUEST
      );
    }

    const deleted = await UserService.deleteUser(userId);

    if (!deleted) {
      return c.json(
        HONO_ERROR("NOT_FOUND", "User not found", {
          issues: [{ message: "No user found with the provided ID" }],
        }),
        HTTP.NOT_FOUND
      );
    }

    return c.json(
      HONO_RESPONSE({
        message: "User deleted successfully",
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to delete user", {
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

// ============ ADMIN: GET USER STATS ROUTE ============
export const GET_UserStats_Route = createRoute({
  path: "/user/admin/stats",
  method: "get",
  tags: moduleTags.user,
  summary: "Get user statistics (Admin only)",
  description: "Retrieve comprehensive user statistics",
  responses: {
    [HTTP.OK]: {
      description: "User statistics retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z
              .object({
                stats: z.object({
                  total: z.number(),
                  verified: z.number(),
                  unverified: z.number(),
                  byRole: z.record(z.string(), z.number()),
                }),
              })
              .optional(),
          }),
        },
      },
    },
    [HTTP.UNAUTHORIZED]: APISchema.UNAUTHORIZED,
    [HTTP.FORBIDDEN]: APISchema.FORBIDDEN,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const GET_UserStats_Handler: RouteHandler<
  typeof GET_UserStats_Route
> = async (c) => {
  try {
    const stats = await UserService.getUserStats();

    return c.json(
      HONO_RESPONSE({
        message: "User statistics retrieved successfully",
        data: {
          stats,
        },
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR(
        "INTERNAL_SERVER_ERROR",
        "Failed to retrieve user statistics",
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

// Export private user routes with appropriate middleware
export const privateUserRoutes = [
  // Basic authenticated user routes
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
  {
    route: DELETE_Account_Route,
    handler: DELETE_Account_Handler,
    middleware: [authMiddleware],
  },
  // Admin-only routes
  {
    route: GET_Users_Route,
    handler: GET_Users_Handler,
    middleware: requireAdmin,
  },
  {
    route: GET_UserById_Route,
    handler: GET_UserById_Handler,
    middleware: requireAdmin,
  },
  {
    route: PATCH_User_Route,
    handler: PATCH_User_Handler,
    middleware: requireAdmin,
  },
  {
    route: DELETE_User_Route,
    handler: DELETE_User_Handler,
    middleware: requireSuperAdmin, // Only super-admin can delete users
  },
  {
    route: GET_UserStats_Route,
    handler: GET_UserStats_Handler,
    middleware: requireAdmin,
  },
];

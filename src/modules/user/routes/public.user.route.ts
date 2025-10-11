import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { moduleTags } from "../../module.tags";
import { APISchema } from "@/lib/schemas/api-schemas";
import { HTTP } from "@/lib/http/status-codes";
import { HONO_RESPONSE, HONO_ERROR } from "@/lib/utils";
import UserService from "../service/user.service";

// Check if user exists schema
const CheckUserSchema = z.object({
  email: z.email("Invalid email address"),
});

// ============ CHECK USER EXISTS ROUTE (PUBLIC) ============
export const POST_CheckUser_Route = createRoute({
  path: "/user/check",
  method: "post",
  tags: moduleTags.user,
  summary: "Check if user exists",
  description:
    "Check if a user account exists with the given email (public endpoint for registration flow)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CheckUserSchema,
        },
      },
    },
  },
  responses: {
    [HTTP.OK]: {
      description: "User check completed",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            statusCode: z.number(),
            data: z.object({
              exists: z.boolean(),
              canRegister: z.boolean(),
            }),
          }),
        },
      },
    },
    [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
    [HTTP.UNPROCESSABLE_ENTITY]: APISchema.UNPROCESSABLE_ENTITY,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const POST_CheckUser_Handler: RouteHandler<
  typeof POST_CheckUser_Route
> = async (c) => {
  try {
    const { email } = c.req.valid("json");

    const exists = await UserService.userExists(email);

    return c.json(
      HONO_RESPONSE({
        message: exists
          ? "User account found"
          : "No account found with this email",
        data: {
          exists,
          canRegister: !exists,
        },
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to check user", {
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

// ============ GET PUBLIC USER INFO ROUTE ============
export const GET_PublicUserInfo_Route = createRoute({
  path: "/user/{userId}/public",
  method: "get",
  tags: moduleTags.user,
  summary: "Get public user information",
  description:
    "Get limited public information about a user (name, verified status, etc.)",
  request: {
    params: z.object({
      userId: z.string().min(1, "User ID is required"),
    }),
  },
  responses: {
    [HTTP.OK]: {
      description: "Public user information retrieved",
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
                emailVerified: z.boolean(),
                createdAt: z.string(),
                image: z.string().optional(),
              }),
            }),
          }),
        },
      },
    },
    [HTTP.NOT_FOUND]: APISchema.NOT_FOUND,
    [HTTP.INTERNAL_SERVER_ERROR]: APISchema.INTERNAL_SERVER_ERROR,
  },
});

export const GET_PublicUserInfo_Handler: RouteHandler<
  typeof GET_PublicUserInfo_Route
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

    // Return only public information
    const publicUser = {
      id: user.id,
      name: user.name,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      ...(user.image && { image: user.image }),
    };

    return c.json(
      HONO_RESPONSE({
        message: "Public user information retrieved successfully",
        data: {
          user: publicUser,
        },
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR(
        "INTERNAL_SERVER_ERROR",
        "Failed to retrieve user information",
        {
          issues: [
            {
              message:
                error instanceof Error
                  ? error.message
                  : "Unknown error occurred",
            },
          ],
          error,
        }
      ),
      HTTP.INTERNAL_SERVER_ERROR
    );
  }
};

// Export public user routes (no authentication required)
export const publicUserRoutes = [
  {
    route: POST_CheckUser_Route,
    handler: POST_CheckUser_Handler,
    middleware: [],
  },
  {
    route: GET_PublicUserInfo_Route,
    handler: GET_PublicUserInfo_Handler,
    middleware: [],
  },
];

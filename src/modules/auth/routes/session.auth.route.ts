import { createRoute, RouteHandler, z } from "@hono/zod-openapi";
import { moduleTags } from "../../module.tags";
import { APISchema } from "@/lib/schemas/api-schemas";
import { HTTP } from "@/lib/http/status-codes";
import { HONO_RESPONSE, HONO_ERROR } from "@/lib/utils";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "@/lib/middlewares/auth.middleware";

// Get current session route
export const GET_Session_Route = createRoute({
  path: "/session",
  method: "get",
  tags: moduleTags.oldAuth,
  summary: "Get current user session",
  description: "Retrieve the current authenticated user's session information",
  responses: {
    [HTTP.OK]: {
      description: "Session information retrieved successfully",
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
              session: z.object({
                id: z.string(),
                userId: z.string(),
                expiresAt: z.string(),
                activeOrganizationId: z.string().optional(),
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

export const GET_Session_Handler: RouteHandler<
  typeof GET_Session_Route
> = async (c) => {
  try {
    const user = c.get("user");
    const session = c.get("session");

    return c.json(
      HONO_RESPONSE({
        message: "Session retrieved successfully",
        data: {
          user,
          session,
        },
      }),
      HTTP.OK
    );
  } catch (error) {
    return c.json(
      HONO_ERROR("INTERNAL_SERVER_ERROR", "Failed to retrieve session", {
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

// Apply auth middleware to the session handler
export const sessionRoutes = [
  {
    route: GET_Session_Route,
    handler: GET_Session_Handler,
    middleware: [authMiddleware],
  },
];

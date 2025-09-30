import z from "zod";
import { HTTP } from "../http/status-codes";

/**
 * Collection of standardized OpenAPI response schemas for HTTP status codes.
 *
 * These schemas ensure consistent API response structure across all endpoints,
 * providing clear success/error indicators, standardized error formats, and
 * appropriate HTTP status codes.
 *
 * @example
 * // Usage in OpenAPI route definition
 * app.openapi(route, {
 *   responses: {
 *     [HTTP.OK]: APISchema.OK,
 *     [HTTP.BAD_REQUEST]: APISchema.BAD_REQUEST,
 *     [HTTP.NOT_FOUND]: APISchema.NOT_FOUND,
 *   }
 * })
 *
 * @namespace APISchema
 */
export const APISchema = {
  /**
   * HTTP 200 OK - Successful request response schema.
   *
   * Used for successful operations that return data or confirmation messages.
   * Contains success indicator, message, and optional status code.
   *
   * @example
   * {
   *   success: true,
   *   message: "Operation completed successfully",
   *   statusCode: 200
   * }
   */
  OK: {
    description: "OK - Request successful",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean().default(true),
          message: z.string().default("Operation completed successfully"),
          statusCode: z.number().optional().default(HTTP.OK),
        }),
      },
    },
  },

  /**
   * HTTP 201 Created - Resource creation success response schema.
   *
   * Used when a new resource has been successfully created.
   * Includes success indicator, message, optional data payload, and status code.
   *
   * @example
   * {
   *   success: true,
   *   message: "Resource created successfully",
   *   data: { id: "123", name: "New Resource" },
   *   statusCode: 201
   * }
   */
  CREATED: {
    description: "Created - Resource successfully created",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean().default(true),
          message: z.string().default("Resource created successfully"),
          data: z.any().optional(),
          statusCode: z.number().default(HTTP.CREATED).optional(),
        }),
      },
    },
  },

  /**
   * HTTP 204 No Content - Successful request with no response body.
   *
   * Used for successful operations that don't need to return data,
   * such as DELETE operations or updates that don't return the updated resource.
   */
  NO_CONTENT: {
    description: "No Content - Request successful with no response body",
  },

  /**
   * HTTP 400 Bad Request - Client error response schema.
   *
   * Used when the request contains invalid syntax, parameters, or data.
   * Contains error details with a descriptive message.
   *
   * @example
   * {
   *   success: false,
   *   error: {
   *     message: "Invalid request parameters provided"
   *   },
   *   statusCode: 400
   * }
   */
  BAD_REQUEST: {
    description: "Bad Request - Invalid request data",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean().default(false),
          error: z.object({
            message: z.string().default("Invalid request parameters provided"),
            issues: z
              .array(
                z.object({
                  message: z.string(),
                  path: z.string().optional(),
                  code: z.string().optional(),
                })
              )
              .optional(),
          }),
          statusCode: z.number().optional().default(HTTP.BAD_REQUEST),
        }),
      },
    },
  },

  /**
   * HTTP 401 Unauthorized - Authentication required response schema.
   *
   * Used when the request lacks valid authentication credentials.
   * The client must authenticate itself to get the requested response.
   *
   * @example
   * {
   *   success: false,
   *   error: {
   *     message: "Authentication required"
   *   },
   *   statusCode: 401
   * }
   */
  UNAUTHORIZED: {
    description: "Unauthorized - Authentication required",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean().default(false),
          error: z.object({
            message: z.string().default("Authentication required"),
            issues: z
              .array(
                z.object({
                  message: z.string(),
                  path: z.string().optional(),
                  code: z.string().optional(),
                })
              )
              .optional(),
          }),
          statusCode: z.number().optional().default(HTTP.UNAUTHORIZED),
        }),
      },
    },
  },

  /**
   * HTTP 403 Forbidden - Access denied response schema.
   *
   * Used when the client is authenticated but doesn't have permission
   * to access the requested resource or perform the operation.
   *
   * @example
   * {
   *   success: false,
   *   error: {
   *     message: "Access denied"
   *   },
   *   statusCode: 403
   * }
   */
  FORBIDDEN: {
    description: "Forbidden - Insufficient permissions",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean().default(false),
          error: z.object({
            message: z.string().default("Access denied"),
            issues: z
              .array(
                z.object({
                  message: z.string(),
                  path: z.string().optional(),
                  code: z.string().optional(),
                })
              )
              .optional(),
          }),
          statusCode: z.number().optional().default(HTTP.FORBIDDEN),
        }),
      },
    },
  },

  /**
   * HTTP 404 Not Found - Resource not found response schema.
   *
   * Used when the requested resource doesn't exist or the endpoint is invalid.
   * Can also be used to hide resource existence from unauthorized clients.
   *
   * @example
   * {
   *   success: false,
   *   error: {
   *     message: "Requested resource not found"
   *   },
   *   statusCode: 404
   * }
   */
  NOT_FOUND: {
    description: "Not Found - Resource not found",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean().default(false),
          error: z.object({
            message: z.string().default("Requested resource not found"),
            issues: z
              .array(
                z.object({
                  message: z.string(),
                  path: z.string().optional(),
                  code: z.string().optional(),
                })
              )
              .optional(),
          }),
          statusCode: z.number().optional().default(HTTP.NOT_FOUND),
        }),
      },
    },
  },

  /**
   * HTTP 409 Conflict - Resource conflict response schema.
   *
   * Used when the request conflicts with the current state of the server,
   * such as trying to create a resource that already exists.
   *
   * @example
   * {
   *   success: false,
   *   error: {
   *     message: "Resource conflict occurred"
   *   },
   *   statusCode: 409
   * }
   */
  CONFLICT: {
    description: "Conflict - Resource already exists or state conflict",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean().default(false),
          error: z.object({
            message: z.string().default("Resource conflict occurred"),
            issues: z
              .array(
                z.object({
                  message: z.string(),
                  path: z.string().optional(),
                  code: z.string().optional(),
                })
              )
              .optional(),
          }),
          statusCode: z.number().optional().default(HTTP.CONFLICT),
        }),
      },
    },
  },

  /**
   * HTTP 422 Unprocessable Entity - Validation error response schema.
   *
   * Used when the request is well-formed but contains semantic errors,
   * typically validation failures on input data.
   *
   * @example
   * {
   *   success: false,
   *   error: {
   *     message: "Request validation failed"
   *   },
   *   statusCode: 422
   * }
   */
  UNPROCESSABLE_ENTITY: {
    description: "Unprocessable Entity - Validation errors",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean().default(false),
          error: z.object({
            message: z.string().default("Request validation failed"),
            issues: z
              .array(
                z.object({
                  message: z.string(),
                  path: z.string().optional(),
                  code: z.string().optional(),
                })
              )
              .optional(),
          }),
          statusCode: z.number().optional().default(HTTP.UNPROCESSABLE_ENTITY),
        }),
      },
    },
  },

  /**
   * HTTP 500 Internal Server Error - Server error response schema.
   *
   * Used when the server encounters an unexpected condition that prevents
   * it from fulfilling the request. Should include minimal error details
   * to avoid exposing sensitive server information.
   *
   * @example
   * {
   *   success: false,
   *   error: {
   *     message: "An unexpected error occurred"
   *   },
   *   statusCode: 500
   * }
   */
  INTERNAL_SERVER_ERROR: {
    description: "Internal Server Error - Server encountered an error",
    content: {
      "application/json": {
        schema: z.object({
          success: z.boolean().default(false),
          error: z.object({
            message: z.string().default("An unexpected error occurred"),
            issues: z
              .array(
                z.object({
                  message: z.string(),
                  path: z.string().optional(),
                  code: z.string().optional(),
                })
              )
              .optional(),
          }),
          statusCode: z.number().optional().default(HTTP.INTERNAL_SERVER_ERROR),
        }),
      },
    },
  },
};

/**
 * Common Zod schemas for API responses
 */
export const CommonSchemas = {
  /**
   * Standard success response schema
   */
  successResponse: z.object({
    success: z.literal(true),
    message: z.string(),
    statusCode: z.number(),
    timestamp: z.string().optional(),
    requestId: z.string().optional(),
  }),

  /**
   * Standard error response schema
   */
  errorResponse: z.object({
    success: z.literal(false),
    error: z.object({
      message: z.string(),
      issues: z
        .array(
          z.object({
            message: z.string(),
            path: z.string().optional(),
            code: z.string().optional(),
          })
        )
        .optional(),
    }),
    statusCode: z.number(),
    timestamp: z.string().optional(),
    requestId: z.string().optional(),
  }),

  /**
   * Paginated response schema
   */
  paginatedResponse: <T extends z.ZodType>(itemSchema: T) =>
    z.object({
      success: z.literal(true),
      message: z.string(),
      statusCode: z.number(),
      data: z.object({
        items: z.array(itemSchema),
        pagination: z.object({
          page: z.number(),
          limit: z.number(),
          total: z.number(),
          totalPages: z.number(),
          hasNext: z.boolean(),
          hasPrev: z.boolean(),
        }),
      }),
      timestamp: z.string().optional(),
      requestId: z.string().optional(),
    }),
};

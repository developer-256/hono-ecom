/**
 * HTTP response utility functions for standardized API responses
 */

import { HTTP, HTTP_STATUS_PHRASE } from "../http/status-codes";
import { HONO_LOGGER } from "../core/hono-logger";

/**
 * Type definitions for better type safety
 */
export type HTTPStatusKey = keyof typeof HTTP;
export type HTTPStatusValue = (typeof HTTP)[HTTPStatusKey];

/**
 * Standard error response structure following OpenAPI specification
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    issues?: Array<{ message: string; path?: string; code?: string }>;
  };
  statusCode: HTTPStatusValue;
  timestamp?: string;
  requestId?: string;
}

/**
 * Options for error response creation
 */
interface ErrorOptions {
  message?: string;
  issues?: Array<{ message: string; path?: string; code?: string }>;
  timestamp?: boolean;
  requestId?: string;
  error?: Error | any; // Optional error object to extract route/method info
}

/**
 * Creates a standardized error response following the OpenAPI error schema.
 * Supports multiple error messages and additional metadata for better debugging.
 *
 * @param statusCode - HTTP status code key from HTTP
 * @param message - Primary error message (optional, will use generated message if not provided)
 * @param options - Optional configuration object
 * @param options.message - Optional custom message (overrides the message parameter)
 * @param options.issues - Optional array of detailed error issues (Zod-compatible structure)
 * @param options.timestamp - Whether to include timestamp (default: true)
 * @param options.requestId - Optional request ID for tracing
 * @param options.error - Optional error object to extract route/method information for debugging
 * @returns Standardized error response object
 *
 * @example
 * // Simple error with message
 * HONO_ERROR("BAD_REQUEST", "Invalid request data")
 *
 * // Error without message (uses generated message)
 * HONO_ERROR("UNPROCESSABLE_ENTITY")
 *
 * // Error with custom message via options
 * HONO_ERROR("BAD_REQUEST", undefined, { message: "Custom error message" })
 *
 * // Validation error with multiple issues (Zod-style)
 * HONO_ERROR("UNPROCESSABLE_ENTITY", "Validation failed", {
 *   issues: [
 *     { message: "Email is required", path: "email", code: "required" },
 *     { message: "Password too short", path: "password", code: "min_length" }
 *   ]
 * })
 *
 * // With request tracking
 * HONO_ERROR("INTERNAL_SERVER_ERROR", "Database error", {
 *   requestId: "req_123456"
 * })
 *
 * // With error object for route/method debugging (5xx errors get detailed logging)
 * HONO_ERROR("BAD_REQUEST", "Invalid token", {
 *   error: {
 *     route: "/auth/verify-email",
 *     method: "POST",
 *     path: "/auth/verify-email",
 *     userAgent: "Mozilla/5.0...",
 *     ip: "192.168.1.1"
 *   }
 * })
 *
 * // With Error object for stack trace logging
 * HONO_ERROR("INTERNAL_SERVER_ERROR", "Database connection failed", {
 *   error: new Error("Connection timeout"),
 *   requestId: "req_789012"
 * })
 */
export function HONO_ERROR(
  statusCode: HTTPStatusKey,
  message?: string,
  options: ErrorOptions = {}
): ErrorResponse {
  const statusValue = HTTP[statusCode];

  const {
    message: optionsMessage,
    issues,
    timestamp = true,
    requestId,
    error: errorObject,
  } = options;

  // Generate a generic message based on the status code
  const generateErrorMessage = (statusCode: HTTPStatusKey): string => {
    const messageMap: Partial<Record<HTTPStatusKey, string>> = {
      BAD_REQUEST: "Invalid request parameters provided",
      UNAUTHORIZED: "Authentication required",
      FORBIDDEN: "Access denied",
      NOT_FOUND: "Requested resource not found",
      CONFLICT: "Resource conflict occurred",
      UNPROCESSABLE_ENTITY: "Request validation failed",
      INTERNAL_SERVER_ERROR: "An unexpected error occurred",
      SERVICE_UNAVAILABLE: "Service temporarily unavailable",
      TOO_MANY_REQUESTS: "Too many requests",
      METHOD_NOT_ALLOWED: "Method not allowed",
      UNSUPPORTED_MEDIA_TYPE: "Unsupported media type",
    };

    return messageMap[statusCode] || "An error occurred";
  };

  // Priority: options.message > message parameter > generated message
  const finalMessage =
    optionsMessage || message || generateErrorMessage(statusCode);

  const response: ErrorResponse = {
    success: false,
    error: {
      message: finalMessage,
      ...(issues && issues.length > 0 && { issues }),
    },
    statusCode: statusValue,
  };

  // Add optional fields
  if (timestamp) {
    response.timestamp = new Date().toISOString();
  }

  if (requestId) {
    response.requestId = requestId;
  }

  if (statusValue >= 500) {
    HONO_LOGGER.error(`HTTP ${statusValue} | Error: ${finalMessage}`, {
      originalError: errorObject,
    });

    // Report to Sentry for 5xx errors
    if (errorObject instanceof Error) {
      HONO_LOGGER.sentry.captureException(errorObject, {
        tags: {
          statusCode: statusValue,
          errorCode: statusCode,
        },
        extra: {
          message: finalMessage,
          requestId,
          timestamp: new Date().toISOString(),
        },
      });
    } else if (errorObject) {
      // For non-Error objects, capture as a message
      HONO_LOGGER.sentry.captureMessage(
        `HTTP ${statusValue} Error: ${finalMessage}`,
        "error",
        {
          tags: {
            statusCode: statusValue,
            errorCode: statusCode,
          },
          extra: {
            originalError: errorObject,
            requestId,
            timestamp: new Date().toISOString(),
          },
        }
      );
    }
  } else {
    HONO_LOGGER.error(`HTTP ${statusValue} | Error: ${finalMessage}`);
  }

  return response;
}

/**
 * Options for success response creation
 */
interface ResponseOptions<T = any> {
  data?: T;
  message?: string;
  statusCode?: HTTPStatusKey;
  timestamp?: boolean;
  requestId?: string;
}

/**
 * Base response shared across all success responses
 */
interface BaseResponse {
  success: true;
  message: string;
  statusCode: HTTPStatusValue;
  timestamp?: string;
  requestId?: string;
}

/**
 * Success response with data
 */
export type SuccessResponse<T> = BaseResponse & { data: T };

/**
 * Success response without data
 */
export type SuccessResponseNoData = BaseResponse & { data?: never };

/**
 * Creates a standardized success response following the OpenAPI response schema.
 * Supports flexible data payloads and optional metadata for comprehensive responses.
 *
 * @param options - Configuration object
 * @param options.data - Response data (required when provided)
 * @param options.message - Optional success message (defaults based on status code)
 * @param options.statusCode - Optional HTTP status code key (defaults to "OK")
 * @param options.timestamp - Whether to include timestamp (default: true)
 * @param options.requestId - Optional request ID for tracing
 * @returns Standardized success response object
 *
 * @example
 * // Simple success without data
 * HONO_RESPONSE()
 *
 * // Success with data
 * HONO_RESPONSE({ data: { id: 1, name: "John" } })
 *
 * // Created resource
 * HONO_RESPONSE({
 *   data: user,
 *   message: "User created successfully",
 *   statusCode: "CREATED"
 * })
 *
 * // With request tracking
 * HONO_RESPONSE({
 *   data: results,
 *   requestId: "req_123456"
 * })
 *
 * // No content response
 * HONO_RESPONSE({ statusCode: "NO_CONTENT" })
 */

// Overload for when data is provided
export function HONO_RESPONSE<T>(
  options: ResponseOptions<T> & { data: T }
): SuccessResponse<T>;

// Overload for when no data is provided
export function HONO_RESPONSE(
  options?: Omit<ResponseOptions, "data">
): SuccessResponseNoData;

// Implementation
export function HONO_RESPONSE<T>(
  options: ResponseOptions<T> = {}
): SuccessResponse<T> | SuccessResponseNoData {
  const {
    data,
    message,
    statusCode = "OK",
    timestamp = true,
    requestId,
  } = options;

  const statusValue = HTTP[statusCode];

  // Default messages based on status codes
  const defaultMessages: Partial<Record<HTTPStatusKey, string>> = {
    OK: "Operation completed successfully",
    CREATED: "Resource created successfully",
    ACCEPTED: "Request accepted for processing",
    NO_CONTENT: "Operation completed successfully",
  };

  const responseMessage =
    message ||
    defaultMessages[statusCode] ||
    "Operation completed successfully";

  const base: BaseResponse = {
    success: true,
    message: responseMessage,
    statusCode: statusValue,
  };

  if (timestamp) base.timestamp = new Date().toISOString();
  if (requestId) base.requestId = requestId;

  return data !== undefined ? { ...base, data } : base;
}

/**
 * Creates a paginated success response for list endpoints
 *
 * @param data - Array of items
 * @param pagination - Pagination metadata
 * @param options - Additional response options
 * @returns Standardized paginated response
 *
 * @example
 * HONO_PAGINATED_RESPONSE(users, {
 *   page: 1,
 *   limit: 10,
 *   total: 100,
 *   totalPages: 10
 * })
 */
export function HONO_PAGINATED_RESPONSE<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  },
  options: Omit<ResponseOptions, "data"> = {}
): SuccessResponse<{
  items: T[];
  pagination: typeof pagination;
}> {
  const paginationData = {
    ...pagination,
    hasNext: pagination.hasNext ?? pagination.page < pagination.totalPages,
    hasPrev: pagination.hasPrev ?? pagination.page > 1,
  };

  return HONO_RESPONSE({
    ...options,
    data: {
      items: data,
      pagination: paginationData,
    },
    message: options.message || `Retrieved ${data.length} items`,
  });
}

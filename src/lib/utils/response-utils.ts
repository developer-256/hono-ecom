/**
 * HTTP response utility functions for standardized API responses
 */

import { Context } from "hono";
import { HTTP, HTTP_STATUS_PHRASE } from "../http/status-codes";

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
    name: string;
    issues: Array<{ message: string; path?: string; code?: string }>;
  };
  statusCode: HTTPStatusValue;
  timestamp?: string;
  requestId?: string;
}

/**
 * Standard success response structure following OpenAPI specification
 */
export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  statusCode: HTTPStatusValue;
  data?: T;
  timestamp?: string;
  requestId?: string;
}

/**
 * Options for error response creation
 */
interface ErrorOptions {
  name?: string;
  issues?: Array<{ message: string; path?: string; code?: string }>;
  timestamp?: boolean;
  requestId?: string;
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
 * Creates a standardized error response following the OpenAPI error schema.
 * Supports multiple error messages and additional metadata for better debugging.
 *
 * @param statusCode - HTTP status code key from HTTP
 * @param message - Primary error message
 * @param options - Optional configuration object
 * @param options.name - Optional error name (defaults to status code description)
 * @param options.issues - Array of error issues with optional path and code
 * @param options.timestamp - Whether to include timestamp (default: true)
 * @param options.requestId - Optional request ID for tracing
 * @returns Standardized error response object
 *
 * @example
 * // Simple error
 * HONO_ERROR("BAD_REQUEST", "Request failed")
 *
 * // Error with custom name
 * HONO_ERROR("BAD_REQUEST", "Validation failed", { name: "ValidationError" })
 *
 * // Multiple validation errors
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
 */
export function HONO_ERROR(
  statusCode: HTTPStatusKey,
  message: string,
  options: ErrorOptions = {}
): ErrorResponse {
  const statusValue = HTTP[statusCode];
  const defaultName =
    HTTP_STATUS_PHRASE[statusValue as keyof typeof HTTP_STATUS_PHRASE] ||
    "Error";

  const { name = defaultName, issues, timestamp = true, requestId } = options;

  // Use provided issues or create from message
  const errorIssues = issues || [{ message }];

  const response: ErrorResponse = {
    success: false,
    error: {
      name,
      issues: errorIssues,
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

  return response;
}

/**
 * Creates a standardized success response following the OpenAPI response schema.
 * Supports flexible data payloads and optional metadata for comprehensive responses.
 *
 * @param options - Configuration object
 * @param options.data - Optional response data (any type)
 * @param options.message - Optional success message (defaults based on status code)
 * @param options.statusCode - Optional HTTP status code key (defaults to "OK")
 * @param options.timestamp - Whether to include timestamp (default: true)
 * @param options.requestId - Optional request ID for tracing
 * @returns Standardized success response object
 *
 * @example
 * // Simple success
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
export function HONO_RESPONSE<T = any>(
  options: ResponseOptions<T> = {}
): SuccessResponse<T> {
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

  const response: SuccessResponse<T> = {
    success: true,
    message: responseMessage,
    statusCode: statusValue,
  };

  // Only include data field if it's provided and not NO_CONTENT
  if (data !== undefined && statusCode !== "NO_CONTENT") {
    response.data = data;
  }

  // Add optional fields
  if (timestamp) {
    response.timestamp = new Date().toISOString();
  }

  if (requestId) {
    response.requestId = requestId;
  }

  return response;
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

/**
 * Type guard to check if response is an error
 *
 * @param response - Response to check
 * @returns True if response is an error
 */
export const isErrorResponse = (response: any): response is ErrorResponse => {
  return response && response.success === false;
};

/**
 * Type guard to check if response is successful
 *
 * @param response - Response to check
 * @returns True if response is successful
 */
export const isSuccessResponse = <T = any>(
  response: any
): response is SuccessResponse<T> => {
  return response && response.success === true;
};

/**
 * Common HTTP status codes for quick access
 */
export const HTTP_STATUS = HTTP;

/**
 * HTTP status phrases for quick access
 */
export const STATUS_PHRASES = HTTP_STATUS_PHRASE;

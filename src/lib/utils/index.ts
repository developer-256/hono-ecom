/**
 * Centralized exports for all utility functions
 *
 * This file provides a single import point for all utility functions,
 * organized by category for better discoverability and maintainability.
 */

// String utilities
export {
  slugify,
  deSlugify,
  capitalize,
  toTitleCase,
  truncate,
  stripHtml,
} from "./string-utils";

// Async utilities and Result pattern
export {
  tryCatch,
  tryCatchSync,
  delay,
  timeout,
  withTimeout,
  retry,
  parallelLimit,
  isSuccess,
  isFailure,
  type Result,
} from "./async-utils";

// HTTP response utilities
export {
  HONO_ERROR,
  HONO_RESPONSE,
  HONO_PAGINATED_RESPONSE,
  type ErrorResponse,
  type SuccessResponse,
} from "./response-utils";

// Re-export commonly used types for convenience
export type { HTTPStatusKey, HTTPStatusValue } from "./response-utils";

/**
 * Utility categories for reference:
 *
 * STRING UTILITIES:
 * - slugify: Convert string to URL-friendly slug
 * - deSlugify: Convert slug back to readable title
 * - capitalize: Capitalize first letter
 * - toTitleCase: Convert to title case
 * - truncate: Truncate string with ellipsis
 * - stripHtml: Remove HTML tags
 *
 * ASYNC UTILITIES:
 * - tryCatch: Safe promise execution with Result pattern
 * - tryCatchSync: Safe synchronous execution with Result pattern
 * - delay: Simple delay function
 * - timeout: Create timeout promise
 * - withTimeout: Race promise against timeout
 * - retry: Retry with exponential backoff
 * - parallelLimit: Execute promises with concurrency limit
 * - isSuccess/isFailure: Result type guards
 *
 * RESPONSE UTILITIES:
 * - HONO_ERROR: Create standardized error responses
 * - HONO_RESPONSE: Create standardized success responses
 * - HONO_PAGINATED_RESPONSE: Create paginated responses
 * - isErrorResponse/isSuccessResponse: Response type guards
 * - HTTP_STATUS: HTTP status codes
 * - STATUS_PHRASES: HTTP status phrases
 */

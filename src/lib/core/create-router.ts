import { OpenAPIHono, type Hook } from "@hono/zod-openapi";
import { UNPROCESSABLE_ENTITY } from "../http/status-codes";
import { HONO_ERROR } from "../utils/response-utils";
import type { Context } from "hono";
import type { ZodError } from "zod";

/**
 * Configuration options for creating a router instance
 */
export interface RouterConfig {
  /** Whether to use strict mode for OpenAPI validation (default: false) */
  strict?: boolean;
  /** Custom hook for handling validation errors */
  defaultHook?: Hook<any, any, any, any>;
  /** Whether to include detailed error information in responses (default: true) */
  includeErrorDetails?: boolean;
}

/**
 * Enhanced default hook for handling Zod validation errors
 * Provides standardized error responses with detailed validation information
 */
const createDefaultHook = (
  includeErrorDetails = true
): Hook<any, any, any, any> => {
  return (result, c: Context) => {
    if (!result.success) {
      const requestId = c.get("requestId");

      // Extract detailed validation errors from Zod
      const issues =
        includeErrorDetails && "error" in result && result.error?.issues
          ? result.error.issues.map((issue) => ({
              message: issue.message,
              path: issue.path.join(".") || undefined,
              code: issue.code || undefined,
            }))
          : [{ message: "Validation failed" }];

      const errorResponse = HONO_ERROR(
        "UNPROCESSABLE_ENTITY",
        "Validation failed",
        {
          name: "Validation Error",
          issues,
          requestId,
          timestamp: true,
        }
      );

      return c.json(errorResponse, UNPROCESSABLE_ENTITY);
    }
  };
};

/**
 * Creates a configured OpenAPI Hono router instance with enhanced error handling
 *
 * @param config - Optional configuration for the router
 * @returns Configured OpenAPIHono instance
 *
 * @example
 * ```typescript
 * // Basic usage
 * const router = createRouter();
 *
 * // With custom configuration
 * const router = createRouter({
 *   strict: true,
 *   includeErrorDetails: false
 * });
 *
 * // With custom hook
 * const router = createRouter({
 *   defaultHook: (result, c) => {
 *     // Custom validation error handling
 *   }
 * });
 * ```
 */
export const createRouter = (config: RouterConfig = {}): OpenAPIHono => {
  const { strict = false, defaultHook, includeErrorDetails = true } = config;

  const hook = defaultHook || createDefaultHook(includeErrorDetails);

  return new OpenAPIHono({
    strict,
    defaultHook: hook,
  });
};

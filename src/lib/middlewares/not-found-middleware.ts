/**
 * Simple Not Found (404) middleware for handling undefined routes
 */

import type { NotFoundHandler } from "hono";
import { HONO_ERROR } from "../utils/response-utils";

/**
 * Configuration options for the not found handler
 */
export interface NotFoundConfig {
  /** Whether to log 404 requests */
  enableLogging?: boolean;
  /** Custom message for 404 responses */
  customMessage?: string;
}

/**
 * Creates a configurable not found handler
 *
 * @param config - Configuration options
 * @returns NotFoundHandler
 *
 * @example
 * ```typescript
 * // Basic usage
 * app.notFound(createNotFoundHandler());
 *
 * // With custom message
 * app.notFound(createNotFoundHandler({
 *   customMessage: "Oops! This page doesn't exist"
 * }));
 *
 * // Disable logging
 * app.notFound(createNotFoundHandler({
 *   enableLogging: false
 * }));
 * ```
 */
export function createNotFoundHandler(
  config: NotFoundConfig = {}
): NotFoundHandler {
  const { enableLogging = true, customMessage } = config;

  return (c) => {
    const requestedPath = c.req.path;
    const method = c.req.method;
    const requestId = c.get("requestId");
    // Log 404 requests if enabled
    if (enableLogging) {
      console.warn(`[404] ${method} ${requestedPath}`, {
        requestId,
        userAgent: c.req.header("user-agent"),
      });
    }

    const message =
      customMessage ||
      `The requested resource '${requestedPath}' was not found`;

    return c.json(HONO_ERROR("NOT_FOUND", message, { requestId }), 404);
  };
}

/**
 * Default not found handler - simple and efficient
 */
export const notFoundHandler: NotFoundHandler = createNotFoundHandler();

/**
 * Not found handler with API-specific messaging
 */
export const apiNotFoundHandler: NotFoundHandler = createNotFoundHandler({
  customMessage:
    "API endpoint not found. Please check the documentation for available endpoints.",
});

/**
 * @deprecated Use createNotFoundHandler or notFoundHandler instead
 */
export const notFound = notFoundHandler;

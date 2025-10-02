import { Context, Next } from "hono";
import { Sentry } from "../core/sentry";
import { HONO_LOGGER, logger } from "../core/hono-logger";
import env from "../../env";

/**
 * Sentry middleware for request context tracking and error handling
 * Only active when Sentry is enabled
 */
export const sentryMiddleware = async (c: Context, next: Next) => {
  if (!env.SENTRY_ENABLED) {
    return await next();
  }

  const requestId = c.get("requestId");

  // Set Sentry context for this request
  Sentry.setContext("request", {
    id: requestId,
    method: c.req.method,
    url: c.req.url,
    headers: c.req.header(),
    userAgent: c.req.header("user-agent"),
  });

  // Add request ID as tag
  Sentry.setTag("request_id", requestId);

  try {
    await next();
  } catch (error) {
    // Let the error handler deal with it, but add breadcrumb
    Sentry.addBreadcrumb({
      message: `Error in ${c.req.method} ${c.req.url}`,
      level: "error",
      category: "request",
      data: {
        requestId,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
};

/**
 * Enhanced error handler with Sentry integration
 * Captures errors to Sentry and delegates to the original error handler
 */
export const sentryErrorHandler = (originalErrorHandler: any) => {
  return (err: any, c: Context) => {
    // Log error with our enhanced logger
    HONO_LOGGER.sentry.captureException(
      err instanceof Error ? err : new Error(String(err)),
      {
        requestId: c.get("requestId"),
        method: c.req.method,
        url: c.req.url,
        userAgent: c.req.header("user-agent"),
      }
    );

    // Call the original error handler
    return originalErrorHandler(err, c);
  };
};

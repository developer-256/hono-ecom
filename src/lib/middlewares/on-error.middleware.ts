import type { ErrorHandler } from "hono";

import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status";
import env from "@/env";
import {
  HTTP_STATUS_PHRASE,
  INTERNAL_SERVER_ERROR,
  OK,
} from "../http/status-codes";
import { HONO_LOGGER } from "../core/hono-logger";

export const onError: ErrorHandler = (err, c) => {
  const currentStatus =
    "status" in err ? err.status : c.newResponse(null).status;
  const statusCode =
    currentStatus !== OK
      ? (currentStatus as StatusCode)
      : INTERNAL_SERVER_ERROR;
  const curr_env = c.env?.NODE_ENV || env.NODE_ENV;

  // Log error for debugging
  HONO_LOGGER.error(`HTTP ${statusCode} | Error: ${err.message}`, {
    statusCode,
    path: c.req.path,
    method: c.req.method,
    userAgent: c.req.header("user-agent"),
    requestId: c.get("requestId"),
  });

  return c.json(
    {
      message: err.message,
      statusCode: statusCode,
      error:
        HTTP_STATUS_PHRASE[statusCode as keyof typeof HTTP_STATUS_PHRASE] ??
        "Unknown Error",

      stack: curr_env === "production" ? undefined : err.stack,
    },
    statusCode as ContentfulStatusCode
  );
};

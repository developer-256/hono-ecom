// Initialize Sentry before importing other modules
import { initializeSentry } from "./lib/core/sentry";
initializeSentry();

import { createRouter } from "./lib/core/create-router";
import { requestId } from "hono/request-id";
import { logger } from "hono/logger";
import { HonoLogger } from "./lib/core/hono-logger";
import { cors } from "hono/cors";
import { onError } from "./lib/middlewares/on-error.middleware";
import {
  sentryMiddleware,
  sentryErrorHandler,
} from "./lib/middlewares/sentry.middleware";
import configureOpenAPI from "./lib/core/open-api.config";
import env from "./env";
import { serve } from "bun";
import { createNotFoundHandler } from "./lib/middlewares/not-found-middleware";
import { faviconMiddleware } from "./lib/middlewares/favicon-middleware";
import { HTTP } from "./lib/http/status-codes";
import { APISchema } from "./lib/schemas/api-schemas";
import { HONO_RESPONSE } from "./lib/utils";

const createApp = () => {
  const app = createRouter().basePath("/api");

  app.use(requestId()).use(faviconMiddleware("📝"));
  app.use(logger(HonoLogger));
  app.use("/*", cors());

  // Sentry middleware for request tracking
  app.use("*", sentryMiddleware);

  app.notFound(createNotFoundHandler());
  app.onError(sentryErrorHandler(onError));

  return app;
};

export const app = createApp();
configureOpenAPI(app);

const controllers: any = [];

for (const controller of controllers) {
  app.route("/", controller);
}

app.openapi(
  {
    path: "/",
    method: "get",
    tags: ["Base"],
    responses: {
      [HTTP.OK]: APISchema.OK,
      [HTTP.UNPROCESSABLE_ENTITY]: APISchema.UNPROCESSABLE_ENTITY,
    },
  },
  (c) => {
    return c.json(HONO_RESPONSE({ message: "Yollo Bozo" }), HTTP.OK);
  }
);

serve({
  port: env.PORT,
  fetch: app.fetch,
  // tls: {}, // for certbot certificate files
});

HonoLogger(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
HonoLogger(
  `📚 Scalar API documentation available at: http://localhost:${env.PORT}/api/reference`
);

/**
 * const requestId = c.get("requestId")
 */

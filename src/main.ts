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
import { mailerController } from "./modules/mailer/controller";
import { userController } from "./modules/user/controller";
import { authController } from "./modules/auth/controller";
import { auth } from "./modules/auth/service";

const createApp = () => {
  const app = createRouter().basePath("/api");

  app.use(requestId()).use(faviconMiddleware("📝"));
  app.use(logger(HonoLogger));
  app.use(
    "/*",
    cors({
      origin:
        env.NODE_ENV === "development"
          ? ["http://localhost:3000", "http://localhost:9999"]
          : [env.BETTER_AUTH_URL],
      credentials: true,
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["POST", "GET", "OPTIONS"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
    })
  );

  // Sentry middleware for request tracking
  app.use("*", sentryMiddleware);

  app.notFound(createNotFoundHandler());
  app.onError(sentryErrorHandler(onError));

  return app;
};

export const app = createApp();
configureOpenAPI(app);

// Mount Better Auth handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

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

const controllers = [mailerController, userController, authController];

for (const controller of controllers) {
  app.route("/", controller);
}

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

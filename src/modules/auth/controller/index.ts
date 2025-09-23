import { createRouter } from "@/lib/core/create-router";
import { sessionRoutes } from "../routes/session";
import { adminRoutes } from "../routes/admin";

// Create auth controller with Better Auth integration
export const authController = createRouter();

// Add session routes
for (const { route, handler, middleware } of sessionRoutes) {
  if (middleware && middleware.length > 0) {
    authController.use(route.path, ...middleware);
  }
  authController.openapi(route, handler);
}

// Add admin routes
for (const { route, handler, middleware } of adminRoutes) {
  if (middleware && middleware.length > 0) {
    authController.use(route.path, ...middleware);
  }
  authController.openapi(route, handler);
}

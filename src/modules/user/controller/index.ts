import { createRouter } from "@/lib/core/create-router";
import { profileRoutes } from "../routes/profile";

// Create user controller with Better Auth integration
export const userController = createRouter();

// Add profile routes
for (const { route, handler, middleware } of profileRoutes) {
  if (middleware && middleware.length > 0) {
    userController.use(route.path, ...middleware);
  }
  userController.openapi(route, handler);
}

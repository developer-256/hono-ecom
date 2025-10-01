import { createRouter } from "@/lib/core/create-router";
import { authRoutes } from "../routes/auth.auth.route";
import { sessionRoutes } from "../routes/session.auth.route";
import { adminRoutes } from "../routes/admin.auth.route";

/**
 * Auth Controller
 *
 * Handles all authentication-related endpoints:
 * - Auth: Sign-up, sign-in, password reset, email verification
 * - Session: Session management and validation
 * - Admin: User management and administrative functions
 */
export const authController = createRouter();

/**
 * Register a route with its middleware
 */
const addRoute = (route: any, handler: any, middleware: any[] = []) => {
  // Apply middleware if provided
  if (middleware?.length > 0) {
    authController.use(route.path, ...middleware);
  }

  // Register the route
  authController.openapi(route, handler);
};

/**
 * Register all authentication routes
 */
const allRoutes = [...authRoutes, ...sessionRoutes, ...adminRoutes];
allRoutes.forEach(({ route, handler, middleware }) => {
  addRoute(route, handler, middleware);
});

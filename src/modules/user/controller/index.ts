import { createRouter } from "@/lib/core/create-router";
import { publicUserRoutes } from "../routes/public";
import { privateUserRoutes } from "../routes/private";

/**
 * User Controller
 *
 * Handles all user-related endpoints:
 * - Public: User lookup, public profiles
 * - Private: Profile management, admin operations
 */
export const userController = createRouter();

/**
 * Register a route with its middleware
 */
const addRoute = (route: any, handler: any, middleware: any[] = []) => {
  // Apply middleware if provided
  if (middleware?.length > 0) {
    userController.use(route.path, ...middleware);
  }

  // Register the route
  userController.openapi(route, handler);
};

/**
 * Register all user routes
 */
const allRoutes = [...publicUserRoutes, ...privateUserRoutes];
allRoutes.forEach(({ route, handler, middleware }) => {
  addRoute(route, handler, middleware);
});

import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { auth } from "@/lib/auth";
import { HTTP } from "@/lib/http/status-codes";

// Types for Better Auth session and user data
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: "super-admin" | "admin" | "sales" | "writer" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string;
  userAgent?: string;
}

// Extend Hono's Context with auth data
declare module "hono" {
  interface ContextVariableMap {
    user: AuthUser;
    session: AuthSession;
  }
}

/**
 * Authentication middleware - verifies user session
 * Adds user and session to context if authenticated
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  try {
    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      throw new HTTPException(HTTP.UNAUTHORIZED, {
        message: "Authentication required",
      });
    }

    // Set user and session in context
    c.set("user", session.user as AuthUser);
    c.set("session", session.session as AuthSession);

    await next();
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(HTTP.UNAUTHORIZED, {
      message: "Invalid or expired session",
    });
  }
});

/**
 * Optional authentication middleware - adds user to context if authenticated
 * Does not throw error if not authenticated
 */
export const optionalAuthMiddleware = createMiddleware(async (c, next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (session) {
      c.set("user", session.user as AuthUser);
      c.set("session", session.session as AuthSession);
    }

    await next();
  } catch (error) {
    // Continue without authentication
    await next();
  }
});

/**
 * Role-based authorization middleware
 * Requires authMiddleware to be used first
 */
export const roleMiddleware = (requiredRole: AuthUser["role"]) => {
  return createMiddleware(async (c, next) => {
    const user = c.get("user");

    if (!user) {
      throw new HTTPException(HTTP.UNAUTHORIZED, {
        message: "Authentication required",
      });
    }

    // Check if user has required role or higher
    if (!hasRequiredRole(user.role, requiredRole)) {
      throw new HTTPException(HTTP.FORBIDDEN, {
        message: `Insufficient permissions. Required role: ${requiredRole}`,
      });
    }

    await next();
  });
};

/**
 * Role hierarchy helper function
 * Checks if user role has sufficient permissions
 */
function hasRequiredRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    user: 0,
    writer: 1,
    sales: 2,
    admin: 3,
    "super-admin": 4,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? -1;
  const requiredLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 999;

  return userLevel >= requiredLevel;
}

/**
 * Convenience middleware combinations
 */

// Requires authentication only
export const requireAuth = authMiddleware;

// Requires writer role or higher
export const requireWriter = [authMiddleware, roleMiddleware("writer")];

// Requires sales role or higher
export const requireSales = [authMiddleware, roleMiddleware("sales")];

// Requires admin role or higher
export const requireAdmin = [authMiddleware, roleMiddleware("admin")];

// Requires super-admin role
export const requireSuperAdmin = [
  authMiddleware,
  roleMiddleware("super-admin"),
];

/**
 * Role check helper for use in route handlers
 */
export const checkRole = (
  user: AuthUser,
  requiredRole: AuthUser["role"]
): boolean => {
  return hasRequiredRole(user.role, requiredRole);
};

/**
 * Get user role level for comparison
 */
export const getRoleLevel = (role: AuthUser["role"]): number => {
  const roleHierarchy = {
    user: 0,
    writer: 1,
    sales: 2,
    admin: 3,
    "super-admin": 4,
  };

  return roleHierarchy[role] ?? -1;
};

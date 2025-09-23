# Better Auth Integration - Simple Role-Based Authentication

This document outlines the Better Auth integration with simple role-based authentication using the Admin plugin in the Hono e-commerce application.

## 🚀 Features Implemented

### ✅ Authentication & Authorization

- **Email/Password Authentication** - User registration and login
- **Session Management** - Secure session handling with cookies
- **Simple Role System** - Direct user roles without organization complexity
- **Role-Based Access Control** - Five-tier role system (super-admin, admin, sales, writer, user)
- **Middleware Protection** - Route-level authentication and authorization

### ✅ Database Schema

- **User Management** - Complete user profile system with direct role assignment
- **Session Tracking** - Detailed session information with IP/UserAgent
- **Simple Role System** - Direct role field on user table
- **Admin Management** - User and role management capabilities

## 📁 File Structure

```
src/
├── lib/
│   ├── auth.ts                    # Better Auth instance configuration
│   ├── auth-client.ts            # Client-side auth utilities
│   └── middlewares/
│       └── auth.middleware.ts    # Authentication & authorization middleware
├── modules/
│   ├── auth/
│   │   ├── controller/index.ts   # Auth controller with Better Auth routes
│   │   └── routes/
│   │       ├── session.ts        # Session management routes
│   │       └── organizations.ts  # Organization management routes
│   └── user/
│       ├── controller/index.ts   # User controller
│       └── routes/
│           └── profile.ts        # User profile routes (protected)
└── db/schema/index.ts            # Better Auth database schema
```

## 🔧 Configuration

### Environment Variables

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your-32-character-secret-key
BETTER_AUTH_URL=http://localhost:9999

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
```

### Auth Instance (`src/lib/auth.ts`)

```typescript
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  emailAndPassword: { enabled: true },
  plugins: [
    organization({
      roles: ["owner", "admin", "member", "viewer"],
      allowUserToCreateOrganization: true,
      organizationLimit: 5,
    }),
  ],
});
```

## 🛡️ Middleware System

### Authentication Middleware

```typescript
import { authMiddleware, requireAuth } from "@/lib/middlewares/auth.middleware";

// Require authentication
app.use("/protected/*", authMiddleware);

// Or use convenience middleware
app.use("/admin/*", requireAuth);
```

### Organization Middleware

```typescript
import {
  requireOrganization,
  requireOrganizationAdmin,
  requireOrganizationOwner,
} from "@/lib/middlewares/auth.middleware";

// Require organization membership
app.use("/org/:orgId/*", requireOrganization);

// Require admin role or higher
app.use("/org/:orgId/admin/*", requireOrganizationAdmin);

// Require owner role
app.use("/org/:orgId/settings/*", requireOrganizationOwner);
```

### Role Hierarchy

1. **Owner** (Level 3) - Full organization control
2. **Admin** (Level 2) - Management access
3. **Member** (Level 1) - Limited access
4. **Viewer** (Level 0) - Read-only access

## 📡 API Endpoints

### Authentication Endpoints (Better Auth)

```
POST /api/auth/sign-up         # User registration
POST /api/auth/sign-in         # User login
POST /api/auth/sign-out        # User logout
GET  /api/auth/session         # Get session info
```

### Session Management

```
GET /api/session               # Get current session (protected)
```

### Organization Management

```
GET  /api/organizations        # List user's organizations (protected)
POST /api/organizations        # Create organization (protected)
GET  /api/organizations/:id    # Get organization details (protected + membership)
```

### User Profile

```
GET   /api/profile             # Get user profile (protected)
PATCH /api/profile             # Update user profile (protected)
```

## 🔐 Usage Examples

### Client-Side Authentication

```typescript
import { authClient } from "@/lib/auth-client";

// Sign up
await authClient.signUp.email({
  email: "user@example.com",
  password: "securePassword",
  name: "John Doe",
});

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "securePassword",
});

// Get session
const session = await authClient.getSession();
```

### Organization Management

```typescript
// Create organization
const org = await authClient.createOrganization({
  name: "My Company",
  slug: "my-company",
});

// Invite member
await authClient.inviteMember({
  organizationId: org.id,
  email: "member@example.com",
  role: "admin",
});

// Set active organization
await authClient.setActiveOrganization({
  organizationId: org.id,
});
```

### Protected Route Implementation

```typescript
import { createRoute, RouteHandler } from "@hono/zod-openapi";
import { requireOrganizationAdmin } from "@/lib/middlewares/auth.middleware";

export const protectedRoute = createRoute({
  path: "/admin/dashboard",
  method: "get",
  // ... route config
});

export const protectedHandler: RouteHandler<typeof protectedRoute> = async (
  c
) => {
  // Access authenticated user and organization
  const user = c.get("user");
  const organization = c.get("organization");
  const member = c.get("organizationMember");

  return c.json({ user, organization, member });
};

// Apply middleware
app.use("/admin/*", ...requireOrganizationAdmin);
app.openapi(protectedRoute, protectedHandler);
```

## 🗄️ Database Schema

The integration includes the following tables:

- `user` - User accounts and profiles
- `session` - Active user sessions
- `account` - Authentication provider accounts
- `verification` - Email verification tokens
- `organization` - Organization entities
- `member` - Organization memberships with roles
- `invitation` - Pending organization invitations

## 🚦 Migration Commands

```bash
# Generate database migration
bun run db:generate

# Apply migrations
bun run db:migrate

# Push schema to database
bun run db:push
```

## 🔍 Context Variables

The middleware adds the following to Hono context:

```typescript
interface ContextVariableMap {
  user: AuthUser; // Authenticated user
  session: AuthSession; // Current session
  organization?: Organization; // Current organization (if applicable)
  organizationMember?: OrganizationMember; // User's membership info
}
```

## 🛠️ Development

### Start Development Server

```bash
bun run dev
```

### Build for Production

```bash
bun run build
bun run start
```

### API Documentation

Visit `http://localhost:9999/api/reference` for Scalar API documentation.

## 🔗 Better Auth Documentation

For more advanced features and configuration options, refer to:

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Hono Integration Guide](https://www.better-auth.com/docs/integrations/hono)
- [Organization Plugin](https://www.better-auth.com/docs/plugins/organization)

## 🎯 Next Steps

Consider implementing:

- [ ] Email verification for new users
- [ ] Social authentication providers (GitHub, Google, etc.)
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Audit logging for organization actions
- [ ] Custom organization roles and permissions
- [ ] Organization billing and subscription management

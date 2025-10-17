import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

/**
 * @usage
 *
 * Example to check user permissions on the server:
 *
 * ```ts
 * const data = await auth.api.userHasPermission({
 *   body: {
 *     userId: "user-id",
 *     role: "admin", // server-only
 *     permissions: { project: ["create", "update"] }
 *   },
 * });
 * ```
 *
 * Example to check role permissions on the client (no await needed):
 *
 * ```ts
 * const canDeleteUserAndRevokeSession = authClient.admin.checkRolePermission({
 *   permissions: {
 *     user: ["delete"],
 *     session: ["revoke"]
 *   },
 *   role: "admin",
 * });
 * ```
 */

// prettier-ignore
/**
 * Permission statements for the ecommerce platform
 * Defines all available actions for each resource type
 */
const statement = {
  ...defaultStatements,
  user: [ "create", "read", "update", "delete", "list", "ban", "unban", "change_role"],

  product: ["create", "read", "update", "delete", "list", "publish", "unpublish", "manage_inventory"],

  order: ["create", "read", "update", "delete", "list", "cancel", "fulfill", "refund", "track"],

  category: ["create", "read", "update", "delete", "list", "reorder"],

  content: ["create", "read", "update", "delete", "list", "publish", "unpublish"],

  blog: ["create", "read", "update", "delete", "list", "publish", "unpublish"],

  discount: ["create", "read", "update", "delete", "list", "activate", "deactivate"],

  analytics: ["view_sales", "view_traffic", "view_customers", "view_products", "export_reports"],

  // system: ["configure", "backup", "restore", "maintenance", "view_logs"],

  // payment: ["process", "refund", "view_transactions", "manage_methods"],

  // shipping: ["configure_methods", "calculate_rates", "track_shipments", "manage_zones"],

  review: ["create", "read", "update", "delete", "moderate", "respond"],

  coupon: ["create", "read", "update", "delete", "list", "validate"],

  inventory: ["view", "update", "track", "alert", "transfer"],

  support: ["view_tickets", "respond", "escalate", "close", "assign"],
} as const;

const ac = createAccessControl(statement);

// prettier-ignore
/**
 * SUPER_ADMIN Role - Full system access
 * Can perform all actions across all resources
 */
const superAdmin = ac.newRole({
  user: ["create", "read", "update", "delete", "list", "ban", "unban", "change_role"],
  product: ["create", "read", "update", "delete", "list", "publish", "unpublish", "manage_inventory"],
  order: ["create", "read", "update", "delete", "list", "cancel", "fulfill", "refund", "track"],
  category: ["create", "read", "update", "delete", "list", "reorder"],
  content: ["create", "read", "update", "delete", "list", "publish", "unpublish"],
  blog: ["create", "read", "update", "delete", "list", "publish", "unpublish"],
  discount: ["create", "read", "update", "delete", "list", "activate", "deactivate"],
  analytics: ["view_sales", "view_traffic", "view_customers", "view_products", "export_reports"],
  review: ["create", "read", "update", "delete", "moderate", "respond"],
  coupon: ["create", "read", "update", "delete", "list", "validate"],
  inventory: ["view", "update", "track", "alert", "transfer"],
  support: ["view_tickets", "respond", "escalate", "close", "assign"],
  session: ["delete", "list", "revoke"],
});

// prettier-ignore
/**
 * ADMIN Role - Regular administrator with elevated privileges
 * Can manage users, orders, products, and system settings
 */
const admin = ac.newRole({
  user: ["create", "read", "update", "delete", "list", "ban", "unban"],
  product: ["create", "read", "update", "delete", "list", "publish", "unpublish", "manage_inventory"],
  order: ["read", "update", "list", "cancel", "fulfill", "refund", "track"],
  category: ["create", "read", "update", "delete", "list", "reorder"],
  content: ["create", "read", "update", "delete", "list", "publish", "unpublish"],
  blog: ["create", "read", "update", "delete", "list", "publish", "unpublish"],
  discount: ["create", "read", "update", "delete", "list", "activate", "deactivate"],
  analytics: ["view_sales", "view_traffic", "view_customers", "view_products", "export_reports"],
  review: ["read", "moderate", "respond"],
  coupon: ["create", "read", "update", "delete", "list", "validate"],
  inventory: ["view", "update", "track", "alert", "transfer"],
  support: ["view_tickets", "respond", "escalate", "close", "assign"],
  session: ["delete", "list", "revoke"],
});

// prettier-ignore
/**
 * VENDOR Role - Seller who can manage their own products and orders
 * Can create, update, and manage their inventory
 */
const vendor = ac.newRole({
  user: ["read"], // Can only read their own profile
  product: ["create", "read", "update", "list", "publish", "unpublish", "manage_inventory"], // Own products only
  order: ["read", "update", "list", "fulfill", "track"], // Own orders only
  category: ["read", "list"], // Read-only access to categories
  content: [], // No content permissions
  blog: [], // No blog permissions
  discount: ["create", "read", "update", "delete", "list"], // Own discounts only
  analytics: ["view_sales", "view_products"], // Own analytics only
  review: ["read", "respond"], // Can respond to reviews of their products
  coupon: ["create", "read", "update", "delete", "list", "validate"], // Own coupons only
  inventory: ["view", "update", "track", "alert"], // Own inventory only
  support: [], // No support permissions
});

// prettier-ignore
/**
 * SALES_MANAGER Role - Manages sales operations, discounts, and promotions
 * Can view sales analytics and manage customer orders
 */
const salesManager = ac.newRole({
  user: ["read", "list"], // Can view customer information
  product: ["read", "list"], // Can view all products
  order: ["read", "update", "list", "cancel", "fulfill", "refund", "track"], // Full order management
  category: ["read", "list"], // Read-only access to categories
  content: [], // No content permissions
  blog: [], // No blog permissions
  discount: ["create", "read", "update", "delete", "list", "activate", "deactivate"], // Full discount management
  analytics: ["view_sales", "view_traffic", "view_customers", "view_products", "export_reports"], // Full analytics
  review: ["read", "moderate"], // Can moderate reviews
  coupon: ["create", "read", "update", "delete", "list", "validate"], // Full coupon management
  inventory: ["view", "track"], // Inventory visibility
  support: ["view_tickets", "respond", "close"], // Customer support
});

// prettier-ignore
/**
 * CONTENT_EDITOR Role - Manages website content, blogs, and product descriptions
 * Can create, edit, and publish content but cannot manage users or system settings
 */
const contentEditor = ac.newRole({
  user: ["read"], // Can only read their own profile
  product: ["read", "update", "list"], // Can edit product descriptions
  order: [], // No order permissions
  category: ["create", "read", "update", "list", "reorder"], // Category management
  content: ["create", "read", "update", "delete", "list", "publish", "unpublish"], // Full content management
  blog: ["create", "read", "update", "delete", "list", "publish", "unpublish"], // Full blog management
  discount: [], // No discount permissions
  analytics: [], // No analytics permissions
  review: ["read", "moderate", "respond"], // Can moderate and respond to reviews
  coupon: [], // No coupon permissions
  inventory: [], // No inventory permissions
  support: [], // No support permissions
});

// prettier-ignore
/**
 * CUSTOMER Role - Regular customer with standard shopping privileges
 * Can browse, purchase, and manage their own orders
 */
const customer = ac.newRole({
  user: ["read", "update"], // Can read and update their own profile
  product: ["read", "list"], // Can browse products
  order: ["create", "read", "list", "cancel"], // Can manage their own orders
  category: ["read", "list"], // Can view categories
  content: ["read"], // Can read content
  blog: ["read"], // Can read blog posts
  discount: ["read"], // Can view available discounts
  analytics: [], // No analytics permissions
  review: ["create", "read", "update"], // Can create and manage their own reviews
  coupon: ["validate"], // Can use coupons
  inventory: [], // No inventory permissions
  support: [], // No support permissions (customers create tickets through other means)
});

enum Roles {
  SUPER_ADMIN = "superAdmin",
  ADMIN = "admin",
  VENDOR = "vendor",
  SALES_MANAGER = "salesManager",
  CONTENT_EDITOR = "contentEditor",
  CUSTOMER = "customer",
  DEFAULT = CUSTOMER,
}

export {
  ac,
  superAdmin,
  admin,
  vendor,
  salesManager,
  contentEditor,
  customer,
  Roles,
};

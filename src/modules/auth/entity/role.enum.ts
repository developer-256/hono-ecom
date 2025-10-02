/**
 * User roles enum for the e-commerce application
 * Defines different access levels and permissions
 */
export enum Role {
  /**
   * Super administrator with full system access
   * Can manage all aspects of the application
   */
  SUPER_ADMIN = "super_admin",

  /**
   * Regular administrator with elevated privileges
   * Can manage users, orders, products, and system settings
   */
  ADMIN = "admin",

  /**
   * Vendor/Seller who can manage their own products and orders
   * Can create, update, and manage their inventory
   */
  VENDOR = "vendor",

  /**
   * Sales manager who can manage sales operations, discounts, and promotions
   * Can view sales analytics and manage customer orders
   */
  SALES_MANAGER = "sales_manager",

  /**
   * Content editor who can manage website content, blogs, and product descriptions
   * Can create, edit, and publish content but cannot manage users or system settings
   */
  CONTENT_EDITOR = "content_editor",

  /**
   * Regular customer with standard shopping privileges
   * Can browse, purchase, and manage their own orders
   */
  CUSTOMER = "customer",
}

/**
 * Default role for new user registrations
 */
export const DEFAULT_ROLE = Role.CUSTOMER;

/**
 * Role hierarchy for permission inheritance
 * Higher roles inherit permissions from lower roles
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.CUSTOMER]: 1,
  [Role.CONTENT_EDITOR]: 2,
  [Role.VENDOR]: 3,
  [Role.SALES_MANAGER]: 4,
  [Role.ADMIN]: 5,
  [Role.SUPER_ADMIN]: 6,
};

/**
 * Role descriptions for UI display
 */
export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: "Super Administrator - Full system access",
  [Role.ADMIN]: "Administrator - Elevated privileges",
  [Role.SALES_MANAGER]: "Sales Manager - Sales operations and analytics",
  [Role.VENDOR]: "Vendor - Product and inventory management",
  [Role.CONTENT_EDITOR]: "Content Editor - Website content management",
  [Role.CUSTOMER]: "Customer - Standard shopping access",
};

/**
 * Utility function to check if a role has higher or equal privileges than another
 */
export function hasRolePrivilege(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get all roles that can be assigned during registration
 * Typically excludes admin roles for security
 */
export function getAssignableRoles(): Role[] {
  return [Role.CUSTOMER, Role.VENDOR, Role.CONTENT_EDITOR, Role.SALES_MANAGER];
}

/**
 * Get all roles for admin management
 */
export function getAllRoles(): Role[] {
  return Object.values(Role);
}

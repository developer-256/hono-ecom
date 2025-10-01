import { db } from "@/db";
import { user } from "@/modules/user/entity/user.entity";
import { eq, and, desc, asc, or, ilike, count } from "drizzle-orm";
import type { UserTableType } from "@/modules/user/entity/user.entity";

export interface UserCreateData {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
  role?: "super-admin" | "admin" | "sales" | "writer" | "user";
}

export interface UserUpdateData {
  name?: string;
  image?: string;
  role?: "super-admin" | "admin" | "sales" | "writer" | "user";
}

export interface UserFilters {
  role?: string;
  emailVerified?: boolean;
  search?: string;
}

export class UserService {
  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<UserTableType | null> {
    try {
      const result = await db
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw new Error("Failed to retrieve user");
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<UserTableType | null> {
    try {
      const result = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw new Error("Failed to retrieve user");
    }
  }

  /**
   * Get all users with optional filters (admin only)
   */
  static async getUsers(
    filters: UserFilters = {},
    limit: number = 20,
    offset: number = 0
  ): Promise<{ users: UserTableType[]; total: number }> {
    try {
      // Apply filters
      const conditions: any[] = [];

      if (filters.role) {
        conditions.push(eq(user.role, filters.role));
      }

      if (filters.emailVerified !== undefined) {
        conditions.push(eq(user.emailVerified, filters.emailVerified));
      }

      if (filters.search) {
        // Case-insensitive search across name and email fields
        const searchTerm = `%${filters.search}%`;
        conditions.push(
          or(ilike(user.name, searchTerm), ilike(user.email, searchTerm))
        );
      }

      // Build the where clause
      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const totalResult = await db
        .select({ count: count() })
        .from(user)
        .where(whereClause);
      const total = totalResult[0]?.count || 0;

      // Get users with pagination
      const users = await db
        .select()
        .from(user)
        .where(whereClause)
        .orderBy(desc(user.createdAt))
        .limit(limit)
        .offset(offset);

      return { users, total };
    } catch (error) {
      console.error("Error getting users:", error);
      throw new Error("Failed to retrieve users");
    }
  }

  /**
   * Update user (for admin operations)
   */
  static async updateUser(
    id: string,
    updateData: UserUpdateData
  ): Promise<UserTableType | null> {
    try {
      const result = await db
        .update(user)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(user.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  /**
   * Delete user (admin only)
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await db.delete(user).where(eq(user.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Failed to delete user");
    }
  }

  /**
   * Get user stats (admin only)
   */
  static async getUserStats(): Promise<{
    total: number;
    verified: number;
    unverified: number;
    byRole: Record<string, number>;
  }> {
    try {
      const allUsers = await db.select().from(user);

      const stats = {
        total: allUsers.length,
        verified: allUsers.filter((u) => u.emailVerified).length,
        unverified: allUsers.filter((u) => !u.emailVerified).length,
        byRole: {} as Record<string, number>,
      };

      // Count by role
      allUsers.forEach((u) => {
        stats.byRole[u.role] = (stats.byRole[u.role] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw new Error("Failed to retrieve user statistics");
    }
  }

  /**
   * Check if user exists
   */
  static async userExists(email: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
      return result.length > 0;
    } catch (error) {
      console.error("Error checking user existence:", error);
      return false;
    }
  }

  /**
   * Get users by role (admin only)
   */
  static async getUsersByRole(role: string): Promise<UserTableType[]> {
    try {
      return await db
        .select()
        .from(user)
        .where(eq(user.role, role))
        .orderBy(asc(user.name));
    } catch (error) {
      console.error("Error getting users by role:", error);
      throw new Error("Failed to retrieve users by role");
    }
  }
}

export default UserService;

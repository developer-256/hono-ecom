import { createAuthClient } from "better-auth/client";
import env from "@/env";

// Create Better Auth client for client-side usage
export const authClient = createAuthClient({
  baseURL: env.BETTER_AUTH_URL,
});

// Export specific methods for convenience
export const { signIn, signUp, signOut, getSession, useSession } = authClient;

// Types for client-side usage
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];

import { createAuthClient } from "better-auth/client";
import env from "@/env";
import {
  ac,
  admin,
  contentEditor,
  customer,
  salesManager,
  superAdmin,
  vendor,
} from "../service/permissions";
import { adminClient } from "better-auth/client/plugins";

// Create Better Auth client for client-side usage
export const authClient = createAuthClient({
  baseURL: env.BETTER_AUTH_URL,
  plugins: [
    adminClient({
      ac,
      roles: {
        superAdmin,
        admin,
        vendor,
        salesManager,
        contentEditor,
        customer,
      },
    }),
  ],
});

// Export specific methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  getSession,
  useSession,
  resetPassword,
  changePassword,
  updateUser,
  verifyEmail,
  forgetPassword,
} = authClient;

// Google OAuth sign-in helper
export const signInWithGoogle = () =>
  authClient.signIn.social({ provider: "google" });

// Email/Password sign-in helper
export const signInWithEmail = (email: string, password: string) =>
  authClient.signIn.email({ email, password });

// Sign up helper
export const signUpWithEmail = (
  email: string,
  password: string,
  name: string
) => authClient.signUp.email({ email, password, name });

// Types for client-side usage
export type Session = typeof authClient.$Infer.Session;
export type User = Session["user"];

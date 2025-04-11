// auth/index.ts - Client-safe auth exports
import NextAuth from "next-auth";
import { authConfig } from "./config";

// Export the auth function for use in client components
export const { auth, signIn, signOut } = NextAuth(authConfig);

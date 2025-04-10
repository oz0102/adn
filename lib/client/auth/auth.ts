/**
 * Client-safe authentication utilities
 * This file contains authentication functions that are safe to use in client components
 */

import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

// Import only the types from the server config, not the implementation
import type { Session, User } from "next-auth";

// Client-side auth configuration (no MongoDB imports)
const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT, user?: User }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  }
};

// Export the auth function for use in client components
export const { auth, signIn, signOut } = NextAuth(authConfig);

// Export a hook for checking if user has required permissions
export function hasPermission(user: Session['user'] | null, permission: string): boolean {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
}

// Export a hook for checking if user has required role
export function hasRole(user: Session['user'] | null, role: string): boolean {
  if (!user || !user.role) return false;
  return user.role === role;
}

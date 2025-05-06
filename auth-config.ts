// auth-config.ts - Edge-compatible auth config
import type { NextAuthConfig } from "next-auth";
import type { JWT } from "next-auth/jwt"; // Import JWT type
import type { Session, User } from "next-auth"; // Import Session and User types
import { IAssignedRole } from "@/models/user"; // Import IAssignedRole

export const authConfig: NextAuthConfig = {
  providers: [], // Will be populated in auth.ts
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // When a new user signs in or JWT is created/updated
        token.id = user.id;
        // @ts-ignore // user from authorize callback will have assignedRoles
        token.email = user.email; 
        // @ts-ignore
        token.assignedRoles = user.assignedRoles; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        // @ts-ignore // session.user might not initially have assignedRoles type
        session.user.email = token.email as string; 
        // @ts-ignore
        session.user.assignedRoles = token.assignedRoles as IAssignedRole[];
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnProtectedApi = nextUrl.pathname.startsWith("/api/"); // Broaden to protect most API routes by default
      const isOnPublicAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isOnPublicPages = ["/login", "/register"].includes(nextUrl.pathname);

      if (isOnPublicAuthRoute || isOnPublicPages) {
        if (isLoggedIn && isOnPublicPages) {
          // If logged in and trying to access login/register, redirect to dashboard
          return Response.redirect(new URL("/dashboard", nextUrl.origin));
        }
        return true; // Allow access to auth API routes and public pages
      }

      if ((isOnDashboard || isOnProtectedApi) && !isLoggedIn) {
        return false; // Redirect to login page if not logged in and accessing protected routes
      }

      return true; // Allow by default if none of the above conditions met
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-only"
};

// Type augmentation for NextAuth to include assignedRoles
// This should ideally be in a global .d.ts file or a specific next-auth.d.ts file
// For now, placing it here for clarity, but it might need to be moved.

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      assignedRoles: IAssignedRole[];
    } & User; // Ensure User from next-auth is extended
  }

  interface User {
    assignedRoles: IAssignedRole[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    assignedRoles: IAssignedRole[];
  }
}


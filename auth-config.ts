// auth-config.ts - Edge-compatible auth config
import type { NextAuthConfig, User as NextAuthUser, Session as NextAuthSession } from "next-auth";
import type { JWT as NextAuthJWT } from "next-auth/jwt";
import { IAssignedRole } from "@/models/user"; // Import IAssignedRole

// Define custom types by extending NextAuth types
interface CustomUser extends NextAuthUser {
  id: string; // Ensure id is always a string
  email?: string | null;
  assignedRoles?: IAssignedRole[]; // Make optional if not always present from authorize
}

interface CustomJWT extends NextAuthJWT {
  id: string;
  email?: string | null;
  assignedRoles?: IAssignedRole[];
}

interface CustomSession extends NextAuthSession {
  user?: {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    assignedRoles?: IAssignedRole[];
  } & Omit<NextAuthUser, "id">; // Omit NextAuthUser id to avoid conflict, use our string id
}

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
    async jwt({ token, user }: { token: CustomJWT; user?: CustomUser | NextAuthUser }) {
      if (user) {
        // When a new user signs in or JWT is created/updated
        // The `user` object is the one returned from the `authorize` callback
        token.id = user.id as string; // Ensure user.id is string
        token.email = user.email; // email is already optional in CustomUser
        // Check if 'assignedRoles' exists on user before assigning
        if ('assignedRoles' in user && user.assignedRoles) {
            token.assignedRoles = user.assignedRoles as IAssignedRole[];
        }
      }
      return token;
    },
    async session({ session, token }: { session: CustomSession; token: CustomJWT }) {
      if (token && session.user) {
        session.user.id = token.id; // id is string in CustomJWT
        session.user.email = token.email;
        if (token.assignedRoles) {
            session.user.assignedRoles = token.assignedRoles;
        }
      }
      return session;
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnProtectedApi = nextUrl.pathname.startsWith("/api/");
      const isOnPublicAuthRoute = nextUrl.pathname.startsWith("/api/auth");
      const isOnPublicPages = ["/login", "/register"].includes(nextUrl.pathname);

      if (isOnPublicAuthRoute || isOnPublicPages) {
        if (isLoggedIn && isOnPublicPages) {
          return Response.redirect(new URL("/dashboard", nextUrl.origin));
        }
        return true;
      }

      if ((isOnDashboard || isOnProtectedApi) && !isLoggedIn) {
        // For API routes that are not auth routes, return a 401 if not logged in
        if (isOnProtectedApi && !isOnPublicAuthRoute) {
            // Temporarily allow GET requests for some API routes if needed for public data, 
            // otherwise, this should be false to protect all non-auth API routes.
            // For now, let's assume all non /api/auth routes are protected.
            // if (request.method === "GET") return true; // Example: allow public GETs
            return false; // Deny access
        }
        return false; // Redirect to login page for dashboard
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-only",
};

// Type augmentation for NextAuth to include custom properties
// This should be in a next-auth.d.ts file in the project root or types directory.
// For this exercise, it's included here. Ensure it's correctly picked up by TypeScript.

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      assignedRoles?: IAssignedRole[];
    } & NextAuthUser; // Extend the default User type
  }

  interface User extends NextAuthUser {
    assignedRoles?: IAssignedRole[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    id: string;
    assignedRoles?: IAssignedRole[];
  }
}


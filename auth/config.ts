// auth/config.ts - Client-safe auth configuration
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  // Configure different authentication providers
  providers: [],
  // Session configuration
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Custom pages
  pages: {
    signIn: "/login",
    error: "/login"
  },
  // Callbacks
  callbacks: {
    // JWT callback to handle adding custom fields to the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    // Session callback to add data to the session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
    // Authorized callback to check if the user is authorized
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnProtectedApi = nextUrl.pathname.startsWith('/api/protected');
      const isOnPublicRoute = ['/login', '/register'].includes(nextUrl.pathname) || 
                             nextUrl.pathname.startsWith('/api/auth');
      
      // If accessing dashboard or protected API, must be logged in
      if ((isOnDashboard || isOnProtectedApi) && !isLoggedIn) {
        return false; // Redirect to login page
      }

      // If logged in and trying to access login/register page, redirect to dashboard
      if (isOnPublicRoute && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl.origin));
      }

      return true;
    },
  },
  // Secret key for signing/encrypting tokens
  secret: process.env.NEXTAUTH_SECRET
};

// Export types to ensure type safety
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      permissions: string[];
    }
  }
  interface User {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  }
}

// Export types for JWT
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    permissions: string[];
  }
}

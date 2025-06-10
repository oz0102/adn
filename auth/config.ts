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
        console.log("User object in JWT callback:", JSON.stringify(user, null, 2));
        token.id = user.id;
        token.email = user.email;
        token.assignedRoles = user.assignedRoles;
      }
      return token;
    },
    // Session callback to add data to the session
    async session({ session, token }) {
      console.log("Token object in session callback:", JSON.stringify(token, null, 2));
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.assignedRoles = token.assignedRoles as any;
      }
      return session;
    },
    // Authorized callback to check if the user is authorized
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Updated to include /centers and /clusters for protected dashboard routes
      const isOnDashboardArea = nextUrl.pathname.startsWith('/dashboard') ||
                               nextUrl.pathname.startsWith('/centers') ||
                               nextUrl.pathname.startsWith('/clusters');
      const isOnProtectedApi = nextUrl.pathname.startsWith('/api/protected'); // Assuming this is a generic protected API path
      const isOnPublicRoute = ['/login', '/register'].includes(nextUrl.pathname) || 
                             nextUrl.pathname.startsWith('/api/auth');
      
      console.log("Auth user in authorized callback:", JSON.stringify(auth?.user, null, 2));

      // If accessing dashboard areas or protected API, must be logged in
      if ((isOnDashboardArea || isOnProtectedApi) && !isLoggedIn) {
        return false; // Redirect to login page
      }

      // If logged in and trying to access login/register page, redirect to the main dashboard
      if (isOnPublicRoute && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl.origin));
      }

      // Specific redirection for roles if accessing the main /dashboard path
      if (isLoggedIn && (nextUrl.pathname === '/dashboard' || nextUrl.pathname === '/dashboard/')) {
        const userRoles = auth.user.assignedRoles;
        if (userRoles && Array.isArray(userRoles)) {
          // Prioritize CLUSTER_LEADER redirect if applicable
          for (const assignedRole of userRoles) {
            if (assignedRole.role === "CLUSTER_LEADER" && assignedRole.clusterId) {
              const redirectUrl = `/clusters/${assignedRole.clusterId}/dashboard`;
              console.log("Redirecting CLUSTER_LEADER to:", redirectUrl);
              return Response.redirect(new URL(redirectUrl, nextUrl.origin));
            }
          }
          // Then check for CENTER_ADMIN if not already redirected
          for (const assignedRole of userRoles) {
            if (assignedRole.role === "CENTER_ADMIN" && assignedRole.centerId) {
              const redirectUrl = `/centers/${assignedRole.centerId}/dashboard`;
              console.log("Redirecting CENTER_ADMIN to:", redirectUrl);
              return Response.redirect(new URL(redirectUrl, nextUrl.origin));
            }
          }
        }
      }
      // Allow access if none of the above conditions caused a redirect or denial
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
      assignedRoles: { role: string; centerId?: string; clusterId?: string; smallGroupId?: string; }[];
    }
  }
  interface User {
    id: string;
    email: string;
    assignedRoles: { role: string; centerId?: string; clusterId?: string; smallGroupId?: string; }[];
  }
}

// Export types for JWT
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    assignedRoles: { role: string; centerId?: string; clusterId?: string; smallGroupId?: string; }[];
  }
}

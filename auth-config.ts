// auth-config.ts - Edge-compatible auth config
import type { NextAuthConfig } from "next-auth";

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
    // Note: We're not using type augmentation in this file
    // to avoid Edge compatibility issues
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnProtectedApi = nextUrl.pathname.startsWith('/api/protected');
      const isOnPublicRoute = ['/login', '/register'].includes(nextUrl.pathname) || 
                             nextUrl.pathname.startsWith('/api/auth');
      
      if ((isOnDashboard || isOnProtectedApi) && !isLoggedIn) {
        return false; // Redirect to login page
      }

      if (isOnPublicRoute && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl.origin));
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-only"
};
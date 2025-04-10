/**
 * Server-side only authentication configuration
 * This file should never be imported by client-side code
 */

import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { userRepository } from '@/lib/server/db/repositories/user-repository';

// Verify we're on the server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

/**
 * Auth.js configuration for server-side only
 */
export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }
          
          // Use the user repository to verify credentials
          const user = await userRepository.verifyCredentials(
            credentials.email,
            credentials.password
          );
          
          if (!user) {
            console.log("Invalid credentials for user:", credentials.email);
            return null;
          }
          
          // Return user data
          console.log("Authentication successful for:", credentials.email);
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            permissions: user.permissions || []
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
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
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
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

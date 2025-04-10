// lib/auth.ts
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb";
import { compare } from "bcryptjs";
import User from "@/models/user";
import connectToDatabase from "./db";

// Define your auth config
export const authConfig: NextAuthConfig = {
  // Configure different authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign-in form (e.g., "Sign in with...")
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // The authorize function is used to verify credentials
      async authorize(credentials) {
        try {
          await connectToDatabase();
          
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }
          
          // Find the user
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }
          
          // Verify password
          const isPasswordValid = await compare(
            credentials.password,
            user.passwordHash
          );
          
          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
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
  // Adapter configuration
  adapter: MongoDBAdapter(clientPromise),
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

// Export the auth function for use in middleware
export const { auth, signIn, signOut } = NextAuth(authConfig);
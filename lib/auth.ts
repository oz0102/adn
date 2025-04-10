import type { NextAuthOptions as AuthOptions } from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import clientPromise from "./mongodb";
import User from "@/models/user";
import connectToDatabase from "./db";
import { User as UserType } from "@/types";

// Define types for NextAuth
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
    id?: string;
    email?: string | null;
    role?: string;
    permissions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    permissions: string[];
  }
}

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          await connectToDatabase();
          
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }
          
          const isPasswordValid = await compare(
            credentials.password,
            user.passwordHash
          );
          
          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }
          
          // Update last login time
          await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date()
          });
          
          console.log("User authenticated successfully:", credentials.email);
          
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            permissions: user.permissions || [],
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.permissions = user.permissions;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
      }
      return session;
    },
  },
};

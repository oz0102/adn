// app/api/auth/[...nextauth]/route.ts - Server-side auth handler
import { NextRequest } from "next/server";
import { authConfig } from "@/auth/config";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import connectToDatabase from "@/lib/db";
import User from "@/models/user";

// Create a server-side only auth handler with credentials provider
// Remove MongoDB adapter to avoid binary dependency issues
const handler = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
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
  ]
});

// Export the handler as GET and POST functions
export { handler as GET, handler as POST };

// // auth.ts - Root level auth configuration
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { compare } from "bcryptjs";
// import type { NextAuthConfig } from "next-auth";
// import type { JWT } from "next-auth/jwt";

// // Create the credentials provider configuration
// const credentialsProvider = CredentialsProvider({
//   name: "Credentials",
//   credentials: {
//     email: { label: "Email", type: "email" },
//     password: { label: "Password", type: "password" }
//   },
//   async authorize(credentials) {
//     // This function is only executed on the server
//     if (!credentials?.email || !credentials?.password) {
//       console.log("Missing credentials");
//       return null;
//     }

//     try {
//       // Import server-side only modules dynamically
//       const { default: connectToDatabase } = await import("@/lib/db");
//       const { default: User } = await import("@/models/user");
      
//       await connectToDatabase();
      
//       // Find the user
//       const user = await User.findOne({ email: credentials.email.toLowerCase() });
      
//       if (!user) {
//         console.log("User not found:", credentials.email);
//         return null;
//       }
      
//       // Verify password
//       const isPasswordValid = await compare(
//         credentials.password,
//         user.passwordHash
//       );
      
//       if (!isPasswordValid) {
//         console.log("Invalid password for user:", credentials.email);
//         return null;
//       }
      
//       // Return user data
//       console.log("Authentication successful for:", credentials.email);
//       return {
//         id: user._id.toString(),
//         email: user.email,
//         role: user.role,
//         permissions: user.permissions || []
//       };
//     } catch (error) {
//       console.error("Authentication error:", error);
//       return null;
//     }
//   }
// });

// // Auth.js configuration
// export const authConfig: NextAuthConfig = {
//   // Session configuration
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   // Custom pages
//   pages: {
//     signIn: "/login",
//     error: "/login"
//   },
//   // Callbacks
//   callbacks: {
//     // JWT callback to handle adding custom fields to the JWT
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.email = user.email;
//         token.role = user.role;
//         token.permissions = user.permissions;
//       }
//       return token;
//     },
//     // Session callback to add data to the session
//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.id as string;
//         session.user.email = token.email as string;
//         session.user.role = token.role as string;
//         session.user.permissions = token.permissions as string[];
//       }
//       return session;
//     },
//     // Authorized callback to check if the user is authorized
//     authorized({ auth, request: { nextUrl } }) {
//       const isLoggedIn = !!auth?.user;
//       const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
//       const isOnProtectedApi = nextUrl.pathname.startsWith('/api/protected');
//       const isOnPublicRoute = ['/login', '/register'].includes(nextUrl.pathname) || 
//                              nextUrl.pathname.startsWith('/api/auth');
      
//       // If accessing dashboard or protected API, must be logged in
//       if ((isOnDashboard || isOnProtectedApi) && !isLoggedIn) {
//         return false; // Redirect to login page
//       }

//       // If logged in and trying to access login/register page, redirect to dashboard
//       if (isOnPublicRoute && isLoggedIn) {
//         return Response.redirect(new URL('/dashboard', nextUrl.origin));
//       }

//       return true;
//     },
//   },
//   // Secret key for signing/encrypting tokens
//   secret: process.env.NEXTAUTH_SECRET
// };

// // Export the auth function for use in client components
// export const { auth, signIn, signOut, handlers } = NextAuth({
//   ...authConfig,
//   providers: [credentialsProvider]
// });

// // Export types to ensure type safety
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       email: string;
//       role: string;
//       permissions: string[];
//     }
//   }
//   interface User {
//     id: string;
//     email: string;
//     role: string;
//     permissions: string[];
//   }
// }

// // Export types for JWT
// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string;
//     role: string;
//     permissions: string[];
//   }
// }



// auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig } from "./auth-config";

// Create the credentials provider configuration
const credentialsProvider = CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    // Type safety for credentials
    const email = credentials?.email as string;
    const password = credentials?.password as string;
    
    if (!email || !password) {
      console.log("Missing credentials");
      return null;
    }

    try {
      // Import server-side only modules dynamically
      const { default: connectToDatabase } = await import("@/lib/db");
      const { default: User } = await import("@/models/user");
      
      await connectToDatabase();
      
      // Find the user
      const user = await User.findOne({ email: email.toLowerCase() });
      
      if (!user) {
        console.log("User not found:", email);
        return null;
      }
      
      // Verify password
      const isPasswordValid = await compare(
        password,
        user.passwordHash
      );
      
      if (!isPasswordValid) {
        console.log("Invalid password for user:", email);
        return null;
      }
      
      // Return user data
      console.log("Authentication successful for:", email);
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
});

// Export the auth function for use in client components
export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [credentialsProvider]
});
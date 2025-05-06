// auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig } from "./auth-config"; // Ensure this path is correct
import User, { IUser, IAssignedRole } from "@/models/user"; // Import IUser and IAssignedRole
import { connectToDB } from "@/lib/mongodb"; // Ensure this path is correct

// Create the credentials provider configuration
const credentialsProvider = CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    const email = credentials?.email as string;
    const password = credentials?.password as string;
    
    if (!email || !password) {
      console.log("Missing credentials");
      return null;
    }

    try {
      await connectToDB();
      
      const user: IUser | null = await User.findOne({ email: email.toLowerCase() }).lean(); // Use lean for plain JS object
      
      if (!user) {
        console.log("User not found:", email);
        return null;
      }
      
      const isPasswordValid = await compare(
        password,
        user.passwordHash
      );
      
      if (!isPasswordValid) {
        console.log("Invalid password for user:", email);
        return null;
      }
      
      console.log("Authentication successful for:", email);
      // Return data that will be available in the JWT and session
      return {
        id: user._id.toString(),
        email: user.email,
        assignedRoles: user.assignedRoles // Pass the assignedRoles array
      };
    } catch (error) {
      console.error("Authentication error:", error);
      return null;
    }
  }
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [credentialsProvider]
});


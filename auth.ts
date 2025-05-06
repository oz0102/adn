// auth.ts
import NextAuth, { User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig } from "./auth-config"; // Ensure this path is correct
import UserModel, { IUser, IAssignedRole } from "@/models/user"; // Renamed User to UserModel to avoid conflict with NextAuthUser
import { connectToDB } from "@/lib/mongodb"; // Corrected: Changed to named import.

// Create the credentials provider configuration
const credentialsProvider = CredentialsProvider({
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials, req) { // Added req parameter
    const email = credentials?.email as string;
    const password = credentials?.password as string;
    
    if (!email || !password) {
      console.log("Missing credentials");
      return null;
    }

    try {
      await connectToDB();
      
      const dbUser = await UserModel.findOne({ email: email.toLowerCase() }).lean<IUser>();
      
      if (!dbUser) {
        console.log("User not found:", email);
        return null;
      }
      
      const isPasswordValid = await compare(
        password,
        dbUser.passwordHash
      );
      
      if (!isPasswordValid) {
        console.log("Invalid password for user:", email);
        return null;
      }
      
      console.log("Authentication successful for:", email);
      
      return {
        id: dbUser._id.toString(), 
        email: dbUser.email,
        name: `${dbUser.firstName} ${dbUser.lastName}`,
        assignedRoles: dbUser.assignedRoles, 
      } as NextAuthUser & { assignedRoles: IAssignedRole[]; email: string; name: string | null }; 

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


// auth.ts
import NextAuth, { User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig } from "./auth-config"; // Ensure this path is correct
import UserModel, { IUser, IAssignedRole } from "@/models/user"; // Renamed User to UserModel to avoid conflict with NextAuthUser
import connectToDB from "@/lib/mongodb"; // Ensure this path is correct. Changed to default import.

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
      
      // Explicitly type the result of lean query
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
      
      // The object returned here is passed to the jwt callback's `user` parameter.
      // It should conform to what NextAuth expects or what your jwt callback processes.
      // The base NextAuthUser requires 'id'. Other properties are optional or can be added.
      return {
        id: dbUser._id.toString(), // _id should be defined on IUser and be stringifiable
        email: dbUser.email,
        name: `${dbUser.firstName} ${dbUser.lastName}`, // Optional: construct name if needed by NextAuthUser
        assignedRoles: dbUser.assignedRoles, // Custom property
        // If 'role' and 'permissions' are strictly required by an augmented NextAuthUser type for authorize:
        // role: "user", // Placeholder or derive if necessary
        // permissions: [], // Placeholder or derive if necessary
      } as NextAuthUser & { assignedRoles: IAssignedRole[]; email: string; name: string | null }; // Cast to satisfy NextAuthUser and include custom props

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


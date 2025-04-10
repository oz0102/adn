// auth.ts - Client-safe auth exports
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// For server-side only code that needs MongoDB
export const getServerAuthConfig = async () => {
  // Dynamically import MongoDB adapter only on server
  if (typeof window === 'undefined') {
    const { MongoDBAdapter } = await import("@auth/mongodb-adapter");
    const { default: clientPromise } = await import("./lib/mongodb");
    
    return {
      ...authConfig,
      adapter: MongoDBAdapter(clientPromise)
    };
  }
  
  return authConfig;
};

// Export the auth function for use in middleware and client components
export const { auth, signIn, signOut } = NextAuth(authConfig);

// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

// Use the handler pattern from Auth.js v5
const handler = NextAuth(authConfig);

// Export as route handlers
export { handler as GET, handler as POST };
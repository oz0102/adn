/**
 * Server-side authentication route handler
 * This file implements the NextAuth API routes with proper server-side MongoDB integration
 */

import NextAuth from "next-auth";
import { authConfig } from "@/lib/server/auth/config";
import { getMongoDBAdapter } from "@/lib/server/auth/adapter";

/**
 * Get the NextAuth handler with server-side MongoDB adapter
 */
async function getAuthHandler() {
  // Dynamically add the MongoDB adapter on the server side
  const adapter = await getMongoDBAdapter();
  
  // Merge the adapter with the auth config
  const config = {
    ...authConfig,
    adapter
  };
  
  // Return the NextAuth handler
  return NextAuth(config);
}

/**
 * GET handler for NextAuth
 */
export async function GET(req: Request) {
  const handler = await getAuthHandler();
  return handler.GET(req);
}

/**
 * POST handler for NextAuth
 */
export async function POST(req: Request) {
  const handler = await getAuthHandler();
  return handler.POST(req);
}

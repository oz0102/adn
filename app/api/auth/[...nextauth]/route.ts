// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { getServerAuthConfig } from "@/auth";

// Use the handler pattern from Auth.js v5 with server-side config
const getHandler = async () => {
  const serverAuthConfig = await getServerAuthConfig();
  return NextAuth(serverAuthConfig);
};

// Export as route handlers
export async function GET(req: Request) {
  const handler = await getHandler();
  return handler.GET(req);
}

export async function POST(req: Request) {
  const handler = await getHandler();
  return handler.POST(req);
}

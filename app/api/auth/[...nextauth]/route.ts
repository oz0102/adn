// app/api/auth/[...nextauth]/route.ts - Server-side auth handler
import { handlers } from "@/auth";

// Export the handler as GET and POST functions
export const { GET, POST } = handlers;

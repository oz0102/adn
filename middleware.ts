// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "./auth";

export default auth((req) => {
  // Auth.js v5 handles authorization through the authorized callback in config
  // This middleware is now simplified and just returns next()
  return NextResponse.next();
});

// Skip middleware for these paths
export const config = {
  matcher: [
    // Match all paths except those that start with:
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

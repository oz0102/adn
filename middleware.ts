// middleware.ts
import { NextResponse } from "next/server";
import { auth } from "./lib/auth";

// export default auth;

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  
  // Define routes that require authentication
  const protectedRoutes = ["/dashboard", "/api/protected"];
  
  // Define public routes
  const publicRoutes = ["/login", "/register", "/api/auth"];
  
  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // If the route is public, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // If the user is not authenticated and tries to access a protected route,
  // redirect to the login page
  if (isProtectedRoute && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }
  
  // For all other cases, proceed normally
  return NextResponse.next();
});

// Skip middleware for these paths
export const config = {
  matcher: [
    // Match all paths except those that start with:
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
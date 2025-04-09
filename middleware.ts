import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is for the API
  const isApiPath = pathname.startsWith('/api');
  
  // Check if the path is for authentication
  const isAuthPath = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/forgot-password');
  
  // Check if the path is for public assets
  const isPublicPath = 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon.ico');
  
  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Get the token
  const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
  
  // If the user is not authenticated and trying to access a protected route
  if (!token && !isAuthPath) {
    // Redirect to login page
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // If the user is authenticated and trying to access an auth route
  if (token && isAuthPath) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If it's an API path, check for authentication
  if (isApiPath && !pathname.startsWith('/api/auth') && !token) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication required' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

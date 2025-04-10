// lib/api/with-error-handler.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ApiErrorResponse, handleApiError } from '@/lib/error-handler';
import connectToDatabase from '@/lib/db';

type ApiHandler = (req: NextRequest, params?: any) => Promise<NextResponse>;

/**
 * Higher-order function that wraps an API route handler with standard error handling and authentication
 * @param handler The API route handler function
 * @param options Configuration options
 * @returns A wrapped handler with error handling and authentication
 */
export function withApiHandler(
  handler: ApiHandler,
  options: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    connectDb?: boolean;
  } = {}
) {
  const { requireAuth = true, requireAdmin = false, connectDb = true } = options;

  return async (req: NextRequest, params?: any): Promise<NextResponse> => {
    try {
      // Connect to database if needed
      if (connectDb) {
        await connectToDatabase();
      }

      // Check authentication if required
      if (requireAuth) {
        const token = await getToken({ 
          req, 
          secret: process.env.NEXTAUTH_SECRET 
        });
        
        if (!token) {
          throw ApiErrorResponse.unauthorized();
        }

        // Check admin role if required
        if (requireAdmin && token.role !== 'Admin') {
          throw ApiErrorResponse.forbidden('Admin access required');
        }
      }

      // Call the original handler
      return await handler(req, params);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

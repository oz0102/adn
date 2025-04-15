// app/api/route-wrapper.ts
// A utility to wrap API routes and handle MongoDB-related errors

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/shared/types/user';

type RouteParams = {
  params?: {
    id?: string;
    [key: string]: string | undefined;
  };
};

type RouteHandler<T> = (req: NextRequest, params?: RouteParams) => Promise<NextResponse<ApiResponse<T>>>;

/**
 * Wraps API route handlers to ensure MongoDB operations are properly isolated
 * and errors are handled consistently
 */
export function withMongoDBHandler<T>(handler: RouteHandler<T>): RouteHandler<T> {
  return async (req: NextRequest, params?: RouteParams) => {
    try {
      // Call the original handler
      return await handler(req, params);
    } catch (error) {
      console.error('API route error:', error);
      
      // Create a standardized error response
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'An unknown error occurred'
        }
      };
      
      return NextResponse.json(response, { status: 500 });
    }
  };
}

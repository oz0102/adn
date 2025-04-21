// lib/error-handler.ts
import { NextResponse } from 'next/server';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class ApiErrorResponse extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;

  constructor(error: ApiError) {
    super(error.message);
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
    this.name = 'ApiErrorResponse';
  }

  static badRequest(message: string, details?: Record<string, unknown>): ApiErrorResponse {
    return new ApiErrorResponse({
      status: 400,
      code: 'BAD_REQUEST',
      message,
      details,
    });
  }

  static unauthorized(message: string = 'Not authenticated', details?: Record<string, unknown>): ApiErrorResponse {
    return new ApiErrorResponse({
      status: 401,
      code: 'UNAUTHORIZED',
      message,
      details,
    });
  }

  static forbidden(message: string = 'Access denied', details?: Record<string, unknown>): ApiErrorResponse {
    return new ApiErrorResponse({
      status: 403,
      code: 'FORBIDDEN',
      message,
      details,
    });
  }

  static notFound(message: string = 'Resource not found', details?: Record<string, unknown>): ApiErrorResponse {
    return new ApiErrorResponse({
      status: 404,
      code: 'NOT_FOUND',
      message,
      details,
    });
  }

  static conflict(message: string, details?: Record<string, unknown>): ApiErrorResponse {
    return new ApiErrorResponse({
      status: 409,
      code: 'CONFLICT',
      message,
      details,
    });
  }

  static validationError(message: string = 'Validation error', details?: Record<string, unknown>): ApiErrorResponse {
    return new ApiErrorResponse({
      status: 422,
      code: 'VALIDATION_ERROR',
      message,
      details,
    });
  }

  static serverError(message: string = 'Internal server error', details?: Record<string, unknown>): ApiErrorResponse {
    return new ApiErrorResponse({
      status: 500,
      code: 'SERVER_ERROR',
      message,
      details,
    });
  }

  toResponse(): NextResponse {
    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: this.code,
          message: this.message,
          details: this.details,
        }
      },
      { status: this.status }
    );
  }
}

/**
 * Handles API errors and returns a standardized NextResponse
 * @param error The error to handle
 * @returns NextResponse with appropriate status code and error details
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof ApiErrorResponse) {
    return error.toResponse();
  }
  
  // Handle validation errors from mongoose
  if (error instanceof Error && error.name === 'ValidationError') {
    return new ApiErrorResponse({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
      details: { message: error.message },
    }).toResponse();
  }
  
  // Handle other known error types
  if (error instanceof Error) {
    if (error.message.includes('duplicate key')) {
      return new ApiErrorResponse({
        status: 409,
        code: 'CONFLICT',
        message: 'Resource already exists',
        details: { message: error.message },
      }).toResponse();
    }
    
    return new ApiErrorResponse({
      status: 500,
      code: 'SERVER_ERROR',
      message: error.message || 'Internal server error',
    }).toResponse();
  }
  
  // Default server error for unknown error types
  return new ApiErrorResponse({
    status: 500,
    code: 'SERVER_ERROR',
    message: 'Internal server error',
  }).toResponse();
}

/**
 * Wraps an API handler function with error handling
 * @param handler The API handler function to wrap
 * @returns A wrapped function that handles errors
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Export errorHandler as an alias for handleApiError to maintain compatibility
 * with existing imports
 */
export const errorHandler = handleApiError;

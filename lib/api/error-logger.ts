// lib/api/error-logger.ts
import { ApiErrorResponse } from '@/lib/error-handler';

interface ErrorLogEntry {
  timestamp: string;
  code: string;
  message: string;
  stack?: string;
  details?: Record<string, unknown>;
  url?: string;
  method?: string;
  userId?: string;
}

/**
 * Utility for logging errors in a standardized format
 */
export class ErrorLogger {
  /**
   * Log an error to the console and potentially to a monitoring service
   * @param error The error to log
   * @param context Additional context information
   */
  static logError(
    error: Error | ApiErrorResponse | unknown,
    context: {
      url?: string;
      method?: string;
      userId?: string;
      additionalInfo?: Record<string, unknown>;
    } = {}
  ): void {
    const { url, method, userId, additionalInfo } = context;
    
    const logEntry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      url,
      method,
      userId,
    };
    
    if (error instanceof ApiErrorResponse) {
      logEntry.code = error.code;
      logEntry.message = error.message;
      logEntry.details = error.details;
    } else if (error instanceof Error) {
      logEntry.code = error.name;
      logEntry.message = error.message;
      logEntry.stack = error.stack;
    } else if (typeof error === 'string') {
      logEntry.message = error;
    }
    
    // Add any additional context information
    if (additionalInfo) {
      logEntry.details = { ...logEntry.details, ...additionalInfo };
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ERROR:', logEntry);
    }
    
    // In production, you would send this to a logging service
    // For example: sendToLoggingService(logEntry);
  }
  
  /**
   * Log an API request error
   * @param error The error that occurred
   * @param req The request object
   * @param userId Optional user ID
   */
  static logApiError(
    error: Error | ApiErrorResponse | unknown,
    req: Request,
    userId?: string
  ): void {
    this.logError(error, {
      url: req.url,
      method: req.method,
      userId,
      additionalInfo: {
        headers: Object.fromEntries(req.headers),
      },
    });
  }
  
  /**
   * Log a client-side error
   * @param error The error that occurred
   * @param componentName The name of the component where the error occurred
   * @param userId Optional user ID
   */
  static logClientError(
    error: Error | ApiErrorResponse | unknown,
    componentName: string,
    userId?: string
  ): void {
    this.logError(error, {
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      additionalInfo: {
        component: componentName,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
      userId,
    });
  }
}

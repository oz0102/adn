// components/ui/error-alert.tsx
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { AlertCircle } from 'lucide-react';
import { ApiErrorResponse } from '@/lib/error-handler';

interface ErrorAlertProps {
  error: Error | ApiErrorResponse | string | null;
  title?: string;
  className?: string;
}

/**
 * Component for displaying error messages in a standardized format
 */
export function ErrorAlert({ error, title = 'Error', className }: ErrorAlertProps) {
  if (!error) return null;
  
  let errorMessage: string;
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof ApiErrorResponse) {
    errorMessage = error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = 'An unknown error occurred';
  }
  
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
}

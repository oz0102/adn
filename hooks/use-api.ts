// hooks/use-api.ts
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';
import { apiClient } from '@/lib/api/api-client';
import { ApiErrorResponse } from '@/lib/error-handler';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiErrorResponse) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

/**
 * Hook for making API requests with loading state and error handling
 */
export function useApi(options: UseApiOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiErrorResponse | null>(null);
  const { toast } = useToast();

  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
  } = options;

  const handleError = useCallback(
    (error: ApiErrorResponse) => {
      setError(error);
      
      if (showErrorToast) {
        toast({
          title: error.code,
          description: error.message,
          variant: 'destructive',
        });
      }
      
      if (onError) {
        onError(error);
      }
    },
    [onError, showErrorToast, toast]
  );

  const request = useCallback(
    async <T>(
      apiMethod: () => Promise<{ success: boolean; data?: T; error?: any }>
    ): Promise<T | null> => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiMethod();
        
        if (!response.success || response.error) {
          throw new ApiErrorResponse({
            status: 400,
            code: response.error?.code || 'REQUEST_FAILED',
            message: response.error?.message || 'Request failed',
            details: response.error?.details,
          });
        }
        
        if (showSuccessToast) {
          toast({
            title: 'Success',
            description: successMessage,
          });
        }
        
        if (onSuccess && response.data) {
          onSuccess(response.data);
        }
        
        return response.data || null;
      } catch (err) {
        if (err instanceof ApiErrorResponse) {
          handleError(err);
        } else if (err instanceof Error) {
          handleError(
            new ApiErrorResponse({
              status: 500,
              code: 'UNKNOWN_ERROR',
              message: err.message || 'An unknown error occurred',
            })
          );
        } else {
          handleError(
            new ApiErrorResponse({
              status: 500,
              code: 'UNKNOWN_ERROR',
              message: 'An unknown error occurred',
            })
          );
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [handleError, onSuccess, showSuccessToast, successMessage, toast]
  );

  const get = useCallback(
    <T>(url: string, params?: Record<string, string>) => {
      return request<T>(() => apiClient.get<T>(url, params));
    },
    [request]
  );

  const post = useCallback(
    <T>(url: string, data?: any) => {
      return request<T>(() => apiClient.post<T>(url, data));
    },
    [request]
  );

  const put = useCallback(
    <T>(url: string, data?: any) => {
      return request<T>(() => apiClient.put<T>(url, data));
    },
    [request]
  );

  const patch = useCallback(
    <T>(url: string, data?: any) => {
      return request<T>(() => apiClient.patch<T>(url, data));
    },
    [request]
  );

  const del = useCallback(
    <T>(url: string) => {
      return request<T>(() => apiClient.delete<T>(url));
    },
    [request]
  );

  return {
    isLoading,
    error,
    get,
    post,
    put,
    patch,
    delete: del,
  };
}

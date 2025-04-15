/**
 * Client-side API client
 * This file provides a client-side API client for making requests to the server
 */

interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Client for making API requests with standardized error handling
 */
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || '';
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  /**
   * Make a GET request
   * @param url The URL to request
   * @param params Optional query parameters
   * @returns Promise with the response data
   */
  async get<T>(url: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>('GET', `${url}${queryString}`);
  }

  /**
   * Make a POST request
   * @param url The URL to request
   * @param data The data to send
   * @returns Promise with the response data
   */
  async post<T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data);
  }

  /**
   * Make a PUT request
   * @param url The URL to request
   * @param data The data to send
   * @returns Promise with the response data
   */
  async put<T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data);
  }

  /**
   * Make a PATCH request
   * @param url The URL to request
   * @param data The data to send
   * @returns Promise with the response data
   */
  async patch<T>(url: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data);
  }

  /**
   * Make a DELETE request
   * @param url The URL to request
   * @returns Promise with the response data
   */
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url);
  }

  /**
   * Make a request with the specified method
   * @param method The HTTP method
   * @param url The URL to request
   * @param data Optional data to send
   * @returns Promise with the response data
   */
  private async request<T>(
    method: string,
    url: string,
    data?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    const fullUrl = this.baseUrl ? `${this.baseUrl}${url}` : url;
    
    try {
      const response = await fetch(fullUrl, {
        method,
        headers: this.headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error?.message || 'An unknown error occurred');
      }

      return responseData as ApiResponse<T>;
    } catch (error) {
      if (error instanceof Error) {
        // Network errors or other fetch errors
        return {
          success: false,
          error: {
            code: 'NETWORK_ERROR',
            message: error.message || 'Network error',
          }
        };
      }

      // Unknown errors
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
        }
      };
    }
  }
}

// Create a singleton instance for use throughout the application
export const apiClient = new ApiClient();

/**
 * Shared types for user data
 * These types can be used by both client and server code
 */

export interface UserData {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: string;
  permissions?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  role?: string;
  permissions?: string[];
}

export interface ChangePasswordRequest {
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserData;
  token?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

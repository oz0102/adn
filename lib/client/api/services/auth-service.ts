/**
 * Client API service for authentication
 * This file provides client-side functions for authentication operations
 */

import { apiClient } from '@/lib/client/api/api-client';
import { LoginRequest, CreateUserRequest, UserData, LoginResponse } from '@/lib/shared/types/user';

/**
 * Authentication service for client-side operations
 */
export const authService = {
  /**
   * Login user
   * @param credentials User credentials
   * @returns Login response
   */
  async login(credentials: LoginRequest) {
    return apiClient.post<LoginResponse>('/api/auth/login', credentials);
  },
  
  /**
   * Register new user
   * @param userData User data
   * @returns Created user
   */
  async register(userData: CreateUserRequest) {
    return apiClient.post<UserData>('/api/auth/register', userData);
  },
  
  /**
   * Get current user profile
   * @returns User data
   */
  async getProfile() {
    return apiClient.get<UserData>('/api/auth/profile');
  },
  
  /**
   * Update user password
   * @param userId User ID
   * @param password New password
   * @returns Updated user
   */
  async updatePassword(userId: string, password: string) {
    return apiClient.patch<UserData>(`/api/users/${userId}`, { password });
  }
};

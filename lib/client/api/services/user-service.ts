/**
 * Client API service for user operations
 * This file provides client-side functions for user management
 */

import { apiClient } from '@/lib/client/api/api-client';
import { UserData, CreateUserRequest, UpdateUserRequest } from '@/lib/shared/types/user';

/**
 * User service for client-side operations
 */
export const userService = {
  /**
   * Get all users
   * @param limit Maximum number of users to return
   * @param skip Number of users to skip (for pagination)
   * @returns List of users
   */
  async getUsers(limit: number = 100, skip: number = 0) {
    return apiClient.get<UserData[]>('/api/users', {
      limit: limit.toString(),
      skip: skip.toString()
    });
  },
  
  /**
   * Get user by ID
   * @param userId User ID
   * @returns User data
   */
  async getUserById(userId: string) {
    return apiClient.get<UserData>(`/api/users/${userId}`);
  },
  
  /**
   * Create new user
   * @param userData User data
   * @returns Created user
   */
  async createUser(userData: CreateUserRequest) {
    return apiClient.post<UserData>('/api/users', userData);
  },
  
  /**
   * Update user
   * @param userId User ID
   * @param userData User data to update
   * @returns Updated user
   */
  async updateUser(userId: string, userData: UpdateUserRequest) {
    return apiClient.put<UserData>(`/api/users/${userId}`, userData);
  },
  
  /**
   * Delete user
   * @param userId User ID
   * @returns Success status
   */
  async deleteUser(userId: string) {
    return apiClient.delete(`/api/users/${userId}`);
  }
};

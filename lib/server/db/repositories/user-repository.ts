/**
 * User repository - Server-side only
 * Handles all database operations for the User model
 */

import { connectToMongoose } from '../mongoose';
import UserModel, { IUser } from '../models/user';
import { compare } from 'bcryptjs';

// Verify we're on the server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

export interface CreateUserData {
  email: string;
  password: string;
  role: string;
  permissions?: string[];
}

export interface UpdateUserData {
  email?: string;
  role?: string;
  permissions?: string[];
}

/**
 * User repository for handling all user-related database operations
 */
export class UserRepository {
  /**
   * Create a new user
   * @param userData User data to create
   * @returns Created user
   */
  async createUser(userData: CreateUserData): Promise<IUser> {
    await connectToMongoose();
    
    const user = new UserModel({
      email: userData.email.toLowerCase(),
      passwordHash: userData.password, // Will be hashed by pre-save hook
      role: userData.role,
      permissions: userData.permissions || []
    });
    
    await user.save();
    return user;
  }
  
  /**
   * Find a user by ID
   * @param id User ID
   * @returns User or null if not found
   */
  async findById(id: string): Promise<IUser | null> {
    await connectToMongoose();
    return UserModel.findById(id);
  }
  
  /**
   * Find a user by email
   * @param email User email
   * @returns User or null if not found
   */
  async findByEmail(email: string): Promise<IUser | null> {
    await connectToMongoose();
    return UserModel.findOne({ email: email.toLowerCase() });
  }
  
  /**
   * Update a user
   * @param id User ID
   * @param userData User data to update
   * @returns Updated user
   */
  async updateUser(id: string, userData: UpdateUserData): Promise<IUser | null> {
    await connectToMongoose();
    
    const updateData: Record<string, unknown> = {};
    
    if (userData.email) updateData.email = userData.email.toLowerCase();
    if (userData.role) updateData.role = userData.role;
    if (userData.permissions) updateData.permissions = userData.permissions;
    
    return UserModel.findByIdAndUpdate(id, updateData, { new: true });
  }
  
  /**
   * Update user password
   * @param id User ID
   * @param password New password
   * @returns Updated user
   */
  async updatePassword(id: string, password: string): Promise<IUser | null> {
    await connectToMongoose();
    
    const user = await UserModel.findById(id);
    if (!user) return null;
    
    user.passwordHash = password; // Will be hashed by pre-save hook
    await user.save();
    
    return user;
  }
  
  /**
   * Delete a user
   * @param id User ID
   * @returns True if deleted, false if not found
   */
  async deleteUser(id: string): Promise<boolean> {
    await connectToMongoose();
    
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
  
  /**
   * Verify user credentials
   * @param email User email
   * @param password User password
   * @returns User if credentials are valid, null otherwise
   */
  async verifyCredentials(email: string, password: string): Promise<IUser | null> {
    await connectToMongoose();
    
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) return null;
    
    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) return null;
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    return user;
  }
  
  /**
   * List all users
   * @param limit Maximum number of users to return
   * @param skip Number of users to skip (for pagination)
   * @returns List of users
   */
  async listUsers(limit: number = 100, skip: number = 0): Promise<IUser[]> {
    await connectToMongoose();
    return UserModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  }
}

// Export a singleton instance
export const userRepository = new UserRepository();

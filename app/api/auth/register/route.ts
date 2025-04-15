/**
 * API route handler for user registration
 * This file implements the registration endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/lib/server/db/repositories/user-repository';
import { ApiResponse, UserData, CreateUserRequest } from '@/lib/shared/types/user';

/**
 * Convert database user to API user data
 */
function mapUserToUserData(user: {
  _id: { toString: () => string };
  email: string;
  role: string;
  permissions?: string[];
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}): UserData {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    lastLogin: user.lastLogin ? user.lastLogin.toISOString() : undefined,
    createdAt: user.createdAt ? user.createdAt.toISOString() : undefined,
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : undefined
  };
}

/**
 * POST /api/auth/register - Register new user
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateUserRequest = await req.json();
    
    // Validate request
    if (!body.email || !body.password || !body.role) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, password, and role are required'
        }
      };
      
      return NextResponse.json(response, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(body.email);
    if (existingUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'A user with this email already exists'
        }
      };
      
      return NextResponse.json(response, { status: 409 });
    }
    
    // Create user
    const user = await userRepository.createUser({
      email: body.email,
      password: body.password,
      role: body.role,
      permissions: body.permissions
    });
    
    const response: ApiResponse<UserData> = {
      success: true,
      data: mapUserToUserData(user)
    };
    
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error registering user:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while registering the user'
      }
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

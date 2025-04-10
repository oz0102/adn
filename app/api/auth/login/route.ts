/**
 * API route handler for authentication
 * This file implements login and registration endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/lib/server/db/repositories/user-repository';
import { ApiResponse, UserData, LoginRequest, CreateUserRequest, LoginResponse } from '@/lib/shared/types/user';

/**
 * Convert database user to API user data
 */
function mapUserToUserData(user: any): UserData {
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
 * POST /api/auth/login - Login user
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: LoginRequest = await req.json();
    
    // Validate request
    if (!body.email || !body.password) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required'
        }
      };
      
      return NextResponse.json(response, { status: 400 });
    }
    
    // Verify credentials
    const user = await userRepository.verifyCredentials(body.email, body.password);
    
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      };
      
      return NextResponse.json(response, { status: 401 });
    }
    
    // Return user data
    const response: ApiResponse<LoginResponse> = {
      success: true,
      data: {
        user: mapUserToUserData(user)
      }
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error logging in:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while logging in'
      }
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

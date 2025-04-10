/**
 * API route handler for user by ID operations
 * This file implements RESTful endpoints for individual user management
 */

import { NextRequest, NextResponse } from 'next/server';
import { userRepository } from '@/lib/server/db/repositories/user-repository';
import { ApiResponse, UserData, UpdateUserRequest, ChangePasswordRequest } from '@/lib/shared/types/user';

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
 * GET /api/users/[id] - Get user by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const userId = params.id;
    
    const user = await userRepository.findById(userId);
    
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      };
      
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse<UserData> = {
      success: true,
      data: mapUserToUserData(user)
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while fetching the user'
      }
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PUT /api/users/[id] - Update user
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const userId = params.id;
    const body: UpdateUserRequest = await req.json();
    
    // Check if user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      };
      
      return NextResponse.json(response, { status: 404 });
    }
    
    // Update user
    const updatedUser = await userRepository.updateUser(userId, body);
    
    const response: ApiResponse<UserData> = {
      success: true,
      data: mapUserToUserData(updatedUser!)
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while updating the user'
      }
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id] - Delete user
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const userId = params.id;
    
    const deleted = await userRepository.deleteUser(userId);
    
    if (!deleted) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      };
      
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse<null> = {
      success: true
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting user:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while deleting the user'
      }
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PATCH /api/users/[id] - Change user password
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const userId = params.id;
    const body: ChangePasswordRequest = await req.json();
    
    if (!body.password) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password is required'
        }
      };
      
      return NextResponse.json(response, { status: 400 });
    }
    
    const user = await userRepository.updatePassword(userId, body.password);
    
    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      };
      
      return NextResponse.json(response, { status: 404 });
    }
    
    const response: ApiResponse<UserData> = {
      success: true,
      data: mapUserToUserData(user)
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error changing password:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An error occurred while changing the password'
      }
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// app/api/users/route.ts - Updated with route wrapper
import { NextRequest, NextResponse } from 'next/server';
import { withMongoDBHandler } from '@/app/api/route-wrapper';
import { userRepository } from '@/lib/server/db/repositories/user-repository';
import { ApiResponse, UserData, CreateUserRequest } from '@/lib/shared/types/user';

/**
 * Database user interface
 */
interface DbUser {
  _id: {
    toString: () => string;
  };
  email: string;
  role: string;
  permissions?: string[];
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Convert database user to API user data
 */
function mapUserToUserData(user: DbUser): UserData {
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
 * GET /api/users - Get all users
 */
export const GET = withMongoDBHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const skip = parseInt(searchParams.get('skip') || '0');
  
  const users = await userRepository.listUsers(limit, skip);
  
  const response: ApiResponse<UserData[]> = {
    success: true,
    data: users.map((user) => mapUserToUserData(user as DbUser))
  };
  
  return NextResponse.json(response);
});

/**
 * POST /api/users - Create a new user
 */
export const POST = withMongoDBHandler(async (req: NextRequest) => {
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
    data: mapUserToUserData(user as DbUser)
  };
  
  return NextResponse.json(response, { status: 201 });
});

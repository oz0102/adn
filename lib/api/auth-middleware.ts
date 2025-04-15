import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, unknown>;
};

export async function withAuth(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unauthorized',
      },
      { status: 401 }
    );
  }

  return token;
}

export async function withRoleAuth(request: NextRequest, allowedRoles: string[]) {
  const token = await withAuth(request);
  
  if (token === null || typeof token === 'undefined' || !('role' in token)) {
    return token; // Already returns unauthorized response
  }
  
  if (!allowedRoles.includes(token.role as string)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Forbidden: Insufficient permissions',
      },
      { status: 403 }
    );
  }

  return token;
}

export async function withPermissionAuth(request: NextRequest, requiredPermissions: string[]) {
  const token = await withAuth(request);
  
  if (token === null || typeof token === 'undefined' || !('permissions' in token)) {
    return token; // Already returns unauthorized response
  }
  
  const userPermissions = (token.permissions as string[]) || [];
  
  const hasAllPermissions = requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );

  if (!hasAllPermissions) {
    return NextResponse.json(
      {
        success: false,
        message: 'Forbidden: Insufficient permissions',
      },
      { status: 403 }
    );
  }

  return token;
}

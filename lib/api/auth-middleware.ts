import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
};

export async function withAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: 'Unauthorized',
      },
      { status: 401 }
    );
  }

  return session;
}

export async function withRoleAuth(request: NextRequest, allowedRoles: string[]) {
  const session = await withAuth(request);
  
  if (session === null || typeof session === 'undefined' || !('user' in session)) {
    return session; // Already returns unauthorized response
  }
  
  if (!allowedRoles.includes(session.user.role)) {
    return NextResponse.json(
      {
        success: false,
        message: 'Forbidden: Insufficient permissions',
      },
      { status: 403 }
    );
  }

  return session;
}

export async function withPermissionAuth(request: NextRequest, requiredPermissions: string[]) {
  const session = await withAuth(request);
  
  if (session === null || typeof session === 'undefined' || !('user' in session)) {
    return session; // Already returns unauthorized response
  }
  
  const userPermissions = session.user.permissions || [];
  
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

  return session;
}

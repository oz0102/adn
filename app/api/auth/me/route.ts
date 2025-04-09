import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }
  
  return NextResponse.json({
    success: true,
    user: {
      id: token.id,
      email: token.email,
      role: token.role,
      permissions: token.permissions,
    }
  });
}

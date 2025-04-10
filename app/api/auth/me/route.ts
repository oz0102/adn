import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import User from '@/models/user';
import connectToDatabase from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      console.log('API/auth/me: No token found');
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get fresh user data from database
    await connectToDatabase();
    const user = await User.findById(token.id).select('-passwordHash');
    
    if (!user) {
      console.log('API/auth/me: User not found in database');
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('API/auth/me error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

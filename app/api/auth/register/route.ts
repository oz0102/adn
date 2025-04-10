import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/user';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input data', 
          errors: validation.error.errors 
        },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const user = new User({
      email: body.email,
      passwordHash: body.password, // Will be hashed by pre-save hook
      role: body.role || 'Member',
      permissions: []
    });
    
    await user.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully',
        userId: user._id.toString()
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

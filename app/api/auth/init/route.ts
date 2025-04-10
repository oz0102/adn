import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import User from '@/models/user';
import connectToDatabase from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { secretKey, email, password } = await req.json();
    
    // Validate the secret key
    if (secretKey !== process.env.ADMIN_INIT_SECRET) {
      console.log('Admin initialization: Invalid secret key');
      return NextResponse.json(
        { success: false, message: 'Invalid secret key' },
        { status: 403 }
      );
    }
    
    await connectToDatabase();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'Admin' });
    
    if (existingAdmin) {
      console.log('Admin initialization: Admin already exists');
      return NextResponse.json({
        success: true,
        adminCreated: false,
        message: 'Admin user already exists',
        email: existingAdmin.email
      });
    }
    
    // Create admin user
    const passwordHash = await hash(password, 10);
    
    const newAdmin = new User({
      email: email.toLowerCase(),
      passwordHash,
      role: 'Admin',
      permissions: ['all'],
    });
    
    await newAdmin.save();
    
    console.log('Admin initialization: Admin user created successfully');
    
    return NextResponse.json({
      success: true,
      adminCreated: true,
      message: 'Admin user created successfully',
      email: email
    });
  } catch (error) {
    console.error('Admin initialization error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during admin initialization' },
      { status: 500 }
    );
  }
}

// app/api/auth/init/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/user';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Simple protection to prevent unauthorized initialization
    if (!body.secretKey || body.secretKey !== process.env.ADMIN_INIT_SECRET) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized initialization attempt' 
      }, { status: 401 });
    }
    
    await connectToDatabase();
    
    // Check if a super admin user already exists
    const existingAdmin = await User.findOne({ role: 'Admin' });
    
    if (existingAdmin) {
      return NextResponse.json({ 
        success: true, 
        message: 'Admin user already exists', 
        adminExists: true,
        email: existingAdmin.email
      });
    }
    
    // Create a super admin user
    const adminUser = new User({
      email: body.email || 'apostolicdominionglobal@gmail.com',
      passwordHash: body.password || 'Adn2026@@!', // This will be hashed by the pre-save hook
      role: 'Admin',
      permissions: ['*'] // All permissions
    });
    
    await adminUser.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully', 
      adminCreated: true,
      email: adminUser.email
    });
  } catch (error: any) {
    console.error('Admin initialization error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to initialize admin user', 
      error: error.message 
    }, { status: 500 });
  }
}
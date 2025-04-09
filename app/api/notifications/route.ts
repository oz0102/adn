import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Notification from '@/models/notification';
import { getToken } from 'next-auth/jwt';

const notificationSchema = z.object({
  title: z.string(),
  message: z.string(),
  type: z.enum(['Info', 'Success', 'Warning', 'Error']),
  targetUsers: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
  targetAll: z.boolean().optional(),
  link: z.string().optional(),
  expiresAt: z.string().transform(val => new Date(val)).optional()
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    const skip = (page - 1) * limit;
    
    await connectToDatabase();
    
    // Build query to get notifications for this user
    let query: any = {
      $or: [
        { targetUsers: token.id },
        { targetRoles: token.role },
        { targetAll: true }
      ],
      expiresAt: { $gt: new Date() }
    };
    
    if (unreadOnly) {
      query.readBy = { $ne: token.id };
    }
    
    const notifications = await Notification.find(query)
      .populate('createdBy', 'email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Notification.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token || !['Admin', 'Pastor', 'ClusterLead'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate request body
    const validation = notificationSchema.safeParse(body);
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
    
    // Ensure at least one target is specified
    if (!body.targetUsers?.length && !body.targetRoles?.length && !body.targetAll) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'At least one target (users, roles, or all) must be specified' 
        },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Create new notification
    const notification = new Notification({
      ...body,
      readBy: [],
      createdBy: token.id,
      expiresAt: body.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
    });
    
    await notification.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Notification created successfully',
        data: notification
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

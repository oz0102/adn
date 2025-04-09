import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Notification from '@/models/notification';
import { getToken } from 'next-auth/jwt';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const notification = await Notification.findById(params.id);
    
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // Check if user is allowed to see this notification
    const isTargeted = 
      notification.targetAll || 
      notification.targetUsers.includes(token.id) || 
      notification.targetRoles.includes(token.role as string);
    
    if (!isTargeted) {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to mark this notification as read' },
        { status: 403 }
      );
    }
    
    // Mark notification as read if not already read
    if (!notification.readBy.includes(token.id)) {
      notification.readBy.push(token.id);
      await notification.save();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

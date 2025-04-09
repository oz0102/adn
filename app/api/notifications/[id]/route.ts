import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Notification from '@/models/notification';
import { getToken } from 'next-auth/jwt';

export async function GET(
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
    
    const notification = await Notification.findById(params.id)
      .populate('createdBy', 'email');
    
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
    
    if (!isTargeted && token.id !== notification.createdBy.toString() && token.role !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to view this notification' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Get notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    
    const body = await req.json();
    
    await connectToDatabase();
    
    const notification = await Notification.findById(params.id);
    
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // Only creator or admin can update notification content
    if (notification.createdBy.toString() !== token.id && token.role !== 'Admin') {
      return NextResponse.json(
        { success: false, message: 'You are not authorized to update this notification' },
        { status: 403 }
      );
    }
    
    // Update notification fields
    if (body.title) notification.title = body.title;
    if (body.message) notification.message = body.message;
    if (body.type) notification.type = body.type;
    if (body.targetUsers) notification.targetUsers = body.targetUsers;
    if (body.targetRoles) notification.targetRoles = body.targetRoles;
    if (body.targetAll !== undefined) notification.targetAll = body.targetAll;
    if (body.link) notification.link = body.link;
    if (body.expiresAt) notification.expiresAt = new Date(body.expiresAt);
    
    await notification.save();
    
    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully',
      data: notification
    });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token || !['Admin', 'Pastor'].includes(token.role as string)) {
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
    
    await Notification.deleteOne({ _id: params.id });
    
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

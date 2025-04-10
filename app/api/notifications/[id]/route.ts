import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Notification from '@/models/notification';
import connectToDatabase from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Connect to database
    await connectToDatabase();
    
    // Get notification by ID
    const notification = await Notification.findById(id)
      .populate('senderId', 'firstName lastName email')
      .populate('recipientId', 'firstName lastName email')
      .lean();
    
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view this notification
    if (
      token.role !== 'Admin' && 
      token.role !== 'Pastor' && 
      notification.recipientId && 
      typeof notification.recipientId === 'object' &&
      'toString' in notification.recipientId &&
      notification.recipientId.toString() !== token.id &&
      notification.recipientType !== 'All'
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to view this notification' },
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
      { success: false, message: 'Error fetching notification' },
      { status: 500 }
    );
  }
}

// PUT update notification (mark as read/unread)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;
    const updateData = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Check if notification exists
    const existingNotification = await Notification.findById(id);
    
    if (!existingNotification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update this notification
    if (
      token.role !== 'Admin' && 
      token.role !== 'Pastor' && 
      existingNotification.recipientId && 
      typeof existingNotification.recipientId === 'object' &&
      'toString' in existingNotification.recipientId &&
      existingNotification.recipientId.toString() !== token.id &&
      existingNotification.recipientType !== 'All'
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this notification' },
        { status: 403 }
      );
    }
    
    // Update notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('senderId', 'firstName lastName email')
      .populate('recipientId', 'firstName lastName email');
    
    return NextResponse.json({
      success: true,
      data: updatedNotification
    });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating notification' },
      { status: 500 }
    );
  }
}

// DELETE notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Connect to database
    await connectToDatabase();
    
    // Check if notification exists
    const existingNotification = await Notification.findById(id);
    
    if (!existingNotification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this notification
    if (
      token.role !== 'Admin' && 
      token.role !== 'Pastor' && 
      existingNotification.recipientId && 
      typeof existingNotification.recipientId === 'object' &&
      'toString' in existingNotification.recipientId &&
      existingNotification.recipientId.toString() !== token.id
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this notification' },
        { status: 403 }
      );
    }
    
    // Delete notification
    await Notification.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting notification' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Notification from '@/models/notification';
import connectToDatabase from '@/lib/db';

// GET all notifications with pagination and filtering
export async function GET(req: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    interface NotificationQueryType {
      $or?: Array<{recipientId?: string, recipientType?: string}>;
      $and?: Array<{$or: Array<{[key: string]: {$regex: string, $options: string}}>}>;
      type?: string;
      status?: string;
      createdAt?: {$gte?: Date, $lte?: Date};
    }
    
    const query: NotificationQueryType = {};
    
    // Only show notifications for this user or all users if admin
    if (token.role !== 'Admin' && token.role !== 'Pastor') {
      query.$or = [
        { recipientId: token.id },
        { recipientType: 'All' }
      ];
    }
    
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt = { $lte: new Date(endDate) };
    }

    // Connect to database
    await connectToDatabase();
    
    // Get total count
    const total = await Notification.countDocuments(query);
    
    // Get paginated results
    interface SortType {
      [key: string]: number;
    }
    const sort: SortType = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('recipientId', 'firstName lastName email')
      .populate('senderId', 'firstName lastName email')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching notifications' },
      { status: 500 }
    );
  }
}

// POST create new notification
export async function POST(req: NextRequest) {
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

    // Parse request body
    const notificationData = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Validate notification data
    if (!notificationData.title || !notificationData.message || !notificationData.type) {
      return NextResponse.json(
        { success: false, message: 'Title, message, and type are required' },
        { status: 400 }
      );
    }
    
    // Set senderId to current user if not provided
    if (!notificationData.senderId) {
      notificationData.senderId = token.id;
    }
    
    // Set default status if not provided
    if (!notificationData.status) {
      notificationData.status = 'Unread';
    }
    
    // Create new notification
    const newNotification = new Notification(notificationData);
    await newNotification.save();
    
    // Populate sender and recipient details
    if (newNotification.senderId) {
      await newNotification.populate('senderId', 'firstName lastName email');
    }
    
    if (newNotification.recipientId) {
      await newNotification.populate('recipientId', 'firstName lastName email');
    }
    
    return NextResponse.json({
      success: true,
      data: newNotification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating notification' },
      { status: 500 }
    );
  }
}

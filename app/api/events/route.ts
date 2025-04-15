import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Event from '@/models/event';
import connectToDatabase from '@/lib/db';

// GET all events with pagination and filtering
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
    const sortBy = searchParams.get('sortBy') || 'startDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.startDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.startDate = { $lte: new Date(endDate) };
    }

    // Connect to database
    await connectToDatabase();
    
    // Get total count
    const total = await Event.countDocuments(query);
    
    // Get paginated results
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const skip = (page - 1) * limit;
    
    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('organizer', 'firstName lastName email')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        events,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching events' },
      { status: 500 }
    );
  }
}

// POST create new event
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
    const eventData = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Validate event data
    if (!eventData.name || !eventData.startDate) {
      return NextResponse.json(
        { success: false, message: 'Event name and start date are required' },
        { status: 400 }
      );
    }
    
    // Set organizer to current user if not provided
    if (!eventData.organizer) {
      eventData.organizer = token.id;
    }
    
    // Create new event
    const newEvent = new Event(eventData);
    await newEvent.save();
    
    // Populate organizer details
    await newEvent.populate('organizer', 'firstName lastName email');
    
    return NextResponse.json({
      success: true,
      data: newEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating event' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import ProgramFlyer from '@/models/programFlyer';
import connectToDatabase from '@/lib/db';

// GET all flyers with pagination and filtering
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
    const eventId = searchParams.get('eventId') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (eventId) {
      query.eventId = eventId;
    }
    
    if (status) {
      query.status = status;
    }

    // Connect to database
    await connectToDatabase();
    
    // Get total count
    const total = await ProgramFlyer.countDocuments(query);
    
    // Get paginated results
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const skip = (page - 1) * limit;
    
    const flyers = await ProgramFlyer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .populate('eventId', 'name startDate')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        flyers,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get flyers error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching flyers' },
      { status: 500 }
    );
  }
}

// POST create new flyer
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
    const flyerData = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Validate flyer data
    if (!flyerData.title || !flyerData.imageUrl) {
      return NextResponse.json(
        { success: false, message: 'Title and image URL are required' },
        { status: 400 }
      );
    }
    
    // Set createdBy to current user if not provided
    if (!flyerData.createdBy) {
      flyerData.createdBy = token.id;
    }
    
    // Create new flyer
    const newFlyer = new ProgramFlyer(flyerData);
    await newFlyer.save();
    
    // Populate creator and event details
    await newFlyer.populate('createdBy', 'firstName lastName email');
    if (newFlyer.eventId) {
      await newFlyer.populate('eventId', 'name startDate');
    }
    
    return NextResponse.json({
      success: true,
      data: newFlyer
    });
  } catch (error) {
    console.error('Create flyer error:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating flyer' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import SmallGroup from '@/models/smallGroup';
import Member from '@/models/member';
import connectToDatabase from '@/lib/db';

// GET all small groups with pagination and filtering
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
    const clusterId = searchParams.get('clusterId') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { meetingLocation: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (clusterId) {
      query.clusterId = clusterId;
    }

    // Connect to database
    await connectToDatabase();
    
    // Get total count
    const total = await SmallGroup.countDocuments(query);
    
    // Get paginated results
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const skip = (page - 1) * limit;
    
    const smallGroups = await SmallGroup.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('leader', 'firstName lastName email')
      .populate('clusterId', 'name')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        smallGroups,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get small groups error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching small groups' },
      { status: 500 }
    );
  }
}

// POST create new small group
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

    // Check if user has appropriate role
    if (token.role !== 'Admin' && token.role !== 'Pastor' && token.role !== 'ClusterLead') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to create small groups' },
        { status: 403 }
      );
    }

    // Parse request body
    const smallGroupData = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Validate small group data
    if (!smallGroupData.name || !smallGroupData.clusterId) {
      return NextResponse.json(
        { success: false, message: 'Small group name and cluster ID are required' },
        { status: 400 }
      );
    }
    
    // Check if small group with same name already exists
    const existingSmallGroup = await SmallGroup.findOne({ name: smallGroupData.name });
    if (existingSmallGroup) {
      return NextResponse.json(
        { success: false, message: 'Small group with this name already exists' },
        { status: 400 }
      );
    }
    
    // Create new small group
    const newSmallGroup = new SmallGroup(smallGroupData);
    await newSmallGroup.save();
    
    // Populate leader and cluster details
    await newSmallGroup.populate('leader', 'firstName lastName email');
    await newSmallGroup.populate('clusterId', 'name');
    
    return NextResponse.json({
      success: true,
      data: newSmallGroup
    });
  } catch (error) {
    console.error('Create small group error:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating small group' },
      { status: 500 }
    );
  }
}

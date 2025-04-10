import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Member from '@/models/member';
import connectToDatabase from '@/lib/db';

// GET all members with pagination and filtering
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
    const status = searchParams.get('status') || '';
    const clusterId = searchParams.get('clusterId') || '';
    const smallGroupId = searchParams.get('smallGroupId') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (clusterId) {
      query.clusterId = clusterId;
    }
    
    if (smallGroupId) {
      query.smallGroupId = smallGroupId;
    }

    // Connect to database
    await connectToDatabase();
    
    // Get total count
    const total = await Member.countDocuments(query);
    
    // Get paginated results
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const skip = (page - 1) * limit;
    
    const members = await Member.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('clusterId', 'name')
      .populate('smallGroupId', 'name')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        members,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching members' },
      { status: 500 }
    );
  }
}

// POST create new member
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
    const memberData = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Check if member with same email or phone already exists
    if (memberData.email) {
      const existingMember = await Member.findOne({ email: memberData.email });
      if (existingMember) {
        return NextResponse.json(
          { success: false, message: 'Member with this email already exists' },
          { status: 400 }
        );
      }
    }
    
    if (memberData.phone) {
      const existingMember = await Member.findOne({ phone: memberData.phone });
      if (existingMember) {
        return NextResponse.json(
          { success: false, message: 'Member with this phone number already exists' },
          { status: 400 }
        );
      }
    }
    
    // Create new member
    const newMember = new Member(memberData);
    await newMember.save();
    
    return NextResponse.json({
      success: true,
      data: newMember
    });
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating member' },
      { status: 500 }
    );
  }
}

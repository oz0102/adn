import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import FollowUp from '@/models/followUp';
import Member from '@/models/member';
import connectToDatabase from '@/lib/db';

// GET all follow-ups with pagination and filtering
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
    const assignedTo = searchParams.get('assignedTo') || '';
    const type = searchParams.get('type') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const sortBy = searchParams.get('sortBy') || 'dueDate';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { notes: { $regex: search, $options: 'i' } },
        { outcome: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (startDate && endDate) {
      query.dueDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      query.dueDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.dueDate = { $lte: new Date(endDate) };
    }

    // Connect to database
    await connectToDatabase();
    
    // Get total count
    const total = await FollowUp.countDocuments(query);
    
    // Get paginated results
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const skip = (page - 1) * limit;
    
    const followUps = await FollowUp.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('memberId', 'firstName lastName email phone profileImage')
      .populate('assignedTo', 'firstName lastName email')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        followUps,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get follow-ups error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching follow-ups' },
      { status: 500 }
    );
  }
}

// POST create new follow-up
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
    const followUpData = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Validate follow-up data
    if (!followUpData.memberId || !followUpData.type || !followUpData.dueDate) {
      return NextResponse.json(
        { success: false, message: 'Member ID, type, and due date are required' },
        { status: 400 }
      );
    }
    
    // Check if member exists
    const memberExists = await Member.findById(followUpData.memberId);
    if (!memberExists) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 400 }
      );
    }
    
    // Set default status if not provided
    if (!followUpData.status) {
      followUpData.status = 'Pending';
    }
    
    // Set assignedTo to current user if not provided
    if (!followUpData.assignedTo) {
      followUpData.assignedTo = token.id;
    }
    
    // Create new follow-up
    const newFollowUp = new FollowUp(followUpData);
    await newFollowUp.save();
    
    // Populate member and assignedTo details
    await newFollowUp.populate('memberId', 'firstName lastName email phone profileImage');
    await newFollowUp.populate('assignedTo', 'firstName lastName email');
    
    return NextResponse.json({
      success: true,
      data: newFollowUp
    });
  } catch (error) {
    console.error('Create follow-up error:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating follow-up' },
      { status: 500 }
    );
  }
}

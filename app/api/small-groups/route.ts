import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import SmallGroup from '@/models/smallGroup';
import { getToken } from 'next-auth/jwt';

const smallGroupSchema = z.object({
  groupId: z.string(),
  name: z.string(),
  location: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string().optional()
  }),
  leaderId: z.string(),
  contactPhone: z.string(),
  contactEmail: z.string().email(),
  photo: z.string().optional(),
  description: z.string(),
  meetingSchedule: z.object({
    day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    time: z.string(),
    frequency: z.enum(['Weekly', 'Bi-weekly', 'Monthly'])
  })
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
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const clusterId = searchParams.get('clusterId') || '';
    
    const skip = (page - 1) * limit;
    
    await connectToDatabase();
    
    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    const smallGroups = await SmallGroup.find(query)
      .populate('leaderId', 'firstName lastName email phoneNumber')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });
    
    const total = await SmallGroup.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: smallGroups,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get small groups error:', error);
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
    const validation = smallGroupSchema.safeParse(body);
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
    
    await connectToDatabase();
    
    // Check if small group already exists
    const existingSmallGroup = await SmallGroup.findOne({ groupId: body.groupId });
    if (existingSmallGroup) {
      return NextResponse.json(
        { success: false, message: 'Small group with this ID already exists' },
        { status: 409 }
      );
    }
    
    // Create new small group
    const smallGroup = new SmallGroup(body);
    
    await smallGroup.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Small group created successfully',
        data: smallGroup
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create small group error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

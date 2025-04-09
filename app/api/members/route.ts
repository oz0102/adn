
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Member from '@/models/member';
import { getToken } from 'next-auth/jwt';

const memberSchema = z.object({
  memberId: z.string(),
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  gender: z.enum(['Male', 'Female']),
  dateOfBirth: z.string().transform(val => new Date(val)),
  email: z.string().email().optional(),
  phoneNumber: z.string(),
  whatsappNumber: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string().optional()
  }),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed']),
  relationshipStatus: z.string().optional(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  profilePhoto: z.string().optional(),
  education: z.object({
    level: z.string(),
    institution: z.string().optional(),
    course: z.string().optional(),
    graduationYear: z.number().optional()
  }).optional(),
  skills: z.array(z.object({
    name: z.string(),
    proficiencyLevel: z.string(),
    certified: z.boolean()
  })).optional(),
  clusterId: z.string().optional(),
  smallGroupId: z.string().optional()
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
    const clusterId = searchParams.get('clusterId') || '';
    const smallGroupId = searchParams.get('smallGroupId') || '';
    const teamId = searchParams.get('teamId') || '';
    const spiritualGrowthStage = searchParams.get('spiritualGrowthStage') || '';
    
    const skip = (page - 1) * limit;
    
    await connectToDatabase();
    
    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (clusterId) {
      query.clusterId = clusterId;
    }
    
    if (smallGroupId) {
      query.smallGroupId = smallGroupId;
    }
    
    if (teamId) {
      query['teams.teamId'] = teamId;
    }
    
    if (spiritualGrowthStage) {
      query[`spiritualGrowth.${spiritualGrowthStage}.date`] = { $exists: true };
    }
    
    const members = await Member.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Member.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate request body
    const validation = memberSchema.safeParse(body);
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
    
    // Check if member already exists
    const existingMember = await Member.findOne({ memberId: body.memberId });
    if (existingMember) {
      return NextResponse.json(
        { success: false, message: 'Member with this ID already exists' },
        { status: 409 }
      );
    }
    
    // Create new member
    const member = new Member({
      ...body,
      createdBy: token.id,
      lastUpdatedBy: token.id
    });
    
    await member.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Member created successfully',
        data: member
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

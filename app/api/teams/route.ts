import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Team from '@/models/team';
import Member from '@/models/member';
import { getToken } from 'next-auth/jwt';

const teamSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  leaderId: z.string().optional(),
  assistantLeaderIds: z.array(z.string()).optional(),
  meetingSchedule: z.object({
    day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).optional(),
    time: z.string().optional(),
    frequency: z.enum(['Weekly', 'Bi-weekly', 'Monthly', 'As Needed']).optional()
  }).optional()
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
    const category = searchParams.get('category') || '';
    
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
    
    if (category) {
      query.category = category;
    }
    
    const teams = await Team.find(query)
      .populate('leaderId', 'firstName lastName email phoneNumber')
      .populate('assistantLeaderIds', 'firstName lastName email phoneNumber')
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });
    
    const total = await Team.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: teams,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token || !['Admin', 'Pastor'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate request body
    const validation = teamSchema.safeParse(body);
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
    
    // Verify leader exists if provided
    if (body.leaderId) {
      const leader = await Member.findById(body.leaderId);
      if (!leader) {
        return NextResponse.json(
          { success: false, message: 'Leader not found' },
          { status: 404 }
        );
      }
    }
    
    // Verify assistant leaders exist if provided
    if (body.assistantLeaderIds && body.assistantLeaderIds.length > 0) {
      for (const assistantId of body.assistantLeaderIds) {
        const assistant = await Member.findById(assistantId);
        if (!assistant) {
          return NextResponse.json(
            { success: false, message: `Assistant leader with ID ${assistantId} not found` },
            { status: 404 }
          );
        }
      }
    }
    
    // Create new team
    const team = new Team({
      ...body,
      members: [],
      createdBy: token.id
    });
    
    // Add leader to members if provided
    if (body.leaderId) {
      team.members.push(body.leaderId);
    }
    
    // Add assistant leaders to members if provided
    if (body.assistantLeaderIds && body.assistantLeaderIds.length > 0) {
      for (const assistantId of body.assistantLeaderIds) {
        if (!team.members.includes(assistantId)) {
          team.members.push(assistantId);
        }
      }
    }
    
    await team.save();
    
    // Update member records for leader and assistants
    if (body.leaderId) {
      await Member.findByIdAndUpdate(body.leaderId, {
        $push: {
          teams: {
            teamId: team._id,
            role: 'Lead',
            joinDate: new Date()
          }
        }
      });
    }
    
    if (body.assistantLeaderIds && body.assistantLeaderIds.length > 0) {
      for (const assistantId of body.assistantLeaderIds) {
        await Member.findByIdAndUpdate(assistantId, {
          $push: {
            teams: {
              teamId: team._id,
              role: 'Assistant',
              joinDate: new Date()
            }
          }
        });
      }
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Team created successfully',
        data: team
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

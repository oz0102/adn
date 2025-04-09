import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import FollowUp from '@/models/followUp';
import Member from '@/models/member';
import Event from '@/models/event';
import { getToken } from 'next-auth/jwt';

const followUpSchema = z.object({
  personType: z.enum(['New Attendee', 'Member']),
  personId: z.string().optional(),
  newAttendee: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email().optional(),
    phoneNumber: z.string(),
    whatsappNumber: z.string().optional(),
    address: z.string().optional(),
    visitDate: z.string().transform(val => new Date(val)),
    referredBy: z.string().optional()
  }).optional(),
  missedEvent: z.object({
    eventId: z.string(),
    eventDate: z.string().transform(val => new Date(val)),
    eventType: z.string()
  }).optional(),
  status: z.enum(['Pending', 'In Progress', 'Completed', 'Failed']).optional(),
  assignedTo: z.string(),
  nextFollowUpDate: z.string().transform(val => new Date(val)).optional()
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
    const status = searchParams.get('status') || '';
    const personType = searchParams.get('personType') || '';
    const assignedTo = searchParams.get('assignedTo') || '';
    
    const skip = (page - 1) * limit;
    
    await connectToDatabase();
    
    // Build query
    let query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (personType) {
      query.personType = personType;
    }
    
    if (assignedTo) {
      query.assignedTo = assignedTo;
    } else if (token.role !== 'Admin' && token.role !== 'Pastor') {
      // If not admin or pastor, only show follow-ups assigned to the user
      query.assignedTo = token.id;
    }
    
    const followUps = await FollowUp.find(query)
      .populate('personId', 'firstName lastName email phoneNumber')
      .populate('assignedTo', 'email')
      .populate('attempts.conductedBy', 'email')
      .populate('newAttendee.referredBy', 'firstName lastName')
      .skip(skip)
      .limit(limit)
      .sort({ nextFollowUpDate: 1, createdAt: -1 });
    
    const total = await FollowUp.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: followUps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get follow-ups error:', error);
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
    const validation = followUpSchema.safeParse(body);
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
    
    // Validate references
    if (body.personType === 'Member' && body.personId) {
      const member = await Member.findById(body.personId);
      if (!member) {
        return NextResponse.json(
          { success: false, message: 'Member not found' },
          { status: 404 }
        );
      }
    }
    
    if (body.missedEvent && body.missedEvent.eventId) {
      const event = await Event.findById(body.missedEvent.eventId);
      if (!event) {
        return NextResponse.json(
          { success: false, message: 'Event not found' },
          { status: 404 }
        );
      }
    }
    
    // Create new follow-up
    const followUp = new FollowUp({
      ...body,
      status: body.status || 'Pending',
      attempts: []
    });
    
    await followUp.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Follow-up created successfully',
        data: followUp
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create follow-up error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

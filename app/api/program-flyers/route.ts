import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import ProgramFlyer from '@/models/programFlyer';
import FlyerTemplate from '@/models/flyerTemplate';
import Event from '@/models/event';
import { getToken } from 'next-auth/jwt';

const programFlyerSchema = z.object({
  title: z.string(),
  eventId: z.string().optional(),
  templateId: z.string(),
  content: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.string(),
    time: z.string(),
    venue: z.string(),
    description: z.string(),
    contactInfo: z.string().optional(),
    additionalInfo: z.string().optional(),
    imageUrl: z.string().optional()
  }),
  status: z.enum(['Draft', 'Published', 'Archived']).optional(),
  publishDate: z.string().transform(val => new Date(val)).optional()
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
    const status = searchParams.get('status') || '';
    const eventId = searchParams.get('eventId') || '';
    
    const skip = (page - 1) * limit;
    
    await connectToDatabase();
    
    // Build query
    interface ProgramFlyerQueryType {
      $or?: Array<{[key: string]: {$regex: string, $options: string}}>;
      status?: string;
      eventId?: string;
    }
    
    const query: ProgramFlyerQueryType = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'content.title': { $regex: search, $options: 'i' } },
        { 'content.description': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (eventId) {
      query.eventId = eventId;
    }
    
    const flyers = await ProgramFlyer.find(query)
      .populate('templateId', 'name category')
      .populate('eventId', 'title startDate')
      .populate('createdBy', 'email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await ProgramFlyer.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: flyers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get program flyers error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token || !['Admin', 'Pastor', 'MediaTeam'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate request body
    const validation = programFlyerSchema.safeParse(body);
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
    
    // Verify template exists
    const template = await FlyerTemplate.findById(body.templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Flyer template not found' },
        { status: 404 }
      );
    }
    
    // Verify event exists if provided
    if (body.eventId) {
      const event = await Event.findById(body.eventId);
      if (!event) {
        return NextResponse.json(
          { success: false, message: 'Event not found' },
          { status: 404 }
        );
      }
    }
    
    // Create new program flyer
    const flyer = new ProgramFlyer({
      ...body,
      status: body.status || 'Draft',
      createdBy: token.id
    });
    
    await flyer.save();
    
    // If event is provided and flyer is published, update event with flyer
    if (body.eventId && body.status === 'Published') {
      await Event.findByIdAndUpdate(body.eventId, { flyer: flyer._id });
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Program flyer created successfully',
        data: flyer
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create program flyer error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Attendance from '@/models/attendance';
import Event from '@/models/event';
import { getToken } from 'next-auth/jwt';

const attendanceSchema = z.object({
  eventId: z.string(),
  eventType: z.enum(['Sunday Service', 'Midweek Service', 'Cluster Meeting', 'Small Group', 'Training', 'Other']),
  date: z.string().transform(val => new Date(val)),
  members: z.array(z.object({
    memberId: z.string(),
    status: z.enum(['Present', 'Absent', 'Excused']),
    checkInTime: z.string().transform(val => new Date(val)).optional()
  })).optional(),
  notes: z.string().optional()
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
    const eventId = searchParams.get('eventId') || '';
    const eventType = searchParams.get('eventType') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    
    const skip = (page - 1) * limit;
    
    await connectToDatabase();
    
    // Build query
    let query: Record<string, unknown> = {};
    
    if (eventId) {
      query.eventId = eventId;
    }
    
    if (eventType) {
      query.eventType = eventType;
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate) };
    }
    
    const attendanceRecords = await Attendance.find(query)
      .populate('eventId', 'title startDate endDate')
      .populate('recordedBy', 'email')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });
    
    const total = await Attendance.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: attendanceRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get attendance records error:', error);
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
    const validation = attendanceSchema.safeParse(body);
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
    
    // Verify event exists
    const event = await Event.findById(body.eventId);
    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Check if attendance record already exists for this event
    const existingAttendance = await Attendance.findOne({ 
      eventId: body.eventId,
      date: body.date
    });
    
    if (existingAttendance) {
      return NextResponse.json(
        { success: false, message: 'Attendance record already exists for this event and date' },
        { status: 409 }
      );
    }
    
    // Calculate totals
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalExcused = 0;
    
    if (body.members && body.members.length > 0) {
      body.members.forEach((member: { status: string }) => {
        if (member.status === 'Present') totalPresent++;
        else if (member.status === 'Absent') totalAbsent++;
        else if (member.status === 'Excused') totalExcused++;
      });
    }
    
    // Create new attendance record
    const attendance = new Attendance({
      ...body,
      totalPresent,
      totalAbsent,
      totalExcused,
      recordedBy: token.id
    });
    
    await attendance.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Attendance record created successfully',
        data: attendance
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create attendance record error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

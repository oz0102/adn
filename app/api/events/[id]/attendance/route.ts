import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Event from '@/models/event';
import Attendance from '@/models/attendance';
import { getToken } from 'next-auth/jwt';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    // Verify event exists
    const event = await Event.findById(params.id);
    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Get attendance records for this event
    const attendance = await Attendance.find({ eventId: params.id })
      .populate('members.memberId', 'firstName lastName email phoneNumber')
      .sort({ date: -1 });
    
    return NextResponse.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get event attendance error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

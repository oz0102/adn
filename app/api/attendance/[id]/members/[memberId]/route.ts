import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Attendance from '@/models/attendance';
import { getToken } from 'next-auth/jwt';

const memberAttendanceUpdateSchema = z.object({
  status: z.enum(['Present', 'Absent', 'Excused']),
  checkInTime: z.string().transform(val => new Date(val)).optional()
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string, memberId: string } }
) {
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
    const validation = memberAttendanceUpdateSchema.safeParse(body);
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
    
    // Verify attendance record exists
    const attendance = await Attendance.findById(params.id);
    if (!attendance) {
      return NextResponse.json(
        { success: false, message: 'Attendance record not found' },
        { status: 404 }
      );
    }
    
    // Find member in attendance record
    const memberIndex = attendance.members.findIndex(
      m => m.memberId.toString() === params.memberId
    );
    
    if (memberIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Member not found in this attendance record' },
        { status: 404 }
      );
    }
    
    // Update totals based on status change
    const oldStatus = attendance.members[memberIndex].status;
    const newStatus = body.status;
    
    if (oldStatus !== newStatus) {
      // Decrement old status count
      if (oldStatus === 'Present') attendance.totalPresent--;
      else if (oldStatus === 'Absent') attendance.totalAbsent--;
      else if (oldStatus === 'Excused') attendance.totalExcused--;
      
      // Increment new status count
      if (newStatus === 'Present') attendance.totalPresent++;
      else if (newStatus === 'Absent') attendance.totalAbsent++;
      else if (newStatus === 'Excused') attendance.totalExcused++;
    }
    
    // Update member attendance
    attendance.members[memberIndex].status = body.status;
    if (body.checkInTime) {
      attendance.members[memberIndex].checkInTime = body.checkInTime;
    }
    
    await attendance.save();
    
    return NextResponse.json({
      success: true,
      message: 'Member attendance updated successfully',
      data: attendance.members[memberIndex]
    });
  } catch (error) {
    console.error('Update member attendance error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

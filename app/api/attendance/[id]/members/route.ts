import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Attendance from '@/models/attendance';
import Member from '@/models/member';
import { getToken } from 'next-auth/jwt';

const memberAttendanceSchema = z.object({
  memberId: z.string(),
  status: z.enum(['Present', 'Absent', 'Excused']),
  checkInTime: z.string().transform(val => new Date(val)).optional()
});

export async function POST(
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
    
    const body = await req.json();
    
    // Validate request body
    const validation = memberAttendanceSchema.safeParse(body);
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
    
    // Verify member exists
    const member = await Member.findById(body.memberId);
    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Check if member is already in the attendance record
    const existingMemberIndex = attendance.members.findIndex(
      (m: { memberId: { toString: () => string } }) => m.memberId.toString() === body.memberId
    );
    
    if (existingMemberIndex !== -1) {
      return NextResponse.json(
        { success: false, message: 'Member is already in this attendance record' },
        { status: 409 }
      );
    }
    
    // Add member to attendance record
    attendance.members.push({
      memberId: body.memberId,
      status: body.status,
      checkInTime: body.checkInTime || new Date()
    });
    
    // Update totals
    if (body.status === 'Present') attendance.totalPresent++;
    else if (body.status === 'Absent') attendance.totalAbsent++;
    else if (body.status === 'Excused') attendance.totalExcused++;
    
    await attendance.save();
    
    return NextResponse.json({
      success: true,
      message: 'Member attendance marked successfully',
      data: attendance.members[attendance.members.length - 1]
    });
  } catch (error) {
    console.error('Mark member attendance error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

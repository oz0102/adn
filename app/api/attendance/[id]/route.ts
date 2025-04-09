import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Attendance from '@/models/attendance';
import Member from '@/models/member';
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
    
    const attendance = await Attendance.findById(params.id)
      .populate('eventId', 'title startDate endDate')
      .populate('recordedBy', 'email')
      .populate('members.memberId', 'firstName lastName email phoneNumber');
    
    if (!attendance) {
      return NextResponse.json(
        { success: false, message: 'Attendance record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Get attendance record error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    
    await connectToDatabase();
    
    const attendance = await Attendance.findById(params.id);
    
    if (!attendance) {
      return NextResponse.json(
        { success: false, message: 'Attendance record not found' },
        { status: 404 }
      );
    }
    
    // Update attendance fields
    if (body.members) {
      attendance.members = body.members;
      
      // Recalculate totals
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalExcused = 0;
      
      body.members.forEach(member => {
        if (member.status === 'Present') totalPresent++;
        else if (member.status === 'Absent') totalAbsent++;
        else if (member.status === 'Excused') totalExcused++;
      });
      
      attendance.totalPresent = totalPresent;
      attendance.totalAbsent = totalAbsent;
      attendance.totalExcused = totalExcused;
    }
    
    if (body.notes !== undefined) {
      attendance.notes = body.notes;
    }
    
    await attendance.save();
    
    return NextResponse.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Update attendance record error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token || !['Admin', 'Pastor'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const attendance = await Attendance.findById(params.id);
    
    if (!attendance) {
      return NextResponse.json(
        { success: false, message: 'Attendance record not found' },
        { status: 404 }
      );
    }
    
    await Attendance.deleteOne({ _id: params.id });
    
    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete attendance record error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

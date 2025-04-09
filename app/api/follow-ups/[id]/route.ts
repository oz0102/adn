import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import FollowUp from '@/models/followUp';
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
    
    const followUp = await FollowUp.findById(params.id)
      .populate('personId', 'firstName lastName email phoneNumber')
      .populate('assignedTo', 'email')
      .populate('attempts.conductedBy', 'email')
      .populate('newAttendee.referredBy', 'firstName lastName');
    
    if (!followUp) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    // If not admin or pastor, check if assigned to the user
    if (
      !['Admin', 'Pastor'].includes(token.role as string) && 
      followUp.assignedTo.toString() !== token.id
    ) {
      return NextResponse.json(
        { success: false, message: 'You can only view follow-ups assigned to you' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: followUp
    });
  } catch (error) {
    console.error('Get follow-up error:', error);
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
    
    const followUp = await FollowUp.findById(params.id);
    
    if (!followUp) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    // If not admin or pastor, check if assigned to the user
    if (
      !['Admin', 'Pastor'].includes(token.role as string) && 
      followUp.assignedTo.toString() !== token.id
    ) {
      return NextResponse.json(
        { success: false, message: 'You can only update follow-ups assigned to you' },
        { status: 403 }
      );
    }
    
    // Update follow-up fields
    if (body.status) followUp.status = body.status;
    if (body.assignedTo) followUp.assignedTo = body.assignedTo;
    if (body.nextFollowUpDate) followUp.nextFollowUpDate = new Date(body.nextFollowUpDate);
    
    await followUp.save();
    
    return NextResponse.json({
      success: true,
      message: 'Follow-up updated successfully',
      data: followUp
    });
  } catch (error) {
    console.error('Update follow-up error:', error);
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
    
    const followUp = await FollowUp.findById(params.id);
    
    if (!followUp) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    await FollowUp.deleteOne({ _id: params.id });
    
    return NextResponse.json({
      success: true,
      message: 'Follow-up deleted successfully'
    });
  } catch (error) {
    console.error('Delete follow-up error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

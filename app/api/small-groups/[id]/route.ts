import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import SmallGroup from '@/models/smallGroup';
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
    
    const smallGroup = await SmallGroup.findById(params.id)
      .populate('leaderId', 'firstName lastName email phoneNumber');
    
    if (!smallGroup) {
      return NextResponse.json(
        { success: false, message: 'Small group not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: smallGroup
    });
  } catch (error) {
    console.error('Get small group error:', error);
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
    
    if (!token || !['Admin', 'Pastor', 'ClusterLead', 'SmallGroupLead'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    await connectToDatabase();
    
    const smallGroup = await SmallGroup.findById(params.id);
    
    if (!smallGroup) {
      return NextResponse.json(
        { success: false, message: 'Small group not found' },
        { status: 404 }
      );
    }
    
    // If user is SmallGroupLead, verify they are the leader of this small group
    if (token.role === 'SmallGroupLead' && smallGroup.leaderId.toString() !== token.id) {
      return NextResponse.json(
        { success: false, message: 'You can only update small groups you lead' },
        { status: 403 }
      );
    }
    
    // Update small group fields
    Object.keys(body).forEach(key => {
      if (key !== '_id' && key !== 'groupId') {
        smallGroup[key] = body[key];
      }
    });
    
    await smallGroup.save();
    
    return NextResponse.json({
      success: true,
      message: 'Small group updated successfully',
      data: smallGroup
    });
  } catch (error) {
    console.error('Update small group error:', error);
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
    
    if (!token || !['Admin', 'Pastor', 'ClusterLead'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectToDatabase();
    
    const smallGroup = await SmallGroup.findById(params.id);
    
    if (!smallGroup) {
      return NextResponse.json(
        { success: false, message: 'Small group not found' },
        { status: 404 }
      );
    }
    
    // Check if there are members in this small group
    const membersCount = await Member.countDocuments({ smallGroupId: params.id });
    
    if (membersCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete small group with members. Reassign members first.' },
        { status: 400 }
      );
    }
    
    await SmallGroup.deleteOne({ _id: params.id });
    
    return NextResponse.json({
      success: true,
      message: 'Small group deleted successfully'
    });
  } catch (error) {
    console.error('Delete small group error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

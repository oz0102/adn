import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Member from '@/models/member';
import SmallGroup from '@/models/smallGroup';
import { getToken } from 'next-auth/jwt';

const smallGroupAssignSchema = z.object({
  smallGroupId: z.string()
});

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
    
    // Validate request body
    const validation = smallGroupAssignSchema.safeParse(body);
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
    
    // Verify small group exists
    const smallGroup = await SmallGroup.findById(body.smallGroupId);
    if (!smallGroup) {
      return NextResponse.json(
        { success: false, message: 'Small group not found' },
        { status: 404 }
      );
    }
    
    const member = await Member.findById(params.id);
    
    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Assign to small group
    member.smallGroupId = body.smallGroupId;
    member.lastUpdatedBy = token.id;
    
    await member.save();
    
    return NextResponse.json({
      success: true,
      message: 'Member assigned to small group successfully',
      data: {
        memberId: member._id,
        smallGroupId: member.smallGroupId
      }
    });
  } catch (error) {
    console.error('Assign to small group error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

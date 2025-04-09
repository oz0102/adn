import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Member from '@/models/member';
import Cluster from '@/models/cluster';
import { getToken } from 'next-auth/jwt';

const clusterAssignSchema = z.object({
  clusterId: z.string()
});

export async function PUT(
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
    
    const body = await req.json();
    
    // Validate request body
    const validation = clusterAssignSchema.safeParse(body);
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
    
    // Verify cluster exists
    const cluster = await Cluster.findById(body.clusterId);
    if (!cluster) {
      return NextResponse.json(
        { success: false, message: 'Cluster not found' },
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
    
    // Assign to cluster
    member.clusterId = body.clusterId;
    member.lastUpdatedBy = token.id;
    
    await member.save();
    
    return NextResponse.json({
      success: true,
      message: 'Member assigned to cluster successfully',
      data: {
        memberId: member._id,
        clusterId: member.clusterId
      }
    });
  } catch (error) {
    console.error('Assign to cluster error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

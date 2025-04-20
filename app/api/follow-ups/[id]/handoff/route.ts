// app/api/follow-ups/[id]/handoff/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import FollowUp from '@/models/followUp';
import { handoffToCluster } from '@/services/followUpService';
import { getToken } from 'next-auth/jwt';

const handoffSchema = z.object({
  clusterId: z.string(),
  notes: z.string().optional()
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
    const validation = handoffSchema.safeParse(body);
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
    
    // Verify follow-up exists
    const followUp = await FollowUp.findById(params.id);
    if (!followUp) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to handoff this follow-up
    if (token.role !== 'Admin' && token.role !== 'Pastor' && 
        followUp.assignedTo.toString() !== token.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to handoff this follow-up' },
        { status: 403 }
      );
    }
    
    // Process the handoff
    const updatedFollowUp = await handoffToCluster(
      params.id,
      body.clusterId,
      body.notes || '',
      token.id
    );
    
    return NextResponse.json({
      success: true,
      message: 'Follow-up handed off successfully',
      data: updatedFollowUp
    });
  } catch (error) {
    console.error('Handoff follow-up error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
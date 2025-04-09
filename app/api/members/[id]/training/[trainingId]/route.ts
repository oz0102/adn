import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Member from '@/models/member';
import { getToken } from 'next-auth/jwt';

const trainingUpdateSchema = z.object({
  program: z.string().optional(),
  startDate: z.string().transform(val => new Date(val)).optional(),
  completionDate: z.string().transform(val => new Date(val)).optional(),
  status: z.enum(['In Progress', 'Completed', 'Dropped']).optional(),
  notes: z.string().optional()
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string, trainingId: string } }
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
    const validation = trainingUpdateSchema.safeParse(body);
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
    
    const member = await Member.findById(params.id);
    
    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Find and update training
    const trainingIndex = member.training.findIndex(
      t => t._id.toString() === params.trainingId
    );
    
    if (trainingIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Training not found' },
        { status: 404 }
      );
    }
    
    // Update training fields
    Object.keys(body).forEach(key => {
      member.training[trainingIndex][key] = body[key];
    });
    
    member.lastUpdatedBy = token.id;
    
    await member.save();
    
    return NextResponse.json({
      success: true,
      message: 'Training updated successfully',
      data: member.training[trainingIndex]
    });
  } catch (error) {
    console.error('Update training error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

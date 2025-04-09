import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Member from '@/models/member';
import { getToken } from 'next-auth/jwt';

const trainingSchema = z.object({
  program: z.string(),
  startDate: z.string().transform(val => new Date(val)),
  completionDate: z.string().transform(val => new Date(val)).optional(),
  status: z.enum(['In Progress', 'Completed', 'Dropped']),
  notes: z.string().optional()
});

export async function POST(
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
    const validation = trainingSchema.safeParse(body);
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
    
    // Add training
    if (!member.training) {
      member.training = [];
    }
    
    member.training.push(body);
    member.lastUpdatedBy = token.id;
    
    await member.save();
    
    return NextResponse.json({
      success: true,
      message: 'Training added successfully',
      data: member.training[member.training.length - 1]
    });
  } catch (error) {
    console.error('Add training error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

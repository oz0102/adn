import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Member from '@/models/member';
import { getToken } from 'next-auth/jwt';

const spiritualGrowthSchema = z.object({
  stage: z.enum(['newConvert', 'waterBaptism', 'holyGhostBaptism', 'worker', 'minister', 'ordainedMinister']),
  date: z.string().transform(val => new Date(val)),
  notes: z.string().optional()
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
    const validation = spiritualGrowthSchema.safeParse(body);
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
    
    // Update spiritual growth
    if (!member.spiritualGrowth) {
      member.spiritualGrowth = {};
    }
    
    member.spiritualGrowth[body.stage] = {
      date: body.date,
      notes: body.notes || ''
    };
    
    member.lastUpdatedBy = token.id;
    
    await member.save();
    
    return NextResponse.json({
      success: true,
      message: 'Spiritual growth updated successfully',
      data: member.spiritualGrowth
    });
  } catch (error) {
    console.error('Update spiritual growth error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Member from '@/models/member';
import { getToken } from 'next-auth/jwt';

const skillSchema = z.object({
  name: z.string(),
  proficiencyLevel: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  certified: z.boolean()
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
    const validation = skillSchema.safeParse(body);
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
    
    // Add skill
    if (!member.skills) {
      member.skills = [];
    }
    
    member.skills.push(body);
    member.lastUpdatedBy = token.id;
    
    await member.save();
    
    return NextResponse.json({
      success: true,
      message: 'Skill added successfully',
      data: member.skills[member.skills.length - 1]
    });
  } catch (error) {
    console.error('Add skill error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

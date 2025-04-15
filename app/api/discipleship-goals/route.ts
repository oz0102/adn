import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import DiscipleshipGoal from '@/models/discipleshipGoal';
import { getToken } from 'next-auth/jwt';

const discipleshipGoalSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  goalType: z.enum(['Monthly', 'Quarterly', 'Annual']),
  targets: z.object({
    newConverts: z.number().int().min(0),
    waterBaptism: z.number().int().min(0),
    holyGhostBaptism: z.number().int().min(0),
    discipleshipTraining: z.number().int().min(0),
    leadership: z.number().int().min(0),
    churchAttendance: z.number().int().min(0)
  }),
  notes: z.string().optional()
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') ? parseInt(searchParams.get('year') || '') : null;
    const month = searchParams.get('month') ? parseInt(searchParams.get('month') || '') : null;
    const quarter = searchParams.get('quarter') ? parseInt(searchParams.get('quarter') || '') : null;
    const goalType = searchParams.get('goalType') || null;
    
    await connectToDatabase();
    
    // Build query
    let query: Record<string, unknown> = {};
    
    if (year) {
      query.year = year;
    }
    
    if (month) {
      query.month = month;
    }
    
    if (quarter) {
      query.quarter = quarter;
    }
    
    if (goalType) {
      query.goalType = goalType;
    }
    
    const goals = await DiscipleshipGoal.find(query)
      .populate('createdBy', 'email')
      .sort({ year: -1, quarter: -1, month: -1 });
    
    return NextResponse.json({
      success: true,
      data: goals
    });
  } catch (error) {
    console.error('Get discipleship goals error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token || !['Admin', 'Pastor'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate request body
    const validation = discipleshipGoalSchema.safeParse(body);
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
    
    // Check for existing goal with same period
    let existingQuery: Record<string, unknown> = {
      year: body.year,
      goalType: body.goalType
    };
    
    if (body.goalType === 'Monthly' && body.month) {
      existingQuery.month = body.month;
    } else if (body.goalType === 'Quarterly' && body.quarter) {
      existingQuery.quarter = body.quarter;
    }
    
    const existingGoal = await DiscipleshipGoal.findOne(existingQuery);
    
    if (existingGoal) {
      return NextResponse.json(
        { success: false, message: 'A goal for this period already exists' },
        { status: 409 }
      );
    }
    
    // Create new discipleship goal
    const goal = new DiscipleshipGoal({
      ...body,
      createdBy: token.id
    });
    
    await goal.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Discipleship goal created successfully',
        data: goal
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create discipleship goal error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

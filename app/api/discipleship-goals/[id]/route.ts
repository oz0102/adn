import { NextRequest, NextResponse } from 'next/server';
// Removed unused import
// import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import DiscipleshipGoal from '@/models/discipleshipGoal';
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
    
    const goal = await DiscipleshipGoal.findById(params.id)
      .populate('createdBy', 'email');
    
    if (!goal) {
      return NextResponse.json(
        { success: false, message: 'Discipleship goal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: goal
    });
  } catch (error) {
    console.error('Get discipleship goal error:', error);
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
    
    if (!token || !['Admin', 'Pastor'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    await connectToDatabase();
    
    const goal = await DiscipleshipGoal.findById(params.id);
    
    if (!goal) {
      return NextResponse.json(
        { success: false, message: 'Discipleship goal not found' },
        { status: 404 }
      );
    }
    
    // Update goal fields
    if (body.targets) goal.targets = body.targets;
    if (body.notes !== undefined) goal.notes = body.notes;
    
    await goal.save();
    
    return NextResponse.json({
      success: true,
      message: 'Discipleship goal updated successfully',
      data: goal
    });
  } catch (error) {
    console.error('Update discipleship goal error:', error);
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
    
    const goal = await DiscipleshipGoal.findById(params.id);
    
    if (!goal) {
      return NextResponse.json(
        { success: false, message: 'Discipleship goal not found' },
        { status: 404 }
      );
    }
    
    await DiscipleshipGoal.deleteOne({ _id: params.id });
    
    return NextResponse.json({
      success: true,
      message: 'Discipleship goal deleted successfully'
    });
  } catch (error) {
    console.error('Delete discipleship goal error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Team from '@/models/team';
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
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const skip = (page - 1) * limit;
    
    await connectToDatabase();
    
    // Verify team exists
    const team = await Team.findById(params.id);
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Get members in this team
    const members = await Member.find({ 'teams.teamId': params.id })
      .skip(skip)
      .limit(limit)
      .sort({ firstName: 1, lastName: 1 });
    
    const total = await Member.countDocuments({ 'teams.teamId': params.id });
    
    return NextResponse.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

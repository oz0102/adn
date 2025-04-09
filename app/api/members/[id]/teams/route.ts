import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Member from '@/models/member';
import Team from '@/models/team';
import { getToken } from 'next-auth/jwt';

const teamAddSchema = z.object({
  teamId: z.string(),
  role: z.enum(['Member', 'Assistant', 'Lead'])
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
    const validation = teamAddSchema.safeParse(body);
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
    
    // Verify team exists
    const team = await Team.findById(body.teamId);
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
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
    
    // Check if member is already in the team
    const existingTeam = member.teams.find(t => t.teamId.toString() === body.teamId);
    if (existingTeam) {
      return NextResponse.json(
        { success: false, message: 'Member is already in this team' },
        { status: 409 }
      );
    }
    
    // Add to team
    member.teams.push({
      teamId: body.teamId,
      role: body.role,
      joinDate: new Date()
    });
    
    member.lastUpdatedBy = token.id;
    
    await member.save();
    
    // Update team members list
    if (body.role === 'Lead') {
      team.leaderId = member._id;
    } else if (body.role === 'Assistant') {
      if (!team.assistantLeaderIds.includes(member._id)) {
        team.assistantLeaderIds.push(member._id);
      }
    }
    
    if (!team.members.includes(member._id)) {
      team.members.push(member._id);
    }
    
    await team.save();
    
    return NextResponse.json({
      success: true,
      message: 'Member added to team successfully',
      data: member.teams[member.teams.length - 1]
    });
  } catch (error) {
    console.error('Add to team error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

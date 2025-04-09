import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Member from '@/models/member';
import Team from '@/models/team';
import { getToken } from 'next-auth/jwt';

const teamRoleUpdateSchema = z.object({
  role: z.enum(['Member', 'Assistant', 'Lead'])
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string, teamId: string } }
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
    const validation = teamRoleUpdateSchema.safeParse(body);
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
    const team = await Team.findById(params.teamId);
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
    
    // Find team membership
    const teamIndex = member.teams.findIndex(
      t => t.teamId.toString() === params.teamId
    );
    
    if (teamIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Member is not in this team' },
        { status: 404 }
      );
    }
    
    const oldRole = member.teams[teamIndex].role;
    const newRole = body.role;
    
    // Update team role
    member.teams[teamIndex].role = newRole;
    member.lastUpdatedBy = token.id;
    
    await member.save();
    
    // Update team leadership if role changed
    if (oldRole !== newRole) {
      // Handle old role removal
      if (oldRole === 'Lead') {
        team.leaderId = null;
      } else if (oldRole === 'Assistant') {
        team.assistantLeaderIds = team.assistantLeaderIds.filter(
          id => id.toString() !== params.id
        );
      }
      
      // Handle new role assignment
      if (newRole === 'Lead') {
        team.leaderId = member._id;
      } else if (newRole === 'Assistant') {
        if (!team.assistantLeaderIds.includes(member._id)) {
          team.assistantLeaderIds.push(member._id);
        }
      }
      
      await team.save();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Team role updated successfully',
      data: member.teams[teamIndex]
    });
  } catch (error) {
    console.error('Update team role error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

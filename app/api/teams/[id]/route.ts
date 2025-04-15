import { NextRequest, NextResponse } from 'next/server';
// z is not used in this file
// import { z } from 'zod';
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
    
    await connectToDatabase();
    
    const team = await Team.findById(params.id)
      .populate('leaderId', 'firstName lastName email phoneNumber')
      .populate('assistantLeaderIds', 'firstName lastName email phoneNumber')
      .populate('members', 'firstName lastName email phoneNumber');
    
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Get team error:', error);
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
    
    if (!token || !['Admin', 'Pastor', 'TeamLead'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    await connectToDatabase();
    
    const team = await Team.findById(params.id);
    
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      );
    }
    
    // If user is TeamLead, verify they are the leader of this team
    if (token.role === 'TeamLead' && team.leaderId?.toString() !== token.id) {
      return NextResponse.json(
        { success: false, message: 'You can only update teams you lead' },
        { status: 403 }
      );
    }
    
    // Handle leader change
    if (body.leaderId && body.leaderId !== team.leaderId?.toString()) {
      // Verify new leader exists
      const newLeader = await Member.findById(body.leaderId);
      if (!newLeader) {
        return NextResponse.json(
          { success: false, message: 'New leader not found' },
          { status: 404 }
        );
      }
      
      // Update old leader's team role if exists
      if (team.leaderId) {
        await Member.findOneAndUpdate(
          { 
            _id: team.leaderId,
            'teams.teamId': team._id 
          },
          { 
            $set: { 'teams.$.role': 'Member' } 
          }
        );
      }
      
      // Update new leader's team role or add team to new leader
      const memberInTeam = await Member.findOne({
        _id: body.leaderId,
        'teams.teamId': team._id
      });
      
      if (memberInTeam) {
        await Member.findOneAndUpdate(
          { 
            _id: body.leaderId,
            'teams.teamId': team._id 
          },
          { 
            $set: { 'teams.$.role': 'Lead' } 
          }
        );
      } else {
        await Member.findByIdAndUpdate(body.leaderId, {
          $push: {
            teams: {
              teamId: team._id,
              role: 'Lead',
              joinDate: new Date()
            }
          }
        });
        
        // Add to team members if not already there
        if (!team.members.includes(body.leaderId)) {
          team.members.push(body.leaderId);
        }
      }
      
      team.leaderId = body.leaderId;
    }
    
    // Handle assistant leaders changes
    if (body.assistantLeaderIds) {
      // Find removed assistants
      const removedAssistants = team.assistantLeaderIds.filter(
        id => !body.assistantLeaderIds.includes(id.toString())
      );
      
      // Find new assistants
      const newAssistants = body.assistantLeaderIds.filter(
        id => !team.assistantLeaderIds.map(a => a.toString()).includes(id)
      );
      
      // Update removed assistants' team role
      for (const assistantId of removedAssistants) {
        await Member.findOneAndUpdate(
          { 
            _id: assistantId,
            'teams.teamId': team._id 
          },
          { 
            $set: { 'teams.$.role': 'Member' } 
          }
        );
      }
      
      // Update new assistants' team role or add team to new assistants
      for (const assistantId of newAssistants) {
        // Verify assistant exists
        const assistant = await Member.findById(assistantId);
        if (!assistant) {
          return NextResponse.json(
            { success: false, message: `Assistant with ID ${assistantId} not found` },
            { status: 404 }
          );
        }
        
        const memberInTeam = await Member.findOne({
          _id: assistantId,
          'teams.teamId': team._id
        });
        
        if (memberInTeam) {
          await Member.findOneAndUpdate(
            { 
              _id: assistantId,
              'teams.teamId': team._id 
            },
            { 
              $set: { 'teams.$.role': 'Assistant' } 
            }
          );
        } else {
          await Member.findByIdAndUpdate(assistantId, {
            $push: {
              teams: {
                teamId: team._id,
                role: 'Assistant',
                joinDate: new Date()
              }
            }
          });
          
          // Add to team members if not already there
          if (!team.members.includes(assistantId)) {
            team.members.push(assistantId);
          }
        }
      }
      
      team.assistantLeaderIds = body.assistantLeaderIds;
    }
    
    // Update other team fields
    if (body.name) team.name = body.name;
    if (body.description) team.description = body.description;
    if (body.category) team.category = body.category;
    if (body.meetingSchedule) team.meetingSchedule = body.meetingSchedule;
    
    await team.save();
    
    return NextResponse.json({
      success: true,
      message: 'Team updated successfully',
      data: team
    });
  } catch (error) {
    console.error('Update team error:', error);
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
    
    const team = await Team.findById(params.id);
    
    if (!team) {
      return NextResponse.json(
        { success: false, message: 'Team not found' },
        { status: 404 }
      );
    }
    
    // Remove team from all members
    await Member.updateMany(
      { 'teams.teamId': team._id },
      { $pull: { teams: { teamId: team._id } } }
    );
    
    await Team.deleteOne({ _id: params.id });
    
    return NextResponse.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


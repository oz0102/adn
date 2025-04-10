import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import FollowUp from '@/models/followUp';
import connectToDatabase from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Connect to database
    await connectToDatabase();
    
    // Get follow-up by ID
    const followUp = await FollowUp.findById(id)
      .populate('memberId', 'firstName lastName email phone profileImage')
      .populate('assignedTo', 'firstName lastName email')
      .lean();
    
    if (!followUp) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: followUp
    });
  } catch (error) {
    console.error('Get follow-up error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching follow-up' },
      { status: 500 }
    );
  }
}

// PUT update follow-up
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;
    const updateData = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Check if follow-up exists
    const existingFollowUp = await FollowUp.findById(id);
    
    if (!existingFollowUp) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update this follow-up
    if (
      token.role !== 'Admin' && 
      token.role !== 'Pastor' && 
      existingFollowUp.assignedTo.toString() !== token.id
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this follow-up' },
        { status: 403 }
      );
    }
    
    // Update follow-up
    const updatedFollowUp = await FollowUp.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('memberId', 'firstName lastName email phone profileImage')
      .populate('assignedTo', 'firstName lastName email');
    
    return NextResponse.json({
      success: true,
      data: updatedFollowUp
    });
  } catch (error) {
    console.error('Update follow-up error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating follow-up' },
      { status: 500 }
    );
  }
}

// DELETE follow-up
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = params;
    
    // Connect to database
    await connectToDatabase();
    
    // Check if follow-up exists
    const existingFollowUp = await FollowUp.findById(id);
    
    if (!existingFollowUp) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this follow-up
    if (
      token.role !== 'Admin' && 
      token.role !== 'Pastor' && 
      existingFollowUp.assignedTo.toString() !== token.id
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this follow-up' },
        { status: 403 }
      );
    }
    
    // Delete follow-up
    await FollowUp.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Follow-up deleted successfully'
    });
  } catch (error) {
    console.error('Delete follow-up error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting follow-up' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import SmallGroup from '@/models/smallGroup';
import Member from '@/models/member';
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
    
    // Get small group by ID
    const smallGroup = await SmallGroup.findById(id)
      .populate('leader', 'firstName lastName email phone profileImage')
      .populate('clusterId', 'name leader')
      .lean();
    
    if (!smallGroup) {
      return NextResponse.json(
        { success: false, message: 'Small group not found' },
        { status: 404 }
      );
    }
    
    // Get members in this small group
    const members = await Member.find({ smallGroupId: id })
      .select('firstName lastName email phone status profileImage')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        ...smallGroup,
        members,
        stats: {
          membersCount: members.length
        }
      }
    });
  } catch (error) {
    console.error('Get small group error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching small group' },
      { status: 500 }
    );
  }
}

// PUT update small group
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
    
    // Check if small group exists
    const existingSmallGroup = await SmallGroup.findById(id);
    
    if (!existingSmallGroup) {
      return NextResponse.json(
        { success: false, message: 'Small group not found' },
        { status: 404 }
      );
    }
    
    // Check if user has appropriate role
    if (
      token.role !== 'Admin' && 
      token.role !== 'Pastor' && 
      token.role !== 'ClusterLead' &&
      existingSmallGroup.leader.toString() !== token.id
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this small group' },
        { status: 403 }
      );
    }
    
    // Check if name is being updated and is already in use
    if (updateData.name && updateData.name !== existingSmallGroup.name) {
      const nameExists = await SmallGroup.findOne({ 
        name: updateData.name,
        _id: { $ne: id }
      });
      
      if (nameExists) {
        return NextResponse.json(
          { success: false, message: 'Small group name is already in use' },
          { status: 400 }
        );
      }
    }
    
    // Update small group
    const updatedSmallGroup = await SmallGroup.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('leader', 'firstName lastName email phone profileImage')
      .populate('clusterId', 'name');
    
    return NextResponse.json({
      success: true,
      data: updatedSmallGroup
    });
  } catch (error) {
    console.error('Update small group error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating small group' },
      { status: 500 }
    );
  }
}

// DELETE small group
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

    // Check if user has appropriate role
    if (token.role !== 'Admin' && token.role !== 'Pastor' && token.role !== 'ClusterLead') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete small groups' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    // Connect to database
    await connectToDatabase();
    
    // Check if small group has members
    const membersCount = await Member.countDocuments({ smallGroupId: id });
    
    if (membersCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete small group with associated members',
          data: { membersCount }
        },
        { status: 400 }
      );
    }
    
    // Delete small group
    const deletedSmallGroup = await SmallGroup.findByIdAndDelete(id);
    
    if (!deletedSmallGroup) {
      return NextResponse.json(
        { success: false, message: 'Small group not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Small group deleted successfully'
    });
  } catch (error) {
    console.error('Delete small group error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting small group' },
      { status: 500 }
    );
  }
}

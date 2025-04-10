import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Cluster from '@/models/cluster';
import Member from '@/models/member';
import SmallGroup from '@/models/smallGroup';
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
    
    // Get cluster by ID
    const cluster = await Cluster.findById(id)
      .populate('leader', 'firstName lastName email phone profileImage')
      .lean();
    
    if (!cluster) {
      return NextResponse.json(
        { success: false, message: 'Cluster not found' },
        { status: 404 }
      );
    }
    
    // Get small groups in this cluster
    const smallGroups = await SmallGroup.find({ clusterId: id })
      .populate('leader', 'firstName lastName email')
      .lean();
    
    // Get members in this cluster
    const members = await Member.find({ clusterId: id })
      .select('firstName lastName email phone status profileImage')
      .lean();
    
    return NextResponse.json({
      success: true,
      data: {
        ...cluster,
        smallGroups,
        members,
        stats: {
          smallGroupsCount: smallGroups.length,
          membersCount: members.length
        }
      }
    });
  } catch (error) {
    console.error('Get cluster error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching cluster' },
      { status: 500 }
    );
  }
}

// PUT update cluster
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

    // Check if user has admin or pastor role
    if (token.role !== 'Admin' && token.role !== 'Pastor' && token.role !== 'ClusterLead') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update clusters' },
        { status: 403 }
      );
    }

    const { id } = params;
    const updateData = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Check if cluster exists
    const existingCluster = await Cluster.findById(id);
    
    if (!existingCluster) {
      return NextResponse.json(
        { success: false, message: 'Cluster not found' },
        { status: 404 }
      );
    }
    
    // If user is ClusterLead, check if they are the leader of this cluster
    if (token.role === 'ClusterLead' && existingCluster.leader.toString() !== token.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this cluster' },
        { status: 403 }
      );
    }
    
    // Check if name is being updated and is already in use
    if (updateData.name && updateData.name !== existingCluster.name) {
      const nameExists = await Cluster.findOne({ 
        name: updateData.name,
        _id: { $ne: id }
      });
      
      if (nameExists) {
        return NextResponse.json(
          { success: false, message: 'Cluster name is already in use' },
          { status: 400 }
        );
      }
    }
    
    // Update cluster
    const updatedCluster = await Cluster.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('leader', 'firstName lastName email phone profileImage');
    
    return NextResponse.json({
      success: true,
      data: updatedCluster
    });
  } catch (error) {
    console.error('Update cluster error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating cluster' },
      { status: 500 }
    );
  }
}

// DELETE cluster
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

    // Check if user has admin or pastor role
    if (token.role !== 'Admin' && token.role !== 'Pastor') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete clusters' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    // Connect to database
    await connectToDatabase();
    
    // Check if cluster has members or small groups
    const membersCount = await Member.countDocuments({ clusterId: id });
    const smallGroupsCount = await SmallGroup.countDocuments({ clusterId: id });
    
    if (membersCount > 0 || smallGroupsCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cannot delete cluster with associated members or small groups',
          data: { membersCount, smallGroupsCount }
        },
        { status: 400 }
      );
    }
    
    // Delete cluster
    const deletedCluster = await Cluster.findByIdAndDelete(id);
    
    if (!deletedCluster) {
      return NextResponse.json(
        { success: false, message: 'Cluster not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Cluster deleted successfully'
    });
  } catch (error) {
    console.error('Delete cluster error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting cluster' },
      { status: 500 }
    );
  }
}

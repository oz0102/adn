import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import Cluster from '@/models/cluster';
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
    
    const cluster = await Cluster.findById(params.id)
      .populate('leaderId', 'firstName lastName email phoneNumber');
    
    if (!cluster) {
      return NextResponse.json(
        { success: false, message: 'Cluster not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: cluster
    });
  } catch (error) {
    console.error('Get cluster error:', error);
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
    
    if (!token || !['Admin', 'Pastor', 'ClusterLead'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    await connectToDatabase();
    
    const cluster = await Cluster.findById(params.id);
    
    if (!cluster) {
      return NextResponse.json(
        { success: false, message: 'Cluster not found' },
        { status: 404 }
      );
    }
    
    // If user is ClusterLead, verify they are the leader of this cluster
    if (token.role === 'ClusterLead' && cluster.leaderId.toString() !== token.id) {
      return NextResponse.json(
        { success: false, message: 'You can only update clusters you lead' },
        { status: 403 }
      );
    }
    
    // Update cluster fields
    Object.keys(body).forEach(key => {
      if (key !== '_id' && key !== 'clusterId') {
        cluster[key] = body[key];
      }
    });
    
    await cluster.save();
    
    return NextResponse.json({
      success: true,
      message: 'Cluster updated successfully',
      data: cluster
    });
  } catch (error) {
    console.error('Update cluster error:', error);
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
    
    const cluster = await Cluster.findById(params.id);
    
    if (!cluster) {
      return NextResponse.json(
        { success: false, message: 'Cluster not found' },
        { status: 404 }
      );
    }
    
    // Check if there are members in this cluster
    const membersCount = await Member.countDocuments({ clusterId: params.id });
    
    if (membersCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete cluster with members. Reassign members first.' },
        { status: 400 }
      );
    }
    
    await Cluster.deleteOne({ _id: params.id });
    
    return NextResponse.json({
      success: true,
      message: 'Cluster deleted successfully'
    });
  } catch (error) {
    console.error('Delete cluster error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
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
    
    // Get member by ID
    const member = await Member.findById(id)
      .populate('clusterId', 'name')
      .populate('smallGroupId', 'name')
      .populate('teams', 'name')
      .lean();
    
    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Get member error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching member' },
      { status: 500 }
    );
  }
}

// PUT update member
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
    
    // Check if member exists
    const existingMember = await Member.findById(id);
    
    if (!existingMember) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }
    
    // Check if email is being updated and is already in use
    if (updateData.email && updateData.email !== existingMember.email) {
      const emailExists = await Member.findOne({ 
        email: updateData.email,
        _id: { $ne: id }
      });
      
      if (emailExists) {
        return NextResponse.json(
          { success: false, message: 'Email is already in use by another member' },
          { status: 400 }
        );
      }
    }
    
    // Check if phone is being updated and is already in use
    if (updateData.phone && updateData.phone !== existingMember.phone) {
      const phoneExists = await Member.findOne({ 
        phone: updateData.phone,
        _id: { $ne: id }
      });
      
      if (phoneExists) {
        return NextResponse.json(
          { success: false, message: 'Phone number is already in use by another member' },
          { status: 400 }
        );
      }
    }
    
    // Update member
    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('clusterId', 'name')
      .populate('smallGroupId', 'name')
      .populate('teams', 'name');
    
    return NextResponse.json({
      success: true,
      data: updatedMember
    });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating member' },
      { status: 500 }
    );
  }
}

// DELETE member
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

    // Check if user has admin role
    if (token.role !== 'Admin' && token.role !== 'Pastor') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete members' },
        { status: 403 }
      );
    }

    const { id } = params;
    
    // Connect to database
    await connectToDatabase();
    
    // Delete member
    const deletedMember = await Member.findByIdAndDelete(id);
    
    if (!deletedMember) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting member' },
      { status: 500 }
    );
  }
}

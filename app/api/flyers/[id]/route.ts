import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import ProgramFlyer from '@/models/programFlyer';
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
    
    // Get flyer by ID
    const flyer = await ProgramFlyer.findById(id)
      .populate('createdBy', 'firstName lastName email')
      .populate('eventId', 'name startDate location')
      .lean();
    
    if (!flyer) {
      return NextResponse.json(
        { success: false, message: 'Flyer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: flyer
    });
  } catch (error) {
    console.error('Get flyer error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching flyer' },
      { status: 500 }
    );
  }
}

// PUT update flyer
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
    
    // Check if flyer exists
    const existingFlyer = await ProgramFlyer.findById(id);
    
    if (!existingFlyer) {
      return NextResponse.json(
        { success: false, message: 'Flyer not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update this flyer
    if (
      token.role !== 'Admin' && 
      token.role !== 'Pastor' && 
      existingFlyer.createdBy.toString() !== token.id
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this flyer' },
        { status: 403 }
      );
    }
    
    // Update flyer
    const updatedFlyer = await ProgramFlyer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'firstName lastName email')
      .populate('eventId', 'name startDate location');
    
    return NextResponse.json({
      success: true,
      data: updatedFlyer
    });
  } catch (error) {
    console.error('Update flyer error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating flyer' },
      { status: 500 }
    );
  }
}

// DELETE flyer
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
    
    // Check if flyer exists
    const existingFlyer = await ProgramFlyer.findById(id);
    
    if (!existingFlyer) {
      return NextResponse.json(
        { success: false, message: 'Flyer not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this flyer
    if (
      token.role !== 'Admin' && 
      token.role !== 'Pastor' && 
      existingFlyer.createdBy.toString() !== token.id
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this flyer' },
        { status: 403 }
      );
    }
    
    // Delete flyer
    await ProgramFlyer.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Flyer deleted successfully'
    });
  } catch (error) {
    console.error('Delete flyer error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting flyer' },
      { status: 500 }
    );
  }
}

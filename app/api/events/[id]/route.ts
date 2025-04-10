import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import Event from '@/models/event';
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
    
    // Get event by ID
    const event = await Event.findById(id)
      .populate('organizer', 'firstName lastName email')
      .populate('attendees', 'firstName lastName email')
      .lean();
    
    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching event' },
      { status: 500 }
    );
  }
}

// PUT update event
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
    
    // Check if event exists
    const existingEvent = await Event.findById(id);
    
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update this event
    if (
      token.role !== 'Admin' && 
      token.role !== 'Pastor' && 
      existingEvent.organizer.toString() !== token.id
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this event' },
        { status: 403 }
      );
    }
    
    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('organizer', 'firstName lastName email')
      .populate('attendees', 'firstName lastName email');
    
    return NextResponse.json({
      success: true,
      data: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating event' },
      { status: 500 }
    );
  }
}

// DELETE event
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
    
    // Check if event exists
    const existingEvent = await Event.findById(id);
    
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to delete this event
    if (
      token.role !== 'Admin' && 
      token.role !== 'Pastor' && 
      existingEvent.organizer.toString() !== token.id
    ) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this event' },
        { status: 403 }
      );
    }
    
    // Delete event
    await Event.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting event' },
      { status: 500 }
    );
  }
}

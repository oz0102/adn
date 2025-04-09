import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import ProgramFlyer from '@/models/programFlyer';
import Event from '@/models/event';
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
    
    const flyer = await ProgramFlyer.findById(params.id)
      .populate('templateId', 'name category templateData')
      .populate('eventId', 'title startDate')
      .populate('createdBy', 'email');
    
    if (!flyer) {
      return NextResponse.json(
        { success: false, message: 'Program flyer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: flyer
    });
  } catch (error) {
    console.error('Get program flyer error:', error);
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
    
    if (!token || !['Admin', 'Pastor', 'MediaTeam'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    await connectToDatabase();
    
    const flyer = await ProgramFlyer.findById(params.id);
    
    if (!flyer) {
      return NextResponse.json(
        { success: false, message: 'Program flyer not found' },
        { status: 404 }
      );
    }
    
    // Handle status change from Draft to Published
    const oldStatus = flyer.status;
    const newStatus = body.status || oldStatus;
    
    // Update flyer fields
    if (body.title) flyer.title = body.title;
    if (body.templateId) flyer.templateId = body.templateId;
    if (body.content) flyer.content = body.content;
    if (body.status) flyer.status = body.status;
    if (body.publishDate) flyer.publishDate = new Date(body.publishDate);
    
    // If event is being changed, update the old event to remove flyer reference
    if (body.eventId && body.eventId !== flyer.eventId?.toString()) {
      if (flyer.eventId) {
        await Event.findByIdAndUpdate(flyer.eventId, { $unset: { flyer: 1 } });
      }
      
      flyer.eventId = body.eventId;
      
      // If status is Published, update new event with flyer reference
      if (newStatus === 'Published') {
        await Event.findByIdAndUpdate(body.eventId, { flyer: flyer._id });
      }
    } 
    // If status is changing to Published and has an event, update event with flyer reference
    else if (oldStatus !== 'Published' && newStatus === 'Published' && flyer.eventId) {
      await Event.findByIdAndUpdate(flyer.eventId, { flyer: flyer._id });
    }
    // If status is changing from Published and has an event, remove flyer reference from event
    else if (oldStatus === 'Published' && newStatus !== 'Published' && flyer.eventId) {
      await Event.findByIdAndUpdate(flyer.eventId, { $unset: { flyer: 1 } });
    }
    
    await flyer.save();
    
    return NextResponse.json({
      success: true,
      message: 'Program flyer updated successfully',
      data: flyer
    });
  } catch (error) {
    console.error('Update program flyer error:', error);
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
    
    const flyer = await ProgramFlyer.findById(params.id);
    
    if (!flyer) {
      return NextResponse.json(
        { success: false, message: 'Program flyer not found' },
        { status: 404 }
      );
    }
    
    // If flyer is published and has an event, remove flyer reference from event
    if (flyer.status === 'Published' && flyer.eventId) {
      await Event.findByIdAndUpdate(flyer.eventId, { $unset: { flyer: 1 } });
    }
    
    await ProgramFlyer.deleteOne({ _id: params.id });
    
    return NextResponse.json({
      success: true,
      message: 'Program flyer deleted successfully'
    });
  } catch (error) {
    console.error('Delete program flyer error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

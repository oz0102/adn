import { NextRequest, NextResponse } from 'next/server';
// Removed unused import
// import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import FlyerTemplate from '@/models/flyerTemplate';
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
    
    const template = await FlyerTemplate.findById(params.id)
      .populate('createdBy', 'email');
    
    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Flyer template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Get flyer template error:', error);
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
    
    const template = await FlyerTemplate.findById(params.id);
    
    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Flyer template not found' },
        { status: 404 }
      );
    }
    
    // Update template fields
    if (body.name) template.name = body.name;
    if (body.description) template.description = body.description;
    if (body.category) template.category = body.category;
    if (body.templateData) template.templateData = body.templateData;
    if (body.isActive !== undefined) template.isActive = body.isActive;
    
    await template.save();
    
    return NextResponse.json({
      success: true,
      message: 'Flyer template updated successfully',
      data: template
    });
  } catch (error) {
    console.error('Update flyer template error:', error);
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
    
    const template = await FlyerTemplate.findById(params.id);
    
    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Flyer template not found' },
        { status: 404 }
      );
    }
    
    await FlyerTemplate.deleteOne({ _id: params.id });
    
    return NextResponse.json({
      success: true,
      message: 'Flyer template deleted successfully'
    });
  } catch (error) {
    console.error('Delete flyer template error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

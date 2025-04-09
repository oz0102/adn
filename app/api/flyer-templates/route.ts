import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import FlyerTemplate from '@/models/flyerTemplate';
import { getToken } from 'next-auth/jwt';

const flyerTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.enum(['Sunday Service', 'Midweek Service', 'Special Event', 'Conference', 'Other']),
  templateData: z.object({
    backgroundImage: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    font: z.string().optional(),
    layout: z.string()
  }),
  isActive: z.boolean().optional()
});

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const isActive = searchParams.get('isActive');
    
    const skip = (page - 1) * limit;
    
    await connectToDatabase();
    
    // Build query
    let query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const templates = await FlyerTemplate.find(query)
      .populate('createdBy', 'email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await FlyerTemplate.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get flyer templates error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
    if (!token || !['Admin', 'Pastor', 'MediaTeam'].includes(token.role as string)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate request body
    const validation = flyerTemplateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input data', 
          errors: validation.error.errors 
        },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Create new flyer template
    const template = new FlyerTemplate({
      ...body,
      isActive: body.isActive !== undefined ? body.isActive : true,
      createdBy: token.id
    });
    
    await template.save();
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Flyer template created successfully',
        data: template
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create flyer template error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

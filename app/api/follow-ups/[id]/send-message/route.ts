// app/api/follow-ups/[id]/send-message/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import FollowUp from '@/models/followUp';
import { sendFollowUpMessage } from '@/services/followUpService';
import { getToken } from 'next-auth/jwt';

const messageSchema = z.object({
  message: z.string().optional(),
  channels: z.array(z.enum(['email', 'sms', 'whatsapp'])),
  useAiGenerated: z.boolean().optional()
});

export async function POST(
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
    
    const body = await req.json();
    
    // Validate request body
    const validation = messageSchema.safeParse(body);
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
    
    // Verify follow-up exists
    const followUp = await FollowUp.findById(params.id);
    if (!followUp) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to send messages for this follow-up
    if (token.role !== 'Admin' && token.role !== 'Pastor' && 
        followUp.assignedTo.toString() !== token.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to send messages for this follow-up' },
        { status: 403 }
      );
    }
    
    // Send message
    const result = await sendFollowUpMessage(
      params.id,
      body.message || '',
      body.channels,
      body.useAiGenerated
    );
    
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Send follow-up message error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
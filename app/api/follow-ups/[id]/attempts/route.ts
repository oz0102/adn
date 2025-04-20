// import { NextRequest, NextResponse } from 'next/server';
// import { z } from 'zod';
// import connectToDatabase from '@/lib/db';
// import FollowUp from '@/models/followUp';
// import { getToken } from 'next-auth/jwt';

// const followUpAttemptSchema = z.object({
//   method: z.enum(['Phone Call', 'SMS', 'WhatsApp', 'Email', 'In Person']),
//   date: z.string().transform(val => new Date(val)),
//   notes: z.string(),
//   outcome: z.enum(['Successful', 'No Response', 'Declined', 'Rescheduled']),
//   nextSteps: z.string().optional()
// });

// export async function POST(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    
//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: 'Unauthorized' },
//         { status: 401 }
//       );
//     }
    
//     const body = await req.json();
    
//     // Validate request body
//     const validation = followUpAttemptSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json(
//         { 
//           success: false, 
//           message: 'Invalid input data', 
//           errors: validation.error.errors 
//         },
//         { status: 400 }
//       );
//     }
    
//     await connectToDatabase();
    
//     const followUp = await FollowUp.findById(params.id);
    
//     if (!followUp) {
//       return NextResponse.json(
//         { success: false, message: 'Follow-up not found' },
//         { status: 404 }
//       );
//     }
    
//     // If not admin or pastor, check if assigned to the user
//     if (
//       !['Admin', 'Pastor'].includes(token.role as string) && 
//       followUp.assignedTo.toString() !== token.id
//     ) {
//       return NextResponse.json(
//         { success: false, message: 'You can only add attempts to follow-ups assigned to you' },
//         { status: 403 }
//       );
//     }
    
//     // Add attempt
//     followUp.attempts.push({
//       ...body,
//       conductedBy: token.id
//     });
    
//     // Update status based on outcome
//     if (body.outcome === 'Successful') {
//       followUp.status = 'Completed';
//     } else if (body.outcome === 'Declined') {
//       followUp.status = 'Failed';
//     } else if (body.outcome === 'Rescheduled' && body.nextSteps) {
//       followUp.status = 'In Progress';
//       followUp.nextFollowUpDate = new Date(body.nextSteps);
//     } else {
//       followUp.status = 'In Progress';
//     }
    
//     await followUp.save();
    
//     return NextResponse.json({
//       success: true,
//       message: 'Follow-up attempt added successfully',
//       data: followUp.attempts[followUp.attempts.length - 1]
//     });
//   } catch (error) {
//     console.error('Add follow-up attempt error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }


// app/api/follow-ups/[id]/attempts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/db';
import FollowUp from '@/models/followUp';
import { addFollowUpAttempt } from '@/services/followUpService';
import { getToken } from 'next-auth/jwt';

const followUpAttemptSchema = z.object({
  contactMethod: z.enum(['Email', 'SMS', 'WhatsApp', 'Call', 'In Person']),
  response: z.enum(['Positive', 'Negative', 'No Response']),
  notes: z.string(),
  prayerRequests: z.array(z.string()).optional()
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
    const validation = followUpAttemptSchema.safeParse(body);
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
    
    // Check if user is authorized to add attempts to this follow-up
    if (token.role !== 'Admin' && token.role !== 'Pastor' && 
        followUp.assignedTo.toString() !== token.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this follow-up' },
        { status: 403 }
      );
    }
    
    // Add follow-up attempt
    const updatedFollowUp = await addFollowUpAttempt(
      params.id, 
      body,
      token.id
    );
    
    return NextResponse.json({
      success: true,
      message: 'Follow-up attempt added successfully',
      data: updatedFollowUp
    });
  } catch (error) {
    console.error('Add follow-up attempt error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
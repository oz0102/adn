// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import FollowUp from '@/models/followUp';
// import connectToDatabase from '@/lib/db';

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Verify authentication
//     const token = await getToken({ 
//       req, 
//       secret: process.env.NEXTAUTH_SECRET 
//     });
    
//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: 'Not authenticated' },
//         { status: 401 }
//       );
//     }

//     const { id } = params;
    
//     // Connect to database
//     await connectToDatabase();
    
//     // Get follow-up by ID
//     const followUp = await FollowUp.findById(id)
//       .populate('memberId', 'firstName lastName email phone profileImage')
//       .populate('assignedTo', 'firstName lastName email')
//       .lean();
    
//     if (!followUp) {
//       return NextResponse.json(
//         { success: false, message: 'Follow-up not found' },
//         { status: 404 }
//       );
//     }
    
//     return NextResponse.json({
//       success: true,
//       data: followUp
//     });
//   } catch (error) {
//     console.error('Get follow-up error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Error fetching follow-up' },
//       { status: 500 }
//     );
//   }
// }

// // PUT update follow-up
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Verify authentication
//     const token = await getToken({ 
//       req, 
//       secret: process.env.NEXTAUTH_SECRET 
//     });
    
//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: 'Not authenticated' },
//         { status: 401 }
//       );
//     }

//     const { id } = params;
//     const updateData = await req.json();
    
//     // Connect to database
//     await connectToDatabase();
    
//     // Check if follow-up exists
//     const existingFollowUp = await FollowUp.findById(id);
    
//     if (!existingFollowUp) {
//       return NextResponse.json(
//         { success: false, message: 'Follow-up not found' },
//         { status: 404 }
//       );
//     }
    
//     // Check if user is authorized to update this follow-up
//     if (
//       token.role !== 'Admin' && 
//       token.role !== 'Pastor' && 
//       existingFollowUp.assignedTo.toString() !== token.id
//     ) {
//       return NextResponse.json(
//         { success: false, message: 'Not authorized to update this follow-up' },
//         { status: 403 }
//       );
//     }
    
//     // Update follow-up
//     const updatedFollowUp = await FollowUp.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     )
//       .populate('memberId', 'firstName lastName email phone profileImage')
//       .populate('assignedTo', 'firstName lastName email');
    
//     return NextResponse.json({
//       success: true,
//       data: updatedFollowUp
//     });
//   } catch (error) {
//     console.error('Update follow-up error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Error updating follow-up' },
//       { status: 500 }
//     );
//   }
// }

// // DELETE follow-up
// export async function DELETE(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // Verify authentication
//     const token = await getToken({ 
//       req, 
//       secret: process.env.NEXTAUTH_SECRET 
//     });
    
//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: 'Not authenticated' },
//         { status: 401 }
//       );
//     }

//     const { id } = params;
    
//     // Connect to database
//     await connectToDatabase();
    
//     // Check if follow-up exists
//     const existingFollowUp = await FollowUp.findById(id);
    
//     if (!existingFollowUp) {
//       return NextResponse.json(
//         { success: false, message: 'Follow-up not found' },
//         { status: 404 }
//       );
//     }
    
//     // Check if user is authorized to delete this follow-up
//     if (
//       token.role !== 'Admin' && 
//       token.role !== 'Pastor' && 
//       existingFollowUp.assignedTo.toString() !== token.id
//     ) {
//       return NextResponse.json(
//         { success: false, message: 'Not authorized to delete this follow-up' },
//         { status: 403 }
//       );
//     }
    
//     // Delete follow-up
//     await FollowUp.findByIdAndDelete(id);
    
//     return NextResponse.json({
//       success: true,
//       message: 'Follow-up deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete follow-up error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Error deleting follow-up' },
//       { status: 500 }
//     );
//   }
// }




// app/api/follow-ups/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/db';
import FollowUp from '@/models/followUp';
import Attendee from '@/models/attendee'; // Added Attendee import

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

    // Connect to database
    await connectToDatabase();
    
    // Get follow-up details
    const followUp = await FollowUp.findById(params.id)
      .populate('personId', 'firstName lastName email phoneNumber whatsappNumber')
      .populate('attendeeId', 'firstName lastName email phoneNumber whatsappNumber') // Added attendeeId populate
      .populate('assignedTo', 'email')
      .populate('handedOffToCluster.clusterId', 'name')
      .populate('missedEvent.eventId', 'title startDate');
    
    if (!followUp) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to view this follow-up
    if (token.role !== 'Admin' && token.role !== 'Pastor' && 
        followUp.assignedTo._id.toString() !== token.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to view this follow-up' },
        { status: 403 }
      );
    }
    
    // Transform data for frontend
    let personName = 'Unknown';
    let personEmail: string | undefined;
    let personPhone: string | undefined;
    let personWhatsApp: string | undefined;

    if (followUp.personType === 'Member' && followUp.personId) {
        personName = `${followUp.personId.firstName} ${followUp.personId.lastName}`;
        personEmail = followUp.personId.email;
        personPhone = followUp.personId.phoneNumber;
        personWhatsApp = followUp.personId.whatsappNumber;
    } else if (followUp.personType === 'Attendee' && followUp.attendeeId) {
        personName = `${followUp.attendeeId.firstName} ${followUp.attendeeId.lastName}`;
        personEmail = followUp.attendeeId.email;
        personPhone = followUp.attendeeId.phoneNumber;
        personWhatsApp = followUp.attendeeId.whatsappNumber;
    } else if (followUp.personType === 'Unregistered Guest' && followUp.newAttendee) {
        personName = `${followUp.newAttendee.firstName} ${followUp.newAttendee.lastName}`;
        personEmail = followUp.newAttendee.email;
        personPhone = followUp.newAttendee.phoneNumber;
        personWhatsApp = followUp.newAttendee.whatsappNumber;
    }
    
    // Get event details if available
    let eventDetails;
    if (followUp.missedEvent && followUp.missedEvent.eventId) {
      eventDetails = {
        eventName: followUp.missedEvent.eventId.title,
        eventDate: followUp.missedEvent.eventId.startDate
      };
    }
    
    // Format handoff details if available
    let handedOffToCluster;
    if (followUp.handedOffToCluster) {
      handedOffToCluster = {
        clusterId: followUp.handedOffToCluster.clusterId._id,
        clusterName: followUp.handedOffToCluster.clusterId.name,
        handoffDate: followUp.handedOffToCluster.handoffDate,
        notes: followUp.handedOffToCluster.notes
      };
    }
    
    const responseData = {
      _id: followUp._id,
      personType: followUp.personType,
      personName,
      personEmail,
      personPhone,
      personWhatsApp,
      status: followUp.status,
      responseCategory: followUp.responseCategory,
      assignedTo: {
        _id: followUp.assignedTo._id,
        email: followUp.assignedTo.email
      },
      nextFollowUpDate: followUp.nextFollowUpDate,
      attempts: followUp.attempts,
      requiredAttempts: followUp.requiredAttempts,
      frequency: followUp.frequency,
      eventDetails,
      notes: followUp.notes,
      prayerRequests: followUp.prayerRequests,
      handedOffToCluster,
      createdAt: followUp.createdAt
    };
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching follow-up:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching follow-up' },
      { status: 500 }
    );
  }
}

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

    // Connect to database
    await connectToDatabase();
    
    // Get follow-up
    const followUp = await FollowUp.findById(params.id);
    
    if (!followUp) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    // Check if user is authorized to update this follow-up
    if (token.role !== 'Admin' && token.role !== 'Pastor' && 
        followUp.assignedTo.toString() !== token.id) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update this follow-up' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Update allowed fields
    if (body.status) followUp.status = body.status;
    if (body.responseCategory) followUp.responseCategory = body.responseCategory;
    if (body.nextFollowUpDate !== undefined) {
      followUp.nextFollowUpDate = body.nextFollowUpDate ? new Date(body.nextFollowUpDate) : undefined;
    }
    if (body.assignedTo) followUp.assignedTo = body.assignedTo;
    if (body.notes !== undefined) followUp.notes = body.notes;
    
    await followUp.save();
    
    return NextResponse.json({
      success: true,
      message: 'Follow-up updated successfully',
      data: followUp
    });
  } catch (error) {
    console.error('Error updating follow-up:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating follow-up' },
      { status: 500 }
    );
  }
}

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

    // Connect to database
    await connectToDatabase();
    
    // Get follow-up
    const followUp = await FollowUp.findById(params.id);
    
    if (!followUp) {
      return NextResponse.json(
        { success: false, message: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    // Only admin or pastor can delete follow-ups
    if (token.role !== 'Admin' && token.role !== 'Pastor') {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete follow-ups' },
        { status: 403 }
      );
    }
    
    await FollowUp.findByIdAndDelete(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Follow-up deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting follow-up:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting follow-up' },
      { status: 500 }
    );
  }
}
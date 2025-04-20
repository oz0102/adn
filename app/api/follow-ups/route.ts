// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import FollowUp from '@/models/followUp';
// import Member from '@/models/member';
// import connectToDatabase from '@/lib/db';

// // GET all follow-ups with pagination and filtering
// export async function GET(req: NextRequest) {
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

//     // Parse query parameters
//     const { searchParams } = new URL(req.url);
//     const page = parseInt(searchParams.get('page') || '1');
//     const limit = parseInt(searchParams.get('limit') || '10');
//     const search = searchParams.get('search') || '';
//     const status = searchParams.get('status') || '';
//     const assignedTo = searchParams.get('assignedTo') || '';
//     const type = searchParams.get('type') || '';
//     const startDate = searchParams.get('startDate') || '';
//     const endDate = searchParams.get('endDate') || '';
//     const sortBy = searchParams.get('sortBy') || 'dueDate';
//     const sortOrder = searchParams.get('sortOrder') || 'asc';

//     // Build query
//     interface FollowUpQueryType {
//       $or?: Array<{[key: string]: {$regex: string, $options: string}}>;
//       status?: string;
//       assignedTo?: string;
//       type?: string;
//       dueDate?: {$gte?: Date, $lte?: Date};
//     }
    
//     const query: FollowUpQueryType = {};
    
//     if (search) {
//       query.$or = [
//         { notes: { $regex: search, $options: 'i' } },
//         { outcome: { $regex: search, $options: 'i' } }
//       ];
//     }
    
//     if (status) {
//       query.status = status;
//     }
    
//     if (assignedTo) {
//       query.assignedTo = assignedTo;
//     }
    
//     if (type) {
//       query.type = type;
//     }
    
//     if (startDate && endDate) {
//       query.dueDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     } else if (startDate) {
//       query.dueDate = { $gte: new Date(startDate) };
//     } else if (endDate) {
//       query.dueDate = { $lte: new Date(endDate) };
//     }

//     // Connect to database
//     await connectToDatabase();
    
//     // Get total count
//     const total = await FollowUp.countDocuments(query);
    
//     // Get paginated results
//     interface SortType {
//       [key: string]: number;
//     }
//     const sort: SortType = {};
//     sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
//     const skip = (page - 1) * limit;
    
//     const followUps = await FollowUp.find(query)
//       .sort(sort)
//       .skip(skip)
//       .limit(limit)
//       .populate('memberId', 'firstName lastName email phone profileImage')
//       .populate('assignedTo', 'firstName lastName email')
//       .lean();
    
//     return NextResponse.json({
//       success: true,
//       data: {
//         followUps,
//         pagination: {
//           total,
//           page,
//           limit,
//           pages: Math.ceil(total / limit)
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Get follow-ups error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Error fetching follow-ups' },
//       { status: 500 }
//     );
//   }
// }

// // POST create new follow-up
// export async function POST(req: NextRequest) {
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

//     // Parse request body
//     const followUpData = await req.json();
    
//     // Connect to database
//     await connectToDatabase();
    
//     // Validate follow-up data
//     if (!followUpData.memberId || !followUpData.type || !followUpData.dueDate) {
//       return NextResponse.json(
//         { success: false, message: 'Member ID, type, and due date are required' },
//         { status: 400 }
//       );
//     }
    
//     // Check if member exists
//     const memberExists = await Member.findById(followUpData.memberId);
//     if (!memberExists) {
//       return NextResponse.json(
//         { success: false, message: 'Member not found' },
//         { status: 400 }
//       );
//     }
    
//     // Set default status if not provided
//     if (!followUpData.status) {
//       followUpData.status = 'Pending';
//     }
    
//     // Set assignedTo to current user if not provided
//     if (!followUpData.assignedTo) {
//       followUpData.assignedTo = token.id;
//     }
    
//     // Create new follow-up
//     const newFollowUp = new FollowUp(followUpData);
//     await newFollowUp.save();
    
//     // Populate member and assignedTo details
//     await newFollowUp.populate('memberId', 'firstName lastName email phone profileImage');
//     await newFollowUp.populate('assignedTo', 'firstName lastName email');
    
//     return NextResponse.json({
//       success: true,
//       data: newFollowUp
//     });
//   } catch (error) {
//     console.error('Create follow-up error:', error);
//     return NextResponse.json(
//       { success: false, message: 'Error creating follow-up' },
//       { status: 500 }
//     );
//   }
// }


// app/api/follow-ups/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import connectToDatabase from '@/lib/db';
import FollowUp from '@/models/followUp';
import Member from '@/models/member';
import { createFollowUp } from '@/services/followUpService';

export async function GET(req: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || '1');
    const limit = parseInt(searchParams.get("limit") || '10');
    const search = searchParams.get("search") || '';
    const status = searchParams.get("status") || '';
    const responseCategory = searchParams.get("responseCategory") || '';
    const personType = searchParams.get("personType") || '';
    const assignedTo = searchParams.get("assignedTo") || '';

    // Build query
    const query: Record<string, any> = {};
    
    if (search) {
      // Search in name, email, or phone fields
      query.$or = [
        { 'newAttendee.firstName': { $regex: search, $options: 'i' } },
        { 'newAttendee.lastName': { $regex: search, $options: 'i' } },
        { 'newAttendee.email': { $regex: search, $options: 'i' } },
        { 'newAttendee.phoneNumber': { $regex: search, $options: 'i' } }
      ];
      
      // If we have members linked to follow-ups, add them to search
      try {
        const memberIds = await Member.find({
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');
        
        if (memberIds.length > 0) {
          query.$or.push({ 
            personId: { 
              $in: memberIds.map(m => m._id) 
            } 
          });
        }
      } catch (error) {
        console.error('Member search error:', error);
      }
    }
    
    if (status) {
      query.status = status;
    }
    
    if (responseCategory) {
      query.responseCategory = responseCategory;
    }
    
    if (personType) {
      query.personType = personType;
    }
    
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Connect to database
    await connectToDatabase();
    
    // For non-admin roles, only show follow-ups assigned to them unless they're an admin or pastor
    if (token.role !== 'Admin' && token.role !== 'Pastor') {
      query.assignedTo = token.id;
    }
    
    // Get total count
    const total = await FollowUp.countDocuments(query);
    
    // Get paginated results
    const skip = (page - 1) * limit;
    
    const followUps = await FollowUp.find(query)
      .populate('personId', 'firstName lastName email phoneNumber whatsappNumber')
      .populate('assignedTo', 'email')
      .skip(skip)
      .limit(limit)
      .sort({ nextFollowUpDate: 1, createdAt: -1 });
    
    // Transform the data for the frontend
    const transformedFollowUps = followUps.map(followUp => {
      const personName = followUp.personId ? 
        `${followUp.personId.firstName} ${followUp.personId.lastName}` : 
        followUp.newAttendee ? 
          `${followUp.newAttendee.firstName} ${followUp.newAttendee.lastName}` : 
          'Unknown';
          
      const personEmail = followUp.personId?.email || followUp.newAttendee?.email;
      const personPhone = followUp.personId?.phoneNumber || followUp.newAttendee?.phoneNumber;
      const personWhatsApp = followUp.personId?.whatsappNumber || followUp.newAttendee?.whatsappNumber;
      
      return {
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
        attempts: followUp.attempts.length,
        requiredAttempts: followUp.requiredAttempts,
        createdAt: followUp.createdAt
      };
    });
    
    return NextResponse.json({
      success: true,
      data: transformedFollowUps,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching follow-ups' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    // Parse request body
    const body = await req.json();
    
    // Validate minimal required fields
    if (!body.personType) {
      return NextResponse.json(
        { success: false, message: 'Person type is required' },
        { status: 400 }
      );
    }
    
    if (body.personType === 'New Attendee' || body.personType === 'New Convert') {
      if (!body.newAttendee || !body.newAttendee.firstName || !body.newAttendee.lastName || !body.newAttendee.phoneNumber) {
        return NextResponse.json(
          { success: false, message: 'First name, last name, and phone number are required for new attendees' },
          { status: 400 }
        );
      }
    } else if (!body.personId) {
      return NextResponse.json(
        { success: false, message: 'Person ID is required for existing members' },
        { status: 400 }
      );
    }
    
    if (!body.assignedTo) {
      return NextResponse.json(
        { success: false, message: 'Assigned to is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();
    
    // Create follow-up
    const followUp = await createFollowUp({
      ...body,
      // Make sure to handle the ID for assignedTo if it's coming as an object
      assignedTo: typeof body.assignedTo === 'object' ? body.assignedTo._id : body.assignedTo
    });
    
    return NextResponse.json({
      success: true,
      message: 'Follow-up created successfully',
      data: followUp
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating follow-up:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating follow-up' },
      { status: 500 }
    );
  }
}
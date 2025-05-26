// app/api/follow-ups/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb"; // Standardized DB connection import
import FollowUp from "@/models/followUp";
import Member from "@/models/member";
import { followUpService } from "@/services/followUpService"; // Corrected import
import { auth } from "@/auth"; // Using NextAuth v5 auth()
import { Types } from "mongoose"; // Added mongoose for Types

// Define a more specific type for roles if possible, otherwise keep it general
interface AssignedRole {
  role: string;
  [key: string]: any; 
}

interface SessionUserWithRoles {
  id: string;
  assignedRoles?: AssignedRole[];
}

interface FollowUpQueryFilters {
  $or?: Record<string, any>[];
  status?: string;
  responseCategory?: string;
  personType?: string;
  assignedTo?: string | Types.ObjectId;
  [key: string]: any; // For page, limit etc.
}

interface IPersonPopulated {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
}

interface IAssignedUserPopulated {
  _id: Types.ObjectId;
  email: string;
}


export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    const currentUserId = session.user.id;
    const typedUser = session.user as SessionUserWithRoles;
    const userRoles = typedUser.assignedRoles?.map((r: AssignedRole) => r.role) || [];
    const isAdminOrPastor = userRoles.includes("Admin") || userRoles.includes("Pastor") || userRoles.includes("HQ_ADMIN") || userRoles.includes("CENTER_ADMIN");

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const responseCategory = searchParams.get("responseCategory") || "";
    const personType = searchParams.get("personType") || "";
    const assignedToFilter = searchParams.get("assignedTo") || "";

    const query: FollowUpQueryFilters = {};
    
    if (search) {
      query.$or = [
        { "newAttendee.firstName": { $regex: search, $options: "i" } },
        { "newAttendee.lastName": { $regex: search, $options: "i" } },
        { "newAttendee.email": { $regex: search, $options: "i" } },
        { "newAttendee.phoneNumber": { $regex: search, $options: "i" } }
      ];
      
      try {
        const memberIds = await Member.find({
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } }
          ]
        }).select("_id");
        
        if (memberIds.length > 0) {
          query.$or.push({ 
            personId: { 
              $in: memberIds.map(m => m._id) 
            } 
          });
        }
      } catch (error) {
        console.error("Member search error:", error);
      }
    }
    
    if (status) query.status = status;
    if (responseCategory) query.responseCategory = responseCategory;
    if (personType) query.personType = personType;
    if (assignedToFilter) query.assignedTo = assignedToFilter;

    await connectToDB();
    
    if (!isAdminOrPastor) {
      query.assignedTo = currentUserId;
    }
    
    const total = await FollowUp.countDocuments(query);
    const skip = (page - 1) * limit;
    
    const followUps = await FollowUp.find(query)
      .populate("personId", "firstName lastName email phoneNumber whatsappNumber")
      .populate("assignedTo", "email") // Assuming User model has email
      .skip(skip)
      .limit(limit)
      .sort({ nextFollowUpDate: 1, createdAt: -1 });
    
    const transformedFollowUps = followUps.map(followUp => {
      const populatedPerson = followUp.personId as IPersonPopulated | null;
      const populatedAssignedTo = followUp.assignedTo as IAssignedUserPopulated | null;

      const personName = populatedPerson ? 
        `${populatedPerson.firstName} ${populatedPerson.lastName}` : 
        followUp.newAttendee ? 
          `${followUp.newAttendee.firstName} ${followUp.newAttendee.lastName}` : 
          "Unknown";
          
      const personEmail = populatedPerson?.email || followUp.newAttendee?.email;
      const personPhone = populatedPerson?.phoneNumber || followUp.newAttendee?.phoneNumber;
      const personWhatsApp = populatedPerson?.whatsappNumber || followUp.newAttendee?.whatsappNumber;
      
      return {
        _id: followUp._id.toString(),
        personType: followUp.personType,
        personName,
        personEmail,
        personPhone,
        personWhatsApp,
        status: followUp.status,
        responseCategory: followUp.responseCategory,
        assignedTo: populatedAssignedTo ? {
          _id: populatedAssignedTo._id.toString(),
          email: populatedAssignedTo.email
        } : null,
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error fetching follow-ups";
    console.error("Error fetching follow-ups:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }
    const currentUserId = session.user.id;

    const body = await req.json();
    
    if (!body.personType) {
      return NextResponse.json(
        { success: false, message: "Person type is required" },
        { status: 400 }
      );
    }
    
    if ((body.personType === "New Attendee" || body.personType === "New Convert") && 
        (!body.newAttendee || !body.newAttendee.firstName || !body.newAttendee.lastName || !body.newAttendee.phoneNumber)) {
      return NextResponse.json(
        { success: false, message: "First name, last name, and phone number are required for new attendees/converts" },
        { status: 400 }
      );
    } else if (body.personType === "Member" && !body.personId) {
      return NextResponse.json(
        { success: false, message: "Person ID is required for existing members" },
        { status: 400 }
      );
    }
    
    if (!body.assignedTo) {
      return NextResponse.json(
        { success: false, message: "Assigned to is required" },
        { status: 400 }
      );
    }

    await connectToDB();
    
    const followUpData = {
        ...body,
        assignedTo: typeof body.assignedTo === "object" ? body.assignedTo._id : body.assignedTo,
        createdBy: currentUserId // Add createdBy field
    };

    const followUp = await followUpService.createFollowUp(followUpData);
    
    return NextResponse.json({
      success: true,
      message: "Follow-up created successfully",
      data: followUp
    }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error creating follow-up";
    console.error("Error creating follow-up:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

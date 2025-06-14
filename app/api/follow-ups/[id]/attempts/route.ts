// app/api/follow-ups/[id]/attempts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/mongodb"; // Assuming this is the correct path for db connection
import FollowUp from "@/models/followUp";
import { followUpService } from "@/services/followUpService"; // Corrected import
import { auth } from "@/auth"; // Using NextAuth v5 auth()

// Define a more specific type for roles if possible, otherwise keep it general
interface AssignedRole {
  role: string;
  scopeId?: string;
  parentScopeId?: string;
}

interface SessionUserWithRoles {
  id: string;
  assignedRoles?: AssignedRole[];
  // Add other user properties if needed
}

const followUpAttemptSchema = z.object({
  contactMethod: z.enum(["Email", "SMS", "WhatsApp", "Call", "In Person"]),
  response: z.enum(["Positive", "Negative", "No Response"]),
  notes: z.string(),
  prayerRequests: z.array(z.string()).optional()
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const currentUserId = session.user.id;
    
    const body = await req.json();
    
    const validation = followUpAttemptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid input data", 
          errors: validation.error.errors 
        },
        { status: 400 }
      );
    }
    
    await connectToDB();
    
    const followUp = await FollowUp.findById(params.id);
    
    if (!followUp) {
      return NextResponse.json(
        { success: false, message: "Follow-up not found" },
        { status: 404 }
      );
    }
    
    // Authorization check: Ensure the user is assigned to this follow-up or has admin/pastor role
    // This logic might need to be more sophisticated based on your permission system (e.g., using checkPermission utility)
    const typedUser = session.user as SessionUserWithRoles;
    const userRoles = typedUser.assignedRoles?.map((r: AssignedRole) => r.role) || [];
    const isAdminOrPastor = userRoles.includes("Admin") || userRoles.includes("Pastor") || userRoles.includes("GLOBAL_ADMIN") || userRoles.includes("CENTER_ADMIN");

    if (!isAdminOrPastor && followUp.assignedTo?.toString() !== currentUserId) {
      return NextResponse.json(
        { success: false, message: "Not authorized to update this follow-up" },
        { status: 403 }
      );
    }
    
    const updatedFollowUp = await followUpService.addFollowUpAttempt(
      params.id, 
      body,
      currentUserId
    );
    
    return NextResponse.json({
      success: true,
      message: "Follow-up attempt added successfully",
      data: updatedFollowUp
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Add follow-up attempt error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

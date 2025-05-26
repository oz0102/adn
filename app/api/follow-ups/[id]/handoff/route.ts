// app/api/follow-ups/[id]/handoff/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/mongodb"; // Standardized DB connection import
import FollowUp from "@/models/followUp";
import { followUpService } from "@/services/followUpService"; // Corrected import
import { auth } from "@/auth"; // Using NextAuth v5 auth()

// Define a more specific type for roles if possible, otherwise keep it general
interface AssignedRole {
  role: string;
  // Add other properties of role object if known, e.g., scopeId: string
  [key: string]: any; 
}

interface SessionUserWithRoles {
  id: string;
  assignedRoles?: AssignedRole[];
  // Add other user properties if needed
}

const handoffSchema = z.object({
  clusterId: z.string(),
  notes: z.string().optional()
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
    
    const validation = handoffSchema.safeParse(body);
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
    
    // Authorization check: Similar to the attempts route, adapt as needed
    const typedUser = session.user as SessionUserWithRoles;
    const userRoles = typedUser.assignedRoles?.map((r: AssignedRole) => r.role) || [];
    const isAdminOrPastor = userRoles.includes("Admin") || userRoles.includes("Pastor") || userRoles.includes("HQ_ADMIN") || userRoles.includes("CENTER_ADMIN");

    if (!isAdminOrPastor && followUp.assignedTo?.toString() !== currentUserId) {
      return NextResponse.json(
        { success: false, message: "Not authorized to handoff this follow-up" },
        { status: 403 }
      );
    }
    
    const updatedFollowUp = await followUpService.handoffToCluster(
      params.id,
      body.clusterId,
      body.notes || "",
      currentUserId
    );
    
    return NextResponse.json({
      success: true,
      message: "Follow-up handed off successfully",
      data: updatedFollowUp
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Handoff follow-up error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

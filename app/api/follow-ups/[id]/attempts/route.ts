// app/api/follow-ups/[id]/attempts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDB } from "@/lib/mongodb"; // Assuming this is the correct path for db connection
import FollowUp from "@/models/followUp";
import { followUpService } from "@/services/followUpService"; // Corrected import
import { auth } from "@/auth"; // Using NextAuth v5 auth()
import mongoose from "mongoose";

const followUpAttemptSchema = z.object({
  contactMethod: z.enum(["Email", "SMS", "WhatsApp", "Call", "In Person"]),
  response: z.enum(["Positive", "Negative", "No Response"]),
  notes: z.string(),
  prayerRequests: z.array(z.string()).optional()
});

interface CustomSessionUser {
    id?: string | null;
    // Add other properties you expect on session.user
}

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
    const userRoles = (session.user as any).assignedRoles?.map((r: any) => r.role) || [];
    const isAdminOrPastor = userRoles.includes("Admin") || userRoles.includes("Pastor") || userRoles.includes("HQ_ADMIN") || userRoles.includes("CENTER_ADMIN");

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
  } catch (error: any) {
    console.error("Add follow-up attempt error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

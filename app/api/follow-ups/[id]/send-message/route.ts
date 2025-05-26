// app/api/follow-ups/[id]/send-message/route.ts
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

const messageSchema = z.object({
  message: z.string().optional(),
  channels: z.array(z.enum(["email", "sms", "whatsapp"])),
  useAiGenerated: z.boolean().optional()
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
    
    const validation = messageSchema.safeParse(body);
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
    
    // Authorization check: Adapt as needed
    const typedUser = session.user as SessionUserWithRoles;
    const userRoles = typedUser.assignedRoles?.map((r: AssignedRole) => r.role) || [];
    const isAdminOrPastor = userRoles.includes("Admin") || userRoles.includes("Pastor") || userRoles.includes("HQ_ADMIN") || userRoles.includes("CENTER_ADMIN");

    if (!isAdminOrPastor && followUp.assignedTo?.toString() !== currentUserId) {
      return NextResponse.json(
        { success: false, message: "Not authorized to send messages for this follow-up" },
        { status: 403 }
      );
    }
    
    const result = await followUpService.sendFollowUpMessage(
      params.id,
      body.message || "",
      body.channels,
      body.useAiGenerated
    );
    
    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: result
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Send follow-up message error:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

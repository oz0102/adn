import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// Correct the authOptions import path if it's directly from auth.ts or auth-config.ts
// Assuming authOptions is part of the handlers export from auth.ts or defined in auth-config
import { authOptions } from "@/auth"; // This might need to be authConfig if authOptions is not directly exported
import { createCenterService, getAllCentersService } from "@/services/centerService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions"; // Corrected import for permission checking
import mongoose from "mongoose";

/**
 * Handles POST requests to create a new Center.
 * Requires HQ_ADMIN privileges.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions); // Use authOptions if that's how your NextAuth is configured
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");

    if (!hasHQAdminPermission) {
      return NextResponse.json({ message: "Forbidden: Requires HQ Admin role" }, { status: 403 });
    }

    const body = await request.json();
    await connectToDB();
    const newCenter = await createCenterService(body);
    return NextResponse.json(newCenter, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create center:", error);
    return NextResponse.json({ message: "Failed to create center", error: error.message }, { status: 500 });
  }
}

/**
 * Handles GET requests to retrieve all Centers.
 * HQ_ADMIN gets all centers.
 * Other roles might get a filtered list based on their assignments (future enhancement).
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    let centers;

    await connectToDB();

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");

    if (hasHQAdminPermission) {
      centers = await getAllCentersService();
    } else {
      // Non-HQ_ADMINs currently see no centers via this global endpoint.
      // Future: Implement logic to return centers they are admin of, e.g.,
      // const userWithRoles = await User.findById(userId).select("assignedRoles").lean();
      // const centerAdminRoles = userWithRoles.assignedRoles.filter(r => r.role === "CENTER_ADMIN" && r.centerId);
      // const accessibleCenterIds = centerAdminRoles.map(r => r.centerId);
      // centers = await Center.find({ _id: { $in: accessibleCenterIds } });
      return NextResponse.json({ message: "Forbidden: Access restricted or no centers assigned" }, { status: 403 }); 
    }
    
    return NextResponse.json(centers, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve centers:", error);
    return NextResponse.json({ message: "Failed to retrieve centers", error: error.message }, { status: 500 });
  }
}


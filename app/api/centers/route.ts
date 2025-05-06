import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Corrected: Use auth() for server-side session
import { centerService } from "@/services/centerService"; // Assuming centerService exports an object
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import { checkPermission } from "@/lib/permissions"; 
import mongoose from "mongoose";

/**
 * Handles POST requests to create a new Center.
 * Requires HQ_ADMIN privileges.
 */
export async function POST(request: Request) {
  try {
    const session = await auth(); // Corrected: Use auth() to get session
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
    const newCenter = await centerService.createCenter(body); // Corrected: Use service object
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
    const session = await auth(); // Corrected: Use auth() to get session
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    let centers;

    await connectToDB();

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");

    if (hasHQAdminPermission) {
      centers = await centerService.getAllCenters(); // Corrected: Use service object
    } else {
      return NextResponse.json({ message: "Forbidden: Access restricted or no centers assigned" }, { status: 403 }); 
    }
    
    return NextResponse.json(centers, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve centers:", error);
    return NextResponse.json({ message: "Failed to retrieve centers", error: error.message }, { status: 500 });
  }
}


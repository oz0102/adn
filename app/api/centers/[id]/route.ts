import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Corrected: Use auth() for server-side session
import { centerService } from "@/services/centerService"; // Assuming centerService exports an object
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";

interface Params {
  params: { id: string };
}

/**
 * Handles GET requests to retrieve a specific Center by ID.
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await auth(); // Corrected: Use auth() to get session
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const centerId = params.id;

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdminForThisCenter = await checkPermission(userId, "CENTER_ADMIN", { centerId });

    if (!hasHQAdminPermission && !isCenterAdminForThisCenter) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    await connectToDB();
    const center = await centerService.getCenterById(centerId); // Corrected: Use service object

    if (!center) {
      return NextResponse.json({ message: "Center not found" }, { status: 404 });
    }
    return NextResponse.json(center, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to retrieve center ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve center", error: error.message }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update a specific Center by ID.
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth(); // Corrected: Use auth() to get session
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const centerId = params.id;

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdminForThisCenter = await checkPermission(userId, "CENTER_ADMIN", { centerId });

    if (!hasHQAdminPermission && !isCenterAdminForThisCenter) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    await connectToDB();
    const updatedCenter = await centerService.updateCenter(centerId, body); // Corrected: Use service object

    if (!updatedCenter) {
      return NextResponse.json({ message: "Center not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedCenter, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to update center ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to update center", error: error.message }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a specific Center by ID.
 * Requires HQ_ADMIN privileges.
 */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth(); // Corrected: Use auth() to get session
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const centerId = params.id;

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");

    if (!hasHQAdminPermission) {
      return NextResponse.json({ message: "Forbidden: Requires HQ Admin role" }, { status: 403 });
    }

    await connectToDB();
    const deletedCenter = await centerService.deleteCenter(centerId); // Corrected: Use service object

    if (!deletedCenter) {
      return NextResponse.json({ message: "Center not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Center deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete center ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete center", error: error.message }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { centerService } from "@/services/centerService";
import { connectToDB } from "@/lib/mongodb";
// import { checkPermission } from "@/lib/permissions"; // Removing this as per subtask
import mongoose from "mongoose";

interface Params {
  params: { id: string };
}

/**
 * Handles GET requests to retrieve a specific Center by ID.
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id || !session.user.assignedRoles) {
      console.log(`GET /api/centers/${params.id} - Unauthorized: No session or assignedRoles`);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { assignedRoles } = session.user;
    const requestedCenterId = params.id;
    console.log(`GET /api/centers/${requestedCenterId} - User assignedRoles:`, JSON.stringify(assignedRoles, null, 2));

    const isHqAdmin = assignedRoles.some(role => role.role === 'HQ_ADMIN');
    const isCenterAdminForThisCenter = assignedRoles.some(role => role.role === 'CENTER_ADMIN' && role.centerId === requestedCenterId);

    console.log(`GET /api/centers/${requestedCenterId} - isHqAdmin: ${isHqAdmin}, isCenterAdminForThisCenter: ${isCenterAdminForThisCenter}`);

    if (!isHqAdmin && !isCenterAdminForThisCenter) {
      console.log(`GET /api/centers/${requestedCenterId} - Forbidden: User is not HQ_ADMIN and not CENTER_ADMIN for this center.`);
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    console.log(`GET /api/centers/${requestedCenterId} - Access GRANTED.`);
    await connectToDB();
    const center = await centerService.getCenterById(requestedCenterId);

    if (!center) {
      return NextResponse.json({ message: "Center not found" }, { status: 404 });
    }
    return NextResponse.json(center, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to retrieve center ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve center", error: errorMessage }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update a specific Center by ID.
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id || !session.user.assignedRoles) {
      console.log(`PUT /api/centers/${params.id} - Unauthorized: No session or assignedRoles`);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { assignedRoles } = session.user;
    const requestedCenterId = params.id;
    console.log(`PUT /api/centers/${requestedCenterId} - User assignedRoles:`, JSON.stringify(assignedRoles, null, 2));

    const isHqAdmin = assignedRoles.some(role => role.role === 'HQ_ADMIN');
    const isCenterAdminForThisCenter = assignedRoles.some(role => role.role === 'CENTER_ADMIN' && role.centerId === requestedCenterId);

    console.log(`PUT /api/centers/${requestedCenterId} - isHqAdmin: ${isHqAdmin}, isCenterAdminForThisCenter: ${isCenterAdminForThisCenter}`);

    if (!isHqAdmin && !isCenterAdminForThisCenter) {
      console.log(`PUT /api/centers/${requestedCenterId} - Forbidden: User is not HQ_ADMIN and not CENTER_ADMIN for this center.`);
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    console.log(`PUT /api/centers/${requestedCenterId} - Access GRANTED.`);
    const body = await request.json();
    await connectToDB();
    const updatedCenter = await centerService.updateCenter(requestedCenterId, body);

    if (!updatedCenter) {
      return NextResponse.json({ message: "Center not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedCenter, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to update center ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to update center", error: errorMessage }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a specific Center by ID.
 * Requires HQ_ADMIN privileges.
 */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth();
    // For DELETE, we will still use assignedRoles but simplify to check for HQ_ADMIN directly
    // as per common practice for destructive operations, and to keep this part of the diff smaller.
    // The subtask focuses on GET/PUT for the detailed assignedRoles check.
    if (!session || !session.user || !session.user.id || !session.user.assignedRoles) {
      console.log(`DELETE /api/centers/${params.id} - Unauthorized: No session or assignedRoles`);
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { assignedRoles } = session.user;
    const requestedCenterId = params.id;
    console.log(`DELETE /api/centers/${requestedCenterId} - User assignedRoles:`, JSON.stringify(assignedRoles, null, 2));

    const isHqAdmin = assignedRoles.some(role => role.role === 'HQ_ADMIN');

    if (!isHqAdmin) {
      console.log(`DELETE /api/centers/${requestedCenterId} - Forbidden: User is not HQ_ADMIN.`);
      return NextResponse.json({ message: "Forbidden: Requires HQ Admin role" }, { status: 403 });
    }

    console.log(`DELETE /api/centers/${requestedCenterId} - HQ_ADMIN access GRANTED for deletion.`);
    await connectToDB();
    const deletedCenter = await centerService.deleteCenter(requestedCenterId);

    if (!deletedCenter) {
      return NextResponse.json({ message: "Center not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Center deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to delete center ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete center", error: errorMessage }, { status: 500 });
  }
}

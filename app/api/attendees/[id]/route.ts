import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Attendee from "@/models/attendee";
import { auth, SessionWithUser } from "@/auth"; // Assuming SessionWithUser is defined in @/auth
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";

interface Params {
  params: { id: string };
}

// Helper to assert session user
function assertSessionUser(session: SessionWithUser | null): asserts session is SessionWithUser & { user: { id: string } } {
  if (!session?.user?.id) {
    throw new Error("User not authenticated or session is invalid.");
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await auth() as SessionWithUser | null;
    assertSessionUser(session);
    const currentUserId = new mongoose.Types.ObjectId(session.user.id);

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid attendee ID format." }, { status: 400 });
    }

    await connectToDB();
    const attendee = await Attendee.findById(params.id).populate('centerId', 'name').lean();

    if (!attendee) {
      return NextResponse.json({ message: "Attendee not found." }, { status: 404 });
    }

    // Permission Check
    const isGlobalAdmin = await checkPermission(currentUserId, "GLOBAL_ADMIN");
    let canView = isGlobalAdmin;

    if (!canView && attendee.centerId) {
      canView = await checkPermission(currentUserId, "CENTER_ADMIN", { centerId: attendee.centerId._id.toString() });
    }

    // Add more specific role checks if needed, e.g., CLUSTER_LEADER if attendee is linked to a cluster they lead

    if (!canView) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to view this attendee." }, { status: 403 });
    }

    return NextResponse.json({ attendee });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching attendee:", error);
    if (errorMessage.includes("User not authenticated")) {
        return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json({ message: "Failed to fetch attendee", error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await auth() as SessionWithUser | null;
    assertSessionUser(session);
    const currentUserId = new mongoose.Types.ObjectId(session.user.id);

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid attendee ID format." }, { status: 400 });
    }

    const body = await request.json();
    // Basic validation for updatable fields - extend as needed
    if (body.email && !/\S+@\S+\.\S+/.test(body.email)) {
        return NextResponse.json({ message: "Invalid email format." }, { status: 400 });
    }
    if (body.level && !['First-Timer', 'Occasional Attendee', 'Regular Attendee'].includes(body.level)) {
        return NextResponse.json({ message: "Invalid level provided." }, { status: 400 });
    }
    if (body.centerId && !mongoose.Types.ObjectId.isValid(body.centerId)) {
        return NextResponse.json({ message: "Invalid centerId format." }, { status: 400 });
    }


    await connectToDB();
    const attendeeToUpdate = await Attendee.findById(params.id);

    if (!attendeeToUpdate) {
      return NextResponse.json({ message: "Attendee not found." }, { status: 404 });
    }

    // Permission Check
    const isGlobalAdmin = await checkPermission(currentUserId, "GLOBAL_ADMIN");
    let canUpdate = isGlobalAdmin;

    if (!canUpdate && attendeeToUpdate.centerId) {
      canUpdate = await checkPermission(currentUserId, "CENTER_ADMIN", { centerId: attendeeToUpdate.centerId.toString() });
    }

    if (!canUpdate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to update this attendee." }, { status: 403 });
    }

    // Prevent changing certain fields if not Global Admin (e.g., centerId if not specifically allowed)
    if (!isGlobalAdmin) {
        delete body.centerId; // Example: Center Admins cannot change the center of an attendee via general update
        delete body.createdBy; // Cannot change createdBy
    }

    // Update fields
    Object.assign(attendeeToUpdate, body);
    attendeeToUpdate.updatedBy = currentUserId;

    const updatedAttendee = await attendeeToUpdate.save();

    return NextResponse.json({ message: "Attendee updated successfully", attendee: updatedAttendee });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error updating attendee:", error);
    if (errorMessage.includes("User not authenticated")) {
        return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json({ message: "Failed to update attendee", error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await auth() as SessionWithUser | null;
    assertSessionUser(session);
    const currentUserId = new mongoose.Types.ObjectId(session.user.id);

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ message: "Invalid attendee ID format." }, { status: 400 });
    }

    await connectToDB();
    const attendeeToDelete = await Attendee.findById(params.id);

    if (!attendeeToDelete) {
      return NextResponse.json({ message: "Attendee not found." }, { status: 404 });
    }

    // Permission Check (Stricter for DELETE)
    const isGlobalAdmin = await checkPermission(currentUserId, "GLOBAL_ADMIN");
    let canDelete = isGlobalAdmin;

    if (!canDelete && attendeeToDelete.centerId) {
      // Allow Center Admin of the *attendee's center* to delete.
      // Or, if the original creator (another Center Admin for example) should be able to delete.
      // For now, only Global Admin or Center Admin of that specific center.
      canDelete = await checkPermission(currentUserId, "CENTER_ADMIN", { centerId: attendeeToDelete.centerId.toString() });
    }

    if (!canDelete) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to delete this attendee." }, { status: 403 });
    }

    await Attendee.findByIdAndDelete(params.id);

    return NextResponse.json({ message: "Attendee deleted successfully." });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error deleting attendee:", error);
    if (errorMessage.includes("User not authenticated")) {
        return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json({ message: "Failed to delete attendee", error: errorMessage }, { status: 500 });
  }
}

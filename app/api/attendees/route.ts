import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import Attendee, { IAttendee } from "@/models/attendee";
import { auth, SessionWithUser } from "@/auth"; // Assuming SessionWithUser is defined in @/auth
import { checkPermission } from "@/lib/permissions";
import mongoose, { FilterQuery } from "mongoose";

// Helper to assert session user
function assertSessionUser(session: SessionWithUser | null): asserts session is SessionWithUser & { user: { id: string } } {
  if (!session?.user?.id) {
    throw new Error("User not authenticated or session is invalid.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth() as SessionWithUser | null;
    assertSessionUser(session);
    const currentUserId = new mongoose.Types.ObjectId(session.user.id);

    const body = await request.json();
    const { firstName, lastName, phoneNumber, centerId, email, level, ...otherData } = body;

    // Validation
    if (!firstName || !lastName || !phoneNumber || !centerId) {
      return NextResponse.json({ message: "First name, last name, phone number, and centerId are required." }, { status: 400 });
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ message: "Invalid email format." }, { status: 400 });
    }
    if (level && !['First-Timer', 'Occasional Attendee', 'Regular Attendee'].includes(level)) {
        return NextResponse.json({ message: "Invalid level provided." }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(centerId)) {
        return NextResponse.json({ message: "Invalid centerId format." }, { status: 400 });
    }


    await connectToDB();

    // Permission Check
    const canCreateInCenter = await checkPermission(currentUserId, "CENTER_ADMIN", { centerId });
    const isGlobalAdmin = await checkPermission(currentUserId, "GLOBAL_ADMIN");

    if (!isGlobalAdmin && !canCreateInCenter) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to create attendee for this center." }, { status: 403 });
    }

    const newAttendee = new Attendee({
      firstName,
      lastName,
      phoneNumber,
      centerId,
      email: email || undefined, // Ensure optional fields are undefined if not provided
      level: level || 'First-Timer',
      ...otherData,
      createdBy: currentUserId,
      updatedBy: currentUserId, // Set updatedBy on creation as well
    });

    await newAttendee.save();

    return NextResponse.json({ message: "Attendee created successfully", attendee: newAttendee }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating attendee:", error);
    if (errorMessage.includes("User not authenticated")) {
        return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json({ message: "Failed to create attendee", error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth() as SessionWithUser | null;
    assertSessionUser(session);
    const currentUserId = new mongoose.Types.ObjectId(session.user.id);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const centerIdFilter = searchParams.get("centerId");
    const levelFilter = searchParams.get("level");

    await connectToDB();

    const query: FilterQuery<IAttendee> = {};

    // Permission checks
    const isGlobalAdmin = await checkPermission(currentUserId, "GLOBAL_ADMIN");

    if (isGlobalAdmin) {
      if (centerIdFilter) {
        if (!mongoose.Types.ObjectId.isValid(centerIdFilter)) return NextResponse.json({ message: "Invalid centerId format in filter." }, { status: 400 });
        query.centerId = new mongoose.Types.ObjectId(centerIdFilter);
      }
      // Global admin can filter by any center or see all
    } else {
      // Check if user is CENTER_ADMIN for any center
      const user = await mongoose.model('User').findById(currentUserId).select("assignedRoles").lean();
      const centerAdminRoles = user?.assignedRoles?.filter((r: any) => r.role === "CENTER_ADMIN" && r.centerId) || [];

      if (centerAdminRoles.length === 0) {
        return NextResponse.json({ message: "Forbidden: No center assignments found for this user." }, { status: 403 });
      }

      const accessibleCenterIds = centerAdminRoles.map((r: any) => r.centerId);

      if (centerIdFilter) {
        if (!mongoose.Types.ObjectId.isValid(centerIdFilter)) return NextResponse.json({ message: "Invalid centerId format in filter." }, { status: 400 });
        if (!accessibleCenterIds.some(id => id.equals(centerIdFilter))) {
          return NextResponse.json({ message: "Forbidden: You do not have access to this center's attendees." }, { status: 403 });
        }
        query.centerId = new mongoose.Types.ObjectId(centerIdFilter);
      } else {
        query.centerId = { $in: accessibleCenterIds };
      }
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
      ];
    }

    if (levelFilter) {
      if (!['First-Timer', 'Occasional Attendee', 'Regular Attendee'].includes(levelFilter)) {
        return NextResponse.json({ message: "Invalid level filter." }, { status: 400 });
      }
      query.level = levelFilter;
    }

    const skip = (page - 1) * limit;
    const attendees = await Attendee.find(query)
      .populate('centerId', 'name') // Populate center name
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Attendee.countDocuments(query);
    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      attendees,
      pagination: { page, limit, total, pages },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching attendees:", error);
     if (errorMessage.includes("User not authenticated")) {
        return NextResponse.json({ message: errorMessage }, { status: 401 });
    }
    return NextResponse.json({ message: "Failed to fetch attendees", error: errorMessage }, { status: 500 });
  }
}

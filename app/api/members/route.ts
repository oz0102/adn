import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
// import dbConnect from "@/lib/dbConnect";
import { connectToDB } from "@/lib/mongodb";
import Member from "@/models/member";
import { FilterQuery } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.assignedRoles) {
      console.log("Unauthorized access attempt to GET /api/members: No session or assignedRoles");
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { assignedRoles } = session.user;
    console.log("GET /api/members - User assignedRoles:", JSON.stringify(assignedRoles, null, 2));

    await connectToDB();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    let centerIdQueryParam = searchParams.get("centerId") || "";
    const clusterId = searchParams.get("clusterId") || "";
    const smallGroupId = searchParams.get("smallGroupId") || "";
    const gender = searchParams.get("gender") || "";

    // Build query
    const query: FilterQuery<typeof Member> = {};

    const isGlobalAdmin = assignedRoles.some(role => role.role === 'GLOBAL_ADMIN');
    const centerAdminRoles = assignedRoles.filter(role => role.role === 'CENTER_ADMIN' && role.centerId);

    console.log("GET /api/members - isGlobalAdmin:", isGlobalAdmin, "centerAdminRoles count:", centerAdminRoles.length);

    if (isGlobalAdmin) {
      console.log("GET /api/members - GLOBAL_ADMIN access. Allowing query with centerId if provided.");
      if (centerIdQueryParam) {
        query.centerId = centerIdQueryParam;
      }
      // GLOBAL_ADMIN can filter by any other param as well
    } else if (centerAdminRoles.length > 0) {
      const userCenterIds = centerAdminRoles.map(r => r.centerId);
      console.log("GET /api/members - CENTER_ADMIN access. User center IDs:", userCenterIds);

      if (centerIdQueryParam) {
        if (!userCenterIds.includes(centerIdQueryParam)) {
          console.log(`GET /api/members - CENTER_ADMIN forbidden access to centerId: ${centerIdQueryParam}. User is admin for: ${userCenterIds.join(', ')}`);
          return NextResponse.json({ success: false, message: "Forbidden: You do not have access to this center." }, { status: 403 });
        }
        query.centerId = centerIdQueryParam; // User is asking for a specific center they have access to
      } else {
        // If no specific centerId is requested, filter by all centers they are admin of
        query.centerId = { $in: userCenterIds };
      }
      console.log("GET /api/members - CENTER_ADMIN query for members in centers:", query.centerId);
    } else {
      console.log("GET /api/members - User is not GLOBAL_ADMIN or CENTER_ADMIN. Forbidden.");
      return NextResponse.json({ success: false, message: "Forbidden: Insufficient permissions." }, { status: 403 });
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    // These filters are applied on top of the role-based centerId filter
    if (clusterId) query.clusterId = clusterId;
    if (smallGroupId) query.smallGroupId = smallGroupId;
    if (gender) query.gender = gender;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [members, total] = await Promise.all([
      Member.find(query)
        .skip(skip)
        .limit(limit)
        .populate("centerId", "name")
        .populate("clusterId", "name")
        .populate("smallGroupId", "name")
        .sort({ createdAt: -1 }),
      Member.countDocuments(query),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        members,
      },
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch members";
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const body = await request.json();

    // Generate a unique memberId
    const memberCount = await Member.countDocuments();
    const memberId = `M${(memberCount + 1).toString().padStart(4, "0")}`;

    // Create new member
    const member = await Member.create({
      ...body,
      memberId,
    });

    return NextResponse.json({
      success: true,
      message: "Member created successfully",
      member,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create member";
    console.error("Error creating member:", error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

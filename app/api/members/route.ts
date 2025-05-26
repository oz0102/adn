import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
// import dbConnect from "@/lib/dbConnect";
import { connectToDB } from "@/lib/mongodb";
import Member from "@/models/member";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const centerId = searchParams.get("centerId") || "";
    const clusterId = searchParams.get("clusterId") || "";
    const smallGroupId = searchParams.get("smallGroupId") || "";
    const gender = searchParams.get("gender") || "";

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (centerId) query.centerId = centerId;
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
  } catch (error: any) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch members" },
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
  } catch (error: any) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create member" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/mongodb";
import Member from "@/models/member";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const clusterId = searchParams.get("clusterId");
    const smallGroupId = searchParams.get("smallGroupId");
    const gender = searchParams.get("gender");
    
    const skip = (page - 1) * limit;
    
    await connectToDB();
    
    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { memberId: { $regex: search, $options: "i" } },
      ];
    }
    
    if (clusterId) {
      query.clusterId = clusterId;
    }
    
    if (smallGroupId) {
      query.smallGroupId = smallGroupId;
    }
    
    if (gender) {
      query.gender = gender;
    }
    
    // Get members with pagination
    const members = await Member.find(query)
      .populate('clusterId', 'name')
      .populate('smallGroupId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Member.countDocuments(query);
    
    // Calculate total pages
    const pages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      data: {
        members
      },
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
    
  } catch (error: any) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch members", 
      message: error.message 
    }, { status: 500 });
  }
}

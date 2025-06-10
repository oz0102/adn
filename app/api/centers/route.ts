import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/mongodb";
import Center from "@/models/center";
import { FilterQuery } from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has GLOBAL_ADMIN permission
    const permissionResponse = await fetch(`${request.nextUrl.origin}/api/auth/check-permission?role=GLOBAL_ADMIN`, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    
    const permData = await permissionResponse.json();

    if (!permissionResponse.ok || !permData.hasPermission) {
      return NextResponse.json({ error: permData.error || "Permission denied" }, { status: 403 });
    }

    // Get center data from request
    const data = await request.json();
    
    await connectToDB();
    
    // Generate a unique centerId
    const centerCount = await Center.countDocuments();
    const centerId = `C${(centerCount + 1).toString().padStart(3, '0')}`;
    
    // Create new center
    const center = new Center({
      centerId,
      name: data.name,
      location: data.location,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      description: data.description,
      centerAdmins: [session.user.id], // Add current user as admin
    });
    
    await center.save();
    
    return NextResponse.json({ 
      message: "Center created successfully", 
      center: {
        _id: center._id,
        centerId: center.centerId,
        name: center.name,
        location: center.location,
      }
    }, { status: 201 });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating center:", error);
    return NextResponse.json({ 
      error: "Failed to create center", 
      message: errorMessage 
    }, { status: 500 });
  }
}

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
    
    const skip = (page - 1) * limit;
    
    await connectToDB();
    
    // Build query
    const query: FilterQuery<typeof Center> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    
    // Get centers with pagination
    const centers = await Center.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Center.countDocuments(query);
    
    // Calculate total pages
    const pages = Math.ceil(total / limit);
    
    return NextResponse.json({
      centers,
      paginationInfo: {
        page,
        limit,
        total,
        pages,
      },
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching centers:", error);
    return NextResponse.json({ 
      error: "Failed to fetch centers", 
      message: errorMessage 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDB } from "@/lib/mongodb";
import Cluster from "@/models/cluster";
import { FilterQuery } from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get cluster data from request
    const data = await request.json();
    
    // Check if user has permission (GLOBAL_ADMIN can create clusters anywhere)
    // For CENTER_ADMIN, they need permission for the specific center
    const permissionUrl = data.centerId 
      ? `${request.nextUrl.origin}/api/auth/check-permission?roles=GLOBAL_ADMIN,CENTER_ADMIN&centerId=${data.centerId}`
      : `${request.nextUrl.origin}/api/auth/check-permission?role=GLOBAL_ADMIN`; // Only GLOBAL_ADMIN can create Global clusters
    
    const permissionResponse = await fetch(permissionUrl, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    });
    
    if (!permissionResponse.ok) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const permData = await permissionResponse.json();
    if (!permData.hasPermission) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    await connectToDB();
    
    // Generate a unique clusterId
    const clusterCount = await Cluster.countDocuments();
    const clusterId = `CL${(clusterCount + 1).toString().padStart(3, '0')}`;
    
    // Create new cluster with multiple meeting schedules
    // If assignToHQ is true, centerId will be null/undefined
    const cluster = new Cluster({
      clusterId,
      name: data.name,
      location: data.location,
      address: data.address,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      description: data.description,
      centerId: data.centerId || null, // Allow null for HQ clusters
      leaderId: data.leaderId || null, // Allow null for optional leader
      meetingSchedules: data.meetingSchedules, // Store array of meeting schedules
    });
    
    await cluster.save();
    
    return NextResponse.json({ 
      message: "Cluster created successfully", 
      cluster: {
        _id: cluster._id,
        clusterId: cluster.clusterId,
        name: cluster.name,
        centerId: cluster.centerId,
      }
    }, { status: 201 });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error creating cluster:", error);
    return NextResponse.json({ 
      error: "Failed to create cluster", 
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
    const centerId = searchParams.get("centerId");
    const includeHQ = searchParams.get("includeHQ") === "true";
    
    const skip = (page - 1) * limit;
    
    await connectToDB();
    
    // Build query
    const query: FilterQuery<typeof Cluster> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { clusterId: { $regex: search, $options: "i" } },
      ];
    }
    
    if (centerId) {
      query.centerId = centerId;
    } else if (includeHQ) {
      // If includeHQ is true and no centerId specified, include clusters with null centerId (Global clusters)
      query.$or = query.$or || [];
      query.$or.push({ centerId: null });
    }
    
    // Get clusters with pagination
    const clusters = await Cluster.find(query)
      .populate('centerId', 'name')
      .populate('leaderId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await Cluster.countDocuments(query);
    
    // Calculate total pages
    const pages = Math.ceil(total / limit);
    
    return NextResponse.json({
      clusters,
      paginationInfo: {
        page,
        limit,
        total,
        pages,
      },
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error fetching clusters:", error);
    return NextResponse.json({ 
      error: "Failed to fetch clusters", 
      message: errorMessage 
    }, { status: 500 });
  }
}

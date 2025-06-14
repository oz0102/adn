import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Changed to use auth()
import { smallGroupService } from "@/services/smallGroupService"; // Changed to import service object
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import Cluster from "@/models/cluster";

export async function POST(request: Request) {
  try {
    const session = await auth(); 
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { clusterId, centerId } = body; 

    if (!clusterId || !centerId) {
      return NextResponse.json({ message: "Cluster ID and Center ID are required" }, { status: 400 });
    }

    await connectToDB();
    const parentCluster = await Cluster.findById(clusterId).select("centerId").lean();
    if (!parentCluster) {
        return NextResponse.json({ message: "Parent cluster not found" }, { status: 404 });
    }
    if (parentCluster.centerId.toString() !== centerId.toString()) { // Ensure IDs are compared as strings
        return NextResponse.json({ message: "Cluster does not belong to the specified center" }, { status: 400 });
    }

    const hasGlobalAdminPermission = await checkPermission(userId, "GLOBAL_ADMIN");
    const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId });
    const isClusterLeader = await checkPermission(userId, "CLUSTER_LEADER", { clusterId, centerId });

    if (!hasGlobalAdminPermission && !isCenterAdmin && !isClusterLeader) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }
    // Add createdBy to the body for the service function
    const smallGroupData = { ...body, createdBy: userId };
    const newSmallGroup = await smallGroupService.createSmallGroup(smallGroupData);
    return NextResponse.json(newSmallGroup, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Failed to create small group:", error);
    return NextResponse.json({ message: "Failed to create small group", error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth(); 
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    const clusterIdQuery = searchParams.get("clusterId");
    const centerIdQuery = searchParams.get("centerId");

    await connectToDB();
    let smallGroups;

    const hasGlobalAdminPermission = await checkPermission(userId, "GLOBAL_ADMIN");

    if (hasGlobalAdminPermission) {
      smallGroups = await smallGroupService.getAllSmallGroups(clusterIdQuery || undefined, centerIdQuery || undefined);
    } else {
      if (clusterIdQuery) {
        const parentCluster = await Cluster.findById(clusterIdQuery).select("centerId").lean();
        if (!parentCluster) return NextResponse.json({ message: "Cluster not found" }, { status: 404 });
        
        const canAccessCluster = await checkPermission(userId, "CLUSTER_LEADER", { clusterId: clusterIdQuery, centerId: parentCluster.centerId.toString() }) || 
                                 await checkPermission(userId, "CENTER_ADMIN", { centerId: parentCluster.centerId.toString() });
        if (canAccessCluster) {
          smallGroups = await smallGroupService.getAllSmallGroups(clusterIdQuery);
        } else {
          return NextResponse.json({ message: "Forbidden: Insufficient permissions for this cluster" }, { status: 403 });
        }
      } else if (centerIdQuery) {
        const canAccessCenter = await checkPermission(userId, "CENTER_ADMIN", { centerId: centerIdQuery });
        if (canAccessCenter) {
          smallGroups = await smallGroupService.getAllSmallGroups(undefined, centerIdQuery);
        } else {
          return NextResponse.json({ message: "Forbidden: Insufficient permissions for this center" }, { status: 403 });
        }
      } else {
        // If not GLOBAL_ADMIN and no specific scope, decide what to return.
        // Option 1: Return empty array or error.
        // Option 2: Fetch all small groups from all centers/clusters the user has access to (more complex query).
        // For now, returning an error if no specific scope is provided by non-GLOBAL_ADMIN.
        return NextResponse.json({ message: "Forbidden: Please specify a clusterId or centerId, or have Global Admin role to view all small groups." }, { status: 403 });
      }
    }
    
    return NextResponse.json(smallGroups, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Failed to retrieve small groups:", error);
    return NextResponse.json({ message: "Failed to retrieve small groups", error: errorMessage }, { status: 500 });
  }
}


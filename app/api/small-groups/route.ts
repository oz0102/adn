import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  createSmallGroupService,
  getAllSmallGroupsService
} from "@/services/smallGroupService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import Cluster from "@/models/cluster"; // To verify cluster's center for CLUSTER_LEADER

/**
 * Handles POST requests to create a new Small Group.
 * Requires HQ_ADMIN, or CENTER_ADMIN of the target center, or CLUSTER_LEADER of the target cluster.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { clusterId, centerId } = body; // Extract clusterId and centerId from the body

    if (!clusterId || !centerId) {
      return NextResponse.json({ message: "Cluster ID and Center ID are required" }, { status: 400 });
    }

    await connectToDB();
    const parentCluster = await Cluster.findById(clusterId).select("centerId").lean();
    if (!parentCluster) {
        return NextResponse.json({ message: "Parent cluster not found" }, { status: 404 });
    }
    if (parentCluster.centerId.toString() !== centerId) {
        return NextResponse.json({ message: "Cluster does not belong to the specified center" }, { status: 400 });
    }

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId });
    const isClusterLeader = await checkPermission(userId, "CLUSTER_LEADER", { clusterId, centerId });

    if (!hasHQAdminPermission && !isCenterAdmin && !isClusterLeader) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const newSmallGroup = await createSmallGroupService(body);
    return NextResponse.json(newSmallGroup, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create small group:", error);
    return NextResponse.json({ message: "Failed to create small group", error: error.message }, { status: 500 });
  }
}

/**
 * Handles GET requests to retrieve all Small Groups, optionally filtered by clusterId or centerId.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    const clusterIdQuery = searchParams.get("clusterId");
    const centerIdQuery = searchParams.get("centerId");

    await connectToDB();
    let smallGroups;

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");

    if (hasHQAdminPermission) {
      smallGroups = await getAllSmallGroupsService(clusterIdQuery || undefined, centerIdQuery || undefined);
    } else {
      // User needs to be at least a CLUSTER_LEADER for the queried cluster, or CENTER_ADMIN for the queried center.
      if (clusterIdQuery) {
        const parentCluster = await Cluster.findById(clusterIdQuery).select("centerId").lean();
        if (!parentCluster) return NextResponse.json({ message: "Cluster not found" }, { status: 404 });
        
        const canAccessCluster = await checkPermission(userId, "CLUSTER_LEADER", { clusterId: clusterIdQuery, centerId: parentCluster.centerId }) || 
                                 await checkPermission(userId, "CENTER_ADMIN", { centerId: parentCluster.centerId });
        if (canAccessCluster) {
          smallGroups = await getAllSmallGroupsService(clusterIdQuery);
        } else {
          return NextResponse.json({ message: "Forbidden: Insufficient permissions for this cluster" }, { status: 403 });
        }
      } else if (centerIdQuery) {
        const canAccessCenter = await checkPermission(userId, "CENTER_ADMIN", { centerId: centerIdQuery });
        if (canAccessCenter) {
          smallGroups = await getAllSmallGroupsService(undefined, centerIdQuery);
        } else {
          return NextResponse.json({ message: "Forbidden: Insufficient permissions for this center" }, { status: 403 });
        }
      } else {
        // Non-HQ_ADMIN must specify a scope (clusterId or centerId)
        // Or, implement logic to fetch all small groups from all clusters/centers they have access to.
        return NextResponse.json({ message: "Forbidden: Please specify a clusterId or centerId, or have HQ Admin role" }, { status: 403 });
      }
    }
    
    return NextResponse.json(smallGroups, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve small groups:", error);
    return NextResponse.json({ message: "Failed to retrieve small groups", error: error.message }, { status: 500 });
  }
}


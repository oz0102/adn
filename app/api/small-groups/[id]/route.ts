import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  getSmallGroupByIdService,
  updateSmallGroupService,
  deleteSmallGroupService
} from "@/services/smallGroupService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import SmallGroup from "@/models/smallGroup"; // Import SmallGroup model for permission checks

interface Params {
  params: { id: string };
}

/**
 * Handles GET requests to retrieve a specific Small Group by ID.
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const smallGroupId = params.id;

    await connectToDB();
    const smallGroup = await getSmallGroupByIdService(smallGroupId);

    if (!smallGroup) {
      return NextResponse.json({ message: "Small Group not found" }, { status: 404 });
    }

    // Permissions: HQ_ADMIN, CENTER_ADMIN of group's center, CLUSTER_LEADER of group's cluster, or SMALL_GROUP_LEADER of this group.
    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId: smallGroup.centerId });
    const isClusterLeader = await checkPermission(userId, "CLUSTER_LEADER", { clusterId: smallGroup.clusterId, centerId: smallGroup.centerId });
    const isSmallGroupLeader = await checkPermission(userId, "SMALL_GROUP_LEADER", { smallGroupId: smallGroup._id, clusterId: smallGroup.clusterId, centerId: smallGroup.centerId });

    if (!hasHQAdminPermission && !isCenterAdmin && !isClusterLeader && !isSmallGroupLeader) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }
    
    return NextResponse.json(smallGroup, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to retrieve small group ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve small group", error: error.message }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update a specific Small Group by ID.
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const smallGroupId = params.id;

    await connectToDB();
    const existingSmallGroup = await SmallGroup.findById(smallGroupId).select("centerId clusterId").lean();
    if (!existingSmallGroup) {
      return NextResponse.json({ message: "Small Group not found" }, { status: 404 });
    }

    // Permissions: HQ_ADMIN, CENTER_ADMIN of group's center, or CLUSTER_LEADER of group's cluster.
    // SMALL_GROUP_LEADER might have limited update rights, e.g., description. For now, restricting to higher roles for structural changes.
    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingSmallGroup.centerId });
    const isClusterLeader = await checkPermission(userId, "CLUSTER_LEADER", { clusterId: existingSmallGroup.clusterId, centerId: existingSmallGroup.centerId });

    if (!hasHQAdminPermission && !isCenterAdmin && !isClusterLeader) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions for update" }, { status: 403 });
    }

    const body = await request.json();
    const updatedSmallGroup = await updateSmallGroupService(smallGroupId, body);

    if (!updatedSmallGroup) {
      return NextResponse.json({ message: "Small Group not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedSmallGroup, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to update small group ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to update small group", error: error.message }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a specific Small Group by ID.
 */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const smallGroupId = params.id;

    await connectToDB();
    const existingSmallGroup = await SmallGroup.findById(smallGroupId).select("centerId clusterId").lean();
    if (!existingSmallGroup) {
      return NextResponse.json({ message: "Small Group not found" }, { status: 404 });
    }

    // Permissions: HQ_ADMIN, CENTER_ADMIN of group's center, or CLUSTER_LEADER of group's cluster.
    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingSmallGroup.centerId });
    const isClusterLeader = await checkPermission(userId, "CLUSTER_LEADER", { clusterId: existingSmallGroup.clusterId, centerId: existingSmallGroup.centerId });

    if (!hasHQAdminPermission && !isCenterAdmin && !isClusterLeader) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions for delete" }, { status: 403 });
    }

    const deletedSmallGroup = await deleteSmallGroupService(smallGroupId);

    if (!deletedSmallGroup) {
      return NextResponse.json({ message: "Small Group not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Small Group deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete small group ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete small group", error: error.message }, { status: 500 });
  }
}


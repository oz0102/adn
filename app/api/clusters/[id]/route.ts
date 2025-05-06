import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  getClusterByIdService,
  updateClusterService,
  deleteClusterService
} from "@/services/clusterService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import Cluster from "@/models/cluster"; // Import Cluster model to fetch centerId for permission checks

interface Params {
  params: { id: string };
}

/**
 * Handles GET requests to retrieve a specific Cluster by ID.
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const clusterId = params.id;

    await connectToDB();
    const cluster = await getClusterByIdService(clusterId);

    if (!cluster) {
      return NextResponse.json({ message: "Cluster not found" }, { status: 404 });
    }

    // Permission checks: HQ_ADMIN, or CENTER_ADMIN of the cluster's center, or CLUSTER_LEADER of this cluster.
    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdminForCluster = await checkPermission(userId, "CENTER_ADMIN", { centerId: cluster.centerId });
    const isClusterLeaderForThisCluster = await checkPermission(userId, "CLUSTER_LEADER", { clusterId: cluster._id, centerId: cluster.centerId });

    if (!hasHQAdminPermission && !isCenterAdminForCluster && !isClusterLeaderForThisCluster) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }
    
    return NextResponse.json(cluster, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to retrieve cluster ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve cluster", error: error.message }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update a specific Cluster by ID.
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const clusterId = params.id;

    await connectToDB();
    const existingCluster = await Cluster.findById(clusterId).select("centerId").lean();
    if (!existingCluster) {
      return NextResponse.json({ message: "Cluster not found" }, { status: 404 });
    }

    // Permission checks: HQ_ADMIN, or CENTER_ADMIN of the cluster's center.
    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdminForCluster = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingCluster.centerId });
    // CLUSTER_LEADER might have limited update rights, e.g., description, not centerId. For now, restricting to admins.

    if (!hasHQAdminPermission && !isCenterAdminForCluster) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions for update" }, { status: 403 });
    }

    const body = await request.json();
    const updatedCluster = await updateClusterService(clusterId, body);

    if (!updatedCluster) {
      return NextResponse.json({ message: "Cluster not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedCluster, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to update cluster ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to update cluster", error: error.message }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a specific Cluster by ID.
 */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const clusterId = params.id;

    await connectToDB();
    const existingCluster = await Cluster.findById(clusterId).select("centerId").lean();
    if (!existingCluster) {
      return NextResponse.json({ message: "Cluster not found" }, { status: 404 });
    }

    // Permission checks: HQ_ADMIN, or CENTER_ADMIN of the cluster's center.
    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdminForCluster = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingCluster.centerId });

    if (!hasHQAdminPermission && !isCenterAdminForCluster) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions for delete" }, { status: 403 });
    }

    const deletedCluster = await deleteClusterService(clusterId);

    if (!deletedCluster) {
      return NextResponse.json({ message: "Cluster not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Cluster deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete cluster ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete cluster", error: error.message }, { status: 500 });
  }
}


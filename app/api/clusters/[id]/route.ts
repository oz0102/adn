import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Corrected: Use auth() for server-side session
import { clusterService } from "@/services/clusterService"; // Assuming clusterService exports an object
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import ClusterModel from "@/models/cluster"; // Corrected: Use ClusterModel for consistency if it's the default export

interface Params {
  params: { id: string };
}

/**
 * Handles GET requests to retrieve a specific Cluster by ID.
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await auth(); // Corrected: Use auth() to get session
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const clusterId = params.id;

    await connectToDB();
    const cluster = await clusterService.getClusterById(clusterId); // Corrected: Use service object

    if (!cluster) {
      return NextResponse.json({ message: "Cluster not found" }, { status: 404 });
    }

    const hasGlobalAdminPermission = await checkPermission(userId, "GLOBAL_ADMIN");
    // Ensure cluster.centerId is correctly typed if it's an ObjectId from the service
    const centerIdString = cluster.centerId?.toString();
    const clusterIdString = cluster._id?.toString();

    const isCenterAdminForCluster = centerIdString ? await checkPermission(userId, "CENTER_ADMIN", { centerId: new mongoose.Types.ObjectId(centerIdString) }) : false;
    const isClusterLeaderForThisCluster = (clusterIdString && centerIdString) ? await checkPermission(userId, "CLUSTER_LEADER", { clusterId: new mongoose.Types.ObjectId(clusterIdString), centerId: new mongoose.Types.ObjectId(centerIdString) }) : false;

    if (!hasGlobalAdminPermission && !isCenterAdminForCluster && !isClusterLeaderForThisCluster) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }
    
    return NextResponse.json(cluster, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to retrieve cluster ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve cluster", error: errorMessage }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update a specific Cluster by ID.
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth(); // Corrected: Use auth() to get session
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const clusterId = params.id;

    await connectToDB();
    const existingCluster = await ClusterModel.findById(clusterId).select("centerId").lean();
    if (!existingCluster) {
      return NextResponse.json({ message: "Cluster not found" }, { status: 404 });
    }

    const hasGlobalAdminPermission = await checkPermission(userId, "GLOBAL_ADMIN");
    const isCenterAdminForCluster = existingCluster.centerId ? await checkPermission(userId, "CENTER_ADMIN", { centerId: existingCluster.centerId }) : false;

    if (!hasGlobalAdminPermission && !isCenterAdminForCluster) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions for update" }, { status: 403 });
    }

    const body = await request.json();
    const updatedCluster = await clusterService.updateCluster(clusterId, body); // Corrected: Use service object

    if (!updatedCluster) {
      return NextResponse.json({ message: "Cluster not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedCluster, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to update cluster ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to update cluster", error: errorMessage }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a specific Cluster by ID.
 */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth(); // Corrected: Use auth() to get session
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const clusterId = params.id;

    await connectToDB();
    const existingCluster = await ClusterModel.findById(clusterId).select("centerId").lean();
    if (!existingCluster) {
      return NextResponse.json({ message: "Cluster not found" }, { status: 404 });
    }

    const hasGlobalAdminPermission = await checkPermission(userId, "GLOBAL_ADMIN");
    const isCenterAdminForCluster = existingCluster.centerId ? await checkPermission(userId, "CENTER_ADMIN", { centerId: existingCluster.centerId }) : false;

    if (!hasGlobalAdminPermission && !isCenterAdminForCluster) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions for delete" }, { status: 403 });
    }

    const deletedCluster = await clusterService.deleteCluster(clusterId); // Corrected: Use service object

    if (!deletedCluster) {
      return NextResponse.json({ message: "Cluster not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Cluster deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to delete cluster ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete cluster", error: errorMessage }, { status: 500 });
  }
}


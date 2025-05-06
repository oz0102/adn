import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  createClusterService,
  getAllClustersService
} from "@/services/clusterService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";

/**
 * Handles POST requests to create a new Cluster.
 * Requires HQ_ADMIN or CENTER_ADMIN (for the target center) privileges.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { centerId } = body; // Extract centerId from the body

    if (!centerId) {
      return NextResponse.json({ message: "Center ID is required in the request body" }, { status: 400 });
    }

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdminForTargetCenter = await checkPermission(userId, "CENTER_ADMIN", { centerId });

    if (!hasHQAdminPermission && !isCenterAdminForTargetCenter) {
      return NextResponse.json({ message: "Forbidden: Requires HQ Admin role or Center Admin role for the specified center" }, { status: 403 });
    }

    await connectToDB();
    const newCluster = await createClusterService(body);
    return NextResponse.json(newCluster, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create cluster:", error);
    return NextResponse.json({ message: "Failed to create cluster", error: error.message }, { status: 500 });
  }
}

/**
 * Handles GET requests to retrieve all Clusters, optionally filtered by centerId.
 * HQ_ADMIN gets all clusters or all clusters for a specific center.
 * CENTER_ADMIN gets all clusters for their assigned center(s).
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    const centerIdQuery = searchParams.get("centerId");

    await connectToDB();
    let clusters;

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");

    if (hasHQAdminPermission) {
      clusters = await getAllClustersService(centerIdQuery || undefined);
    } else {
      // For CENTER_ADMIN, they should only see clusters within their assigned center(s).
      // This requires fetching the user's assigned centers.
      // For simplicity in this step, if a centerIdQuery is provided, we check if they are admin for THAT center.
      // A more robust solution would iterate through all their CENTER_ADMIN roles.
      if (centerIdQuery) {
        const isCenterAdminForQueryCenter = await checkPermission(userId, "CENTER_ADMIN", { centerId: centerIdQuery });
        if (isCenterAdminForQueryCenter) {
          clusters = await getAllClustersService(centerIdQuery);
        } else {
          return NextResponse.json({ message: "Forbidden: You are not an admin for the specified center" }, { status: 403 });
        }
      } else {
        // If no centerId is specified by a non-HQ_ADMIN, it's ambiguous.
        // Could return all clusters from all centers they manage, or restrict.
        // For now, restricting to prevent accidental broad queries.
        return NextResponse.json({ message: "Forbidden: Please specify a centerId or have HQ Admin role" }, { status: 403 });
      }
    }
    
    return NextResponse.json(clusters, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve clusters:", error);
    return NextResponse.json({ message: "Failed to retrieve clusters", error: error.message }, { status: 500 });
  }
}


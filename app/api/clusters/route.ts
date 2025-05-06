import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Corrected: Use auth() for server-side session
import { clusterService } from "@/services/clusterService"; // Assuming clusterService exports an object
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";

/**
 * Handles POST requests to create a new Cluster.
 * Requires HQ_ADMIN or CENTER_ADMIN (for the target center) privileges.
 */
export async function POST(request: Request) {
  try {
    const session = await auth(); // Corrected: Use auth() to get session
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { centerId } = body; 

    if (!centerId) {
      return NextResponse.json({ message: "Center ID is required in the request body" }, { status: 400 });
    }

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdminForTargetCenter = await checkPermission(userId, "CENTER_ADMIN", { centerId });

    if (!hasHQAdminPermission && !isCenterAdminForTargetCenter) {
      return NextResponse.json({ message: "Forbidden: Requires HQ Admin role or Center Admin role for the specified center" }, { status: 403 });
    }

    await connectToDB();
    const newCluster = await clusterService.createCluster(body); // Corrected: Use service object
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
    const session = await auth(); // Corrected: Use auth() to get session
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
      clusters = await clusterService.getAllClusters(centerIdQuery || undefined); // Corrected: Use service object
    } else {
      if (centerIdQuery) {
        const isCenterAdminForQueryCenter = await checkPermission(userId, "CENTER_ADMIN", { centerId: centerIdQuery });
        if (isCenterAdminForQueryCenter) {
          clusters = await clusterService.getAllClusters(centerIdQuery); // Corrected: Use service object
        } else {
          return NextResponse.json({ message: "Forbidden: You are not an admin for the specified center" }, { status: 403 });
        }
      } else {
        return NextResponse.json({ message: "Forbidden: Please specify a centerId or have HQ Admin role" }, { status: 403 });
      }
    }
    
    return NextResponse.json(clusters, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve clusters:", error);
    return NextResponse.json({ message: "Failed to retrieve clusters", error: error.message }, { status: 500 });
  }
}


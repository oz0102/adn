import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Changed to use auth()
import {
  smallGroupService // Assuming smallGroupService is an object with methods
} from "@/services/smallGroupService";
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import SmallGroup from "@/models/smallGroup"; 

interface Params {
  params: { id: string };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await auth(); 
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const smallGroupId = params.id;

    await connectToDB();
    const smallGroup = await smallGroupService.getSmallGroupById(smallGroupId); // Changed to use smallGroupService

    if (!smallGroup) {
      return NextResponse.json({ message: "Small Group not found" }, { status: 404 });
    }

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    // Ensure IDs are strings for checkPermission if they are ObjectIds
    const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId: smallGroup.centerId?.toString() });
    const isClusterLeader = await checkPermission(userId, "CLUSTER_LEADER", { clusterId: smallGroup.clusterId?.toString(), centerId: smallGroup.centerId?.toString() });
    const isSmallGroupLeader = await checkPermission(userId, "SMALL_GROUP_LEADER", { smallGroupId: smallGroup._id.toString(), clusterId: smallGroup.clusterId?.toString(), centerId: smallGroup.centerId?.toString() });

    if (!hasHQAdminPermission && !isCenterAdmin && !isClusterLeader && !isSmallGroupLeader) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }
    
    return NextResponse.json(smallGroup, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to retrieve small group ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve small group", error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth(); 
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

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingSmallGroup.centerId?.toString() });
    const isClusterLeader = await checkPermission(userId, "CLUSTER_LEADER", { clusterId: existingSmallGroup.clusterId?.toString(), centerId: existingSmallGroup.centerId?.toString() });

    if (!hasHQAdminPermission && !isCenterAdmin && !isClusterLeader) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions for update" }, { status: 403 });
    }

    const body = await request.json();
    // Prevent changing centerId or clusterId directly via this route if not intended
    delete body.centerId;
    delete body.clusterId;
    
    const updatedSmallGroup = await smallGroupService.updateSmallGroup(smallGroupId, body); // Changed to use smallGroupService

    if (!updatedSmallGroup) {
      return NextResponse.json({ message: "Small Group not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedSmallGroup, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to update small group ${params.id}:`, error);
    if (error.name === "ValidationError" || error.message.includes("Invalid Cluster ID") || error.message.includes("Invalid Leader ID")) {
        return NextResponse.json({ message: "Validation Error", error: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update small group", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth(); 
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

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingSmallGroup.centerId?.toString() });
    const isClusterLeader = await checkPermission(userId, "CLUSTER_LEADER", { clusterId: existingSmallGroup.clusterId?.toString(), centerId: existingSmallGroup.centerId?.toString() });

    if (!hasHQAdminPermission && !isCenterAdmin && !isClusterLeader) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions for delete" }, { status: 403 });
    }

    const deletedSmallGroup = await smallGroupService.deleteSmallGroup(smallGroupId); // Changed to use smallGroupService

    if (!deletedSmallGroup) {
      return NextResponse.json({ message: "Small Group not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Small Group deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete small group ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete small group", error: error.message }, { status: 500 });
  }
}


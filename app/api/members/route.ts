import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Changed to use auth()
import {
  memberService // Assuming memberService is an object with methods
} from "@/services/memberService";
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import Cluster from "@/models/cluster";
import SmallGroup from "@/models/smallGroup";

export async function POST(request: Request) {
  try {
    const session = await auth(); 
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { centerId, clusterId, smallGroupId } = body;

    if (!centerId) {
      return NextResponse.json({ message: "Center ID is required to create a member" }, { status: 400 });
    }

    await connectToDB();

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId });
    let canManageMembersInScope = false;

    if (smallGroupId) {
        const sg = await SmallGroup.findById(smallGroupId).select("clusterId centerId").lean();
        if (!sg || sg.centerId.toString() !== centerId || (clusterId && sg.clusterId.toString() !== clusterId)) {
            return NextResponse.json({ message: "Small group not found or mismatched hierarchy"}, { status: 400 });
        }
        canManageMembersInScope = await checkPermission(userId, "MEMBER_ADMIN", { smallGroupId: sg._id.toString(), clusterId: sg.clusterId.toString(), centerId: sg.centerId.toString() });
    } else if (clusterId) {
        const cl = await Cluster.findById(clusterId).select("centerId").lean();
        if (!cl || cl.centerId.toString() !== centerId) {
            return NextResponse.json({ message: "Cluster not found or mismatched hierarchy"}, { status: 400 });
        }
        canManageMembersInScope = await checkPermission(userId, "MEMBER_ADMIN", { clusterId: cl._id.toString(), centerId: cl.centerId.toString() });
    } else {
        canManageMembersInScope = await checkPermission(userId, "MEMBER_ADMIN", { centerId });
    }

    if (!hasHQAdminPermission && !isCenterAdmin && !canManageMembersInScope) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to create member in this scope" }, { status: 403 });
    }
    
    body.createdBy = userId; // Add createdBy before passing to service
    const newMember = await memberService.createMember(body); // Changed to use memberService
    return NextResponse.json(newMember, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create member:", error);
    if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 }); 
    }
    return NextResponse.json({ message: "Failed to create member", error: error.message }, { status: 500 });
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
    
    const filters: any = {};
    searchParams.forEach((value, key) => {
      if (key === "page" || key === "limit") {
        filters[key] = parseInt(value, 10);
      } else {
        filters[key] = value;
      }
    });

    await connectToDB();

    let requiredScope: any = {};
    let scopeForPermissionCheck = "HQ"; 

    if (filters.smallGroupId) {
        const sg = await SmallGroup.findById(filters.smallGroupId).select("clusterId centerId").lean();
        if (!sg) return NextResponse.json({ message: "Small Group not found for filtering" }, { status: 404 });
        requiredScope = { smallGroupId: sg._id.toString(), clusterId: sg.clusterId.toString(), centerId: sg.centerId.toString() };
        scopeForPermissionCheck = "SMALL_GROUP";
    } else if (filters.clusterId) {
        const cl = await Cluster.findById(filters.clusterId).select("centerId").lean();
        if (!cl) return NextResponse.json({ message: "Cluster not found for filtering" }, { status: 404 });
        requiredScope = { clusterId: cl._id.toString(), centerId: cl.centerId.toString() };
        scopeForPermissionCheck = "CLUSTER";
    } else if (filters.centerId) {
        requiredScope = { centerId: filters.centerId };
        scopeForPermissionCheck = "CENTER";
    }

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    let canAccessData = hasHQAdminPermission;

    if (!canAccessData) {
        switch (scopeForPermissionCheck) {
            case "SMALL_GROUP":
                canAccessData = await checkPermission(userId, "SMALL_GROUP_LEADER", requiredScope) || 
                                await checkPermission(userId, "MEMBER_ADMIN", requiredScope) || 
                                await checkPermission(userId, "CLUSTER_LEADER", { clusterId: requiredScope.clusterId, centerId: requiredScope.centerId }) || 
                                await checkPermission(userId, "CENTER_ADMIN", { centerId: requiredScope.centerId });
                break;
            case "CLUSTER":
                canAccessData = await checkPermission(userId, "CLUSTER_LEADER", requiredScope) || 
                                await checkPermission(userId, "MEMBER_ADMIN", requiredScope) || 
                                await checkPermission(userId, "CENTER_ADMIN", { centerId: requiredScope.centerId });
                break;
            case "CENTER":
                canAccessData = await checkPermission(userId, "CENTER_ADMIN", requiredScope) || 
                                await checkPermission(userId, "MEMBER_ADMIN", requiredScope);
                break;
            default: 
                // If no specific scope, and not HQ admin, this implies they can only see their own data or data from their direct leadership scope.
                // This part needs to be carefully designed. For now, if no filters, non-HQ admins see nothing unless specific logic is added.
                // A better default might be to show members of centers they administer if they are CENTER_ADMIN.
                const userPermissions = session.user.permissions || [];
                const adminCenterIds = userPermissions.filter(p => p.role === "CENTER_ADMIN" && p.centerId).map(p => p.centerId);
                if (adminCenterIds.length > 0) {
                    filters.centerId = { $in: adminCenterIds.map(id => new mongoose.Types.ObjectId(id.toString())) };
                    canAccessData = true; // They can see members from centers they administer
                } else {
                    return NextResponse.json({ message: "Forbidden: Access restricted. Specify a scope or have broader permissions." }, { status: 403 });
                }
        }
    }

    if (!canAccessData) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions for the requested scope" }, { status: 403 });
    }

    const result = await memberService.getAllMembers(filters); // Changed to use memberService
    
    // Format the response to match what the frontend expects
    return NextResponse.json({
      data: {
        members: result.members,
        pagination: result.pagination
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve members:", error);
    return NextResponse.json({ message: "Failed to retrieve members", error: error.message }, { status: 500 });
  }
}

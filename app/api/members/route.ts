import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  createMemberService,
  getAllMembersService
} from "@/services/memberService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import Cluster from "@/models/cluster";
import SmallGroup from "@/models/smallGroup";

/**
 * Handles POST requests to create a new Member.
 * Requires MEMBER_ADMIN permission for the target center/cluster/small group, or CENTER_ADMIN, or HQ_ADMIN.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
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

    // Permission checks
    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId });
    let canManageMembersInScope = false;

    if (smallGroupId) {
        const sg = await SmallGroup.findById(smallGroupId).select("clusterId centerId").lean();
        if (!sg || sg.centerId.toString() !== centerId || (clusterId && sg.clusterId.toString() !== clusterId)) {
            return NextResponse.json({ message: "Small group not found or mismatched hierarchy"}, { status: 400 });
        }
        canManageMembersInScope = await checkPermission(userId, "MEMBER_ADMIN", { smallGroupId, clusterId: sg.clusterId, centerId: sg.centerId });
    } else if (clusterId) {
        const cl = await Cluster.findById(clusterId).select("centerId").lean();
        if (!cl || cl.centerId.toString() !== centerId) {
            return NextResponse.json({ message: "Cluster not found or mismatched hierarchy"}, { status: 400 });
        }
        canManageMembersInScope = await checkPermission(userId, "MEMBER_ADMIN", { clusterId, centerId });
    } else {
        canManageMembersInScope = await checkPermission(userId, "MEMBER_ADMIN", { centerId });
    }

    if (!hasHQAdminPermission && !isCenterAdmin && !canManageMembersInScope) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to create member in this scope" }, { status: 403 });
    }

    const newMember = await createMemberService(body);
    return NextResponse.json(newMember, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create member:", error);
    // Check for specific Mongoose validation errors or unique constraint errors
    if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: "Failed to create member", error: error.message }, { status: 500 });
  }
}

/**
 * Handles GET requests to retrieve Members, with filters and pagination.
 * Permissions depend on the scope of the query (centerId, clusterId, smallGroupId).
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
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

    // Determine the narrowest scope for permission checking
    let requiredScope: any = {};
    let scopeForPermissionCheck = "HQ"; // Default to HQ level access

    if (filters.smallGroupId) {
        const sg = await SmallGroup.findById(filters.smallGroupId).select("clusterId centerId").lean();
        if (!sg) return NextResponse.json({ message: "Small Group not found for filtering" }, { status: 404 });
        requiredScope = { smallGroupId: filters.smallGroupId, clusterId: sg.clusterId, centerId: sg.centerId };
        scopeForPermissionCheck = "SMALL_GROUP";
    } else if (filters.clusterId) {
        const cl = await Cluster.findById(filters.clusterId).select("centerId").lean();
        if (!cl) return NextResponse.json({ message: "Cluster not found for filtering" }, { status: 404 });
        requiredScope = { clusterId: filters.clusterId, centerId: cl.centerId };
        scopeForPermissionCheck = "CLUSTER";
    } else if (filters.centerId) {
        requiredScope = { centerId: filters.centerId };
        scopeForPermissionCheck = "CENTER";
    }
    // If no specific scope, implies HQ level or user's general access based on roles.

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
            default: // HQ or no specific scope, user must have a role that grants broad access or it's denied.
                // This part needs refinement: if no filters, what should non-HQ see? Probably nothing or only their own data.
                // For now, if not HQ and no scope, deny unless they are e.g. a global member admin (not a defined role yet).
                return NextResponse.json({ message: "Forbidden: Access restricted. Specify a scope or have broader permissions." }, { status: 403 });
        }
    }

    if (!canAccessData) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions for the requested scope" }, { status: 403 });
    }

    // If user is not HQ_ADMIN, ensure their query is scoped to what they are allowed to see.
    // E.g., a CENTER_ADMIN for center X cannot query for center Y unless filters.centerId is X.
    // The `checkPermission` already validates if they have the role for the *specific* ID in `requiredScope`.
    // So, if `canAccessData` is true, they are permitted for the *narrowest* scope defined in filters.

    const result = await getAllMembersService(filters);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve members:", error);
    return NextResponse.json({ message: "Failed to retrieve members", error: error.message }, { status: 500 });
  }
}


// app/api/discipleship-goals/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth"; // Corrected: Use auth() for server-side session
import { discipleshipGoalService } from "@/services/discipleshipGoalService"; // Corrected: Assuming service object export
import { connectToDB } from "@/lib/mongodb"; 
import { checkPermission } from "@/lib/permissions";
import mongoose, { Types } from "mongoose";
import CenterModel, { ICenter } from "@/models/center";
import ClusterModel, { ICluster } from "@/models/cluster";
import SmallGroupModel, { ISmallGroup } from "@/models/smallGroup";
import MemberModel, { IMember } from "@/models/member";
import UserModel, { IUser, IAssignedRole } from "@/models/user";
import { Session } from "next-auth";
import type { IDiscipleshipGoalCreationPayload, IDiscipleshipGoalFilters } from "@/services/discipleshipGoalService";

interface CustomSession extends Session {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    assignedRoles?: IAssignedRole[]; 
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth() as CustomSession | null; // Corrected: Use auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = new Types.ObjectId(session.user.id);
    const body = await request.json() as Partial<IDiscipleshipGoalCreationPayload>; 
    const { level, centerId, clusterId, smallGroupId, memberId, title, description, category, startDate, targetDate, status } = body;

    if (!level || !title || !category) {
      return NextResponse.json({ message: "Goal level, title, and category are required" }, { status: 400 });
    }

    await connectToDB();
    let hasPermissionToCreate = false;
    const userRoles = session.user.assignedRoles || [];

    let effectiveCenterId: Types.ObjectId | undefined = centerId ? new Types.ObjectId(centerId.toString()) : undefined;
    let effectiveClusterId: Types.ObjectId | undefined = clusterId ? new Types.ObjectId(clusterId.toString()) : undefined;
    let effectiveSmallGroupId: Types.ObjectId | undefined = smallGroupId ? new Types.ObjectId(smallGroupId.toString()) : undefined;
    let effectiveMemberId: Types.ObjectId | undefined = memberId ? new Types.ObjectId(memberId.toString()) : undefined;

    switch (level) {
      case "HQ":
        hasPermissionToCreate = userRoles.some(r => r.role === "HQ_ADMIN");
        break;
      case "CENTER":
        if (!effectiveCenterId) return NextResponse.json({ message: "Center ID required for CENTER level goal" }, { status: 400 });
        hasPermissionToCreate = userRoles.some(r => r.role === "HQ_ADMIN" || (r.role === "CENTER_ADMIN" && r.scopeId === effectiveCenterId!.toString()));
        break;
      case "CLUSTER":
        if (!effectiveClusterId || !effectiveCenterId) return NextResponse.json({ message: "Cluster ID and Center ID required for CLUSTER level goal" }, { status: 400 });
        hasPermissionToCreate = userRoles.some(r => 
            r.role === "HQ_ADMIN" || 
            (r.role === "CENTER_ADMIN" && r.scopeId === effectiveCenterId!.toString()) ||
            (r.role === "CLUSTER_LEADER" && r.scopeId === effectiveClusterId!.toString() && r.parentScopeId === effectiveCenterId!.toString())
        );
        break;
      case "SMALL_GROUP":
        if (!effectiveSmallGroupId || !effectiveClusterId || !effectiveCenterId) return NextResponse.json({ message: "Small Group, Cluster, and Center IDs required for SMALL_GROUP level goal" }, { status: 400 });
        hasPermissionToCreate = userRoles.some(r => 
            r.role === "HQ_ADMIN" || 
            (r.role === "CENTER_ADMIN" && r.scopeId === effectiveCenterId!.toString()) ||
            (r.role === "CLUSTER_LEADER" && r.scopeId === effectiveClusterId!.toString() && r.parentScopeId === effectiveCenterId!.toString()) ||
            (r.role === "SMALL_GROUP_LEADER" && r.scopeId === effectiveSmallGroupId!.toString() && r.parentScopeId === effectiveClusterId!.toString())
        );
        break;
      case "INDIVIDUAL":
        if (!effectiveMemberId) return NextResponse.json({ message: "Member ID required for INDIVIDUAL level goal" }, { status: 400 });
        const member = await MemberModel.findById(effectiveMemberId).select("smallGroupId clusterId centerId userId").lean<IMember>();
        if (!member) return NextResponse.json({ message: "Member not found"}, {status: 400});
        
        effectiveCenterId = member.centerId ? new Types.ObjectId(member.centerId.toString()) : undefined;
        effectiveClusterId = member.clusterId ? new Types.ObjectId(member.clusterId.toString()) : undefined;
        effectiveSmallGroupId = member.smallGroupId ? new Types.ObjectId(member.smallGroupId.toString()) : undefined;

        if (!effectiveCenterId) return NextResponse.json({ message: "Member must be associated with a Center for individual goal creation" }, { status: 400 });

        hasPermissionToCreate = userRoles.some(r => 
            r.role === "HQ_ADMIN" || 
            (r.role === "CENTER_ADMIN" && r.scopeId === effectiveCenterId!.toString()) || 
            (effectiveClusterId && r.role === "CLUSTER_LEADER" && r.scopeId === effectiveClusterId.toString() && r.parentScopeId === effectiveCenterId!.toString()) || 
            (effectiveSmallGroupId && effectiveClusterId && r.role === "SMALL_GROUP_LEADER" && r.scopeId === effectiveSmallGroupId.toString() && r.parentScopeId === effectiveClusterId.toString()) ||
            (member.userId && member.userId.toString() === currentUserId.toString()) // Self-creation
        );
        break;
      default:
        return NextResponse.json({ message: "Invalid goal level" }, { status: 400 });
    }

    if (!hasPermissionToCreate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to create goal for this scope" }, { status: 403 });
    }
    
    const goalPayload: IDiscipleshipGoalCreationPayload = {
        title: title!,
        description: description,
        category: category!,
        level: level,
        status: status || "PENDING",
        createdBy: currentUserId,
        centerId: effectiveCenterId,
        clusterId: effectiveClusterId,
        smallGroupId: effectiveSmallGroupId,
        memberId: effectiveMemberId,
        startDate: startDate ? new Date(startDate) : undefined,
        targetDate: targetDate ? new Date(targetDate) : undefined,
    };

    const newGoal = await discipleshipGoalService.createDiscipleshipGoal(goalPayload); // Corrected: Use service object
    return NextResponse.json(newGoal, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create discipleship goal:", error);
    if (error.name === "ValidationError" || error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create discipleship goal", error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth() as CustomSession | null; // Corrected: Use auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = new Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    const userRoles = session.user.assignedRoles || [];

    const filters: Partial<IDiscipleshipGoalFilters> = {};
    searchParams.forEach((value, key) => {
        if (key === "page" || key === "limit") {
            (filters as any)[key] = parseInt(value, 10);
        } else if (key === "level" || key === "status" || key === "category") {
            (filters as any)[key] = value;
        } else if (key === "centerId" || key === "clusterId" || key === "smallGroupId" || key === "memberId" || key === "createdBy") {
            if (Types.ObjectId.isValid(value)) {
                (filters as any)[key] = new Types.ObjectId(value);
            }
        }
    });

    await connectToDB();
    let canView = false;
    const isHQAdmin = userRoles.some(r => r.role === "HQ_ADMIN");

    if (isHQAdmin) {
        canView = true;
    } else {
        if (filters.centerId) {
            canView = userRoles.some(r => r.role === "CENTER_ADMIN" && r.scopeId === filters.centerId!.toString());
        }
        if (filters.memberId && filters.memberId.toString() === currentUserId.toString()) {
            const dbUser = await UserModel.findById(currentUserId).lean<IUser>();
            if (dbUser && dbUser.memberProfileId && dbUser.memberProfileId.toString() === filters.memberId.toString()) {
                canView = true;
            }
        }
        if (!filters.centerId && !filters.clusterId && !filters.smallGroupId && !filters.memberId) {
            filters.createdBy = currentUserId; 
            canView = true; 
        }
    }

    if (!isHQAdmin && !canView && (filters.centerId || filters.clusterId || filters.smallGroupId || filters.memberId)) {
         return NextResponse.json({ message: "Forbidden: Insufficient permissions to view goals for the specified scope." }, { status: 403 });
    }

    const finalFilters: IDiscipleshipGoalFilters = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        ...filters
    };

    const result = await discipleshipGoalService.getAllDiscipleshipGoals(finalFilters, userRoles, currentUserId); // Corrected: Use service object
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve discipleship goals:", error);
    return NextResponse.json({ message: "Failed to retrieve discipleship goals", error: error.message }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  createDiscipleshipGoalService,
  getAllDiscipleshipGoalsService
} from "@/services/discipleshipGoalService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import Center from "@/models/center";
import Cluster from "@/models/cluster";
import SmallGroup from "@/models/smallGroup";
import Member from "@/models/member";

/**
 * Handles POST requests to create a new Discipleship Goal.
 * Permissions depend on the level of the goal being created.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { level, centerId, clusterId, smallGroupId, memberId } = body;

    if (!level) {
      return NextResponse.json({ message: "Goal level is required" }, { status: 400 });
    }

    await connectToDB();
    let hasPermissionToCreate = false;

    switch (level) {
      case "HQ":
        hasPermissionToCreate = await checkPermission(userId, "HQ_ADMIN");
        break;
      case "CENTER":
        if (!centerId) return NextResponse.json({ message: "Center ID required for CENTER level goal" }, { status: 400 });
        hasPermissionToCreate = await checkPermission(userId, "HQ_ADMIN") || await checkPermission(userId, "CENTER_ADMIN", { centerId });
        break;
      case "CLUSTER":
        if (!clusterId || !centerId) return NextResponse.json({ message: "Cluster ID and Center ID required for CLUSTER level goal" }, { status: 400 });
        hasPermissionToCreate = await checkPermission(userId, "HQ_ADMIN") || 
                                await checkPermission(userId, "CENTER_ADMIN", { centerId }) || 
                                await checkPermission(userId, "CLUSTER_LEADER", { clusterId, centerId });
        break;
      case "SMALL_GROUP":
        if (!smallGroupId || !clusterId || !centerId) return NextResponse.json({ message: "Small Group, Cluster, and Center IDs required for SMALL_GROUP level goal" }, { status: 400 });
        hasPermissionToCreate = await checkPermission(userId, "HQ_ADMIN") || 
                                await checkPermission(userId, "CENTER_ADMIN", { centerId }) || 
                                await checkPermission(userId, "CLUSTER_LEADER", { clusterId, centerId }) || 
                                await checkPermission(userId, "SMALL_GROUP_LEADER", { smallGroupId, clusterId, centerId });
        break;
      case "INDIVIDUAL":
        if (!memberId || !centerId) return NextResponse.json({ message: "Member ID and Center ID required for INDIVIDUAL level goal" }, { status: 400 });
        // For individual goals, the creator could be the member themselves, their leader, or an admin.
        // This requires more complex permission logic, e.g., checking if userId corresponds to memberId or their leader.
        // For now, let's assume admins or relevant leaders can create.
        const member = await Member.findById(memberId).select("smallGroupId clusterId centerId").lean();
        if (!member || member.centerId.toString() !== centerId) return NextResponse.json({ message: "Member not found or mismatched center"}, {status: 400});

        hasPermissionToCreate = await checkPermission(userId, "HQ_ADMIN") || 
                                await checkPermission(userId, "CENTER_ADMIN", { centerId }) || 
                                (member.clusterId ? await checkPermission(userId, "CLUSTER_LEADER", { clusterId: member.clusterId, centerId }) : false) || 
                                (member.smallGroupId ? await checkPermission(userId, "SMALL_GROUP_LEADER", { smallGroupId: member.smallGroupId, clusterId: member.clusterId, centerId }) : false);
                                // Add self-creation: || session.user.memberId === memberId (if User is linked to Member)
        break;
      default:
        return NextResponse.json({ message: "Invalid goal level" }, { status: 400 });
    }

    if (!hasPermissionToCreate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to create goal for this scope" }, { status: 403 });
    }
    
    body.createdBy = userId;
    const newGoal = await createDiscipleshipGoalService(body);
    return NextResponse.json(newGoal, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create discipleship goal:", error);
    if (error.name === "ValidationError") {
        return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create discipleship goal", error: error.message }, { status: 500 });
  }
}

/**
 * Handles GET requests to retrieve Discipleship Goals.
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
    // Permission logic for GET: Users should only see goals relevant to their scope.
    // HQ_ADMIN sees all. Others see goals at their level and below within their scope.
    // This is complex. A simpler model: if querying a specific scope, check permission for that scope.
    // If no scope, HQ_ADMIN sees all; others see goals related to their direct assignments.

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    let canView = hasHQAdminPermission;

    if (!canView) {
        if (filters.level === "HQ") canView = true; // All logged-in users can see HQ goals
        else if (filters.level === "CENTER" && filters.centerId) {
            canView = await checkPermission(userId, "CENTER_ADMIN", { centerId: filters.centerId });
            // Add logic for members of the center to view center goals
        } else if (filters.level === "CLUSTER" && filters.clusterId && filters.centerId) {
            canView = await checkPermission(userId, "CLUSTER_LEADER", { clusterId: filters.clusterId, centerId: filters.centerId }) || 
                      await checkPermission(userId, "CENTER_ADMIN", { centerId: filters.centerId });
        } else if (filters.level === "SMALL_GROUP" && filters.smallGroupId && filters.clusterId && filters.centerId) {
            canView = await checkPermission(userId, "SMALL_GROUP_LEADER", { smallGroupId: filters.smallGroupId, clusterId: filters.clusterId, centerId: filters.centerId }) || 
                      await checkPermission(userId, "CLUSTER_LEADER", { clusterId: filters.clusterId, centerId: filters.centerId }) || 
                      await checkPermission(userId, "CENTER_ADMIN", { centerId: filters.centerId });
        } else if (filters.level === "INDIVIDUAL" && filters.memberId) {
            const member = await Member.findById(filters.memberId).select("smallGroupId clusterId centerId").lean();
            if(member){
                canView = (session.user as any).memberId === filters.memberId || // Self view
                          await checkPermission(userId, "SMALL_GROUP_LEADER", { smallGroupId: member.smallGroupId, clusterId: member.clusterId, centerId: member.centerId }) || 
                          await checkPermission(userId, "CLUSTER_LEADER", { clusterId: member.clusterId, centerId: member.centerId }) || 
                          await checkPermission(userId, "CENTER_ADMIN", { centerId: member.centerId });
            }
        } else if (!filters.level && !filters.centerId && !filters.clusterId && !filters.smallGroupId && !filters.memberId) {
            // No specific scope, non-HQ_ADMIN. Fetch goals based on their roles.
            // This requires fetching all user's roles and constructing a complex $or query.
            // For now, default to showing only HQ goals if no specific scope is requested by non-admin.
            filters.level = "HQ";
            canView = true;
        } else {
             return NextResponse.json({ message: "Forbidden: Insufficient permissions or ambiguous scope for your role." }, { status: 403 });
        }
    }

    if (!canView) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to view goals for this scope" }, { status: 403 });
    }

    const result = await getAllDiscipleshipGoalsService(filters);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve discipleship goals:", error);
    return NextResponse.json({ message: "Failed to retrieve discipleship goals", error: error.message }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  createNotificationService,
  getAllNotificationsForUserService
} from "@/services/notificationService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import User from "@/models/user"; // To fetch user details for scoping notifications
import Member from "@/models/member"; // To fetch member details for scoping notifications

/**
 * Handles POST requests to create a new Notification.
 * Permissions depend on the targetLevel of the notification.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { targetLevel, targetId, originatorCenterId } = body;

    if (!targetLevel) {
      return NextResponse.json({ message: "Notification targetLevel is required" }, { status: 400 });
    }

    await connectToDB();
    let hasPermissionToCreate = false;

    // Simplified permission check: HQ_ADMIN can send any notification.
    // CENTER_ADMIN can send notifications to their center or HQ (if allowed by policy).
    // More granular checks would be needed for CLUSTER_LEADER, SMALL_GROUP_LEADER to send to their specific scopes.
    hasPermissionToCreate = await checkPermission(userId, "HQ_ADMIN");

    if (!hasPermissionToCreate && targetLevel === "CENTER" && targetId) {
      hasPermissionToCreate = await checkPermission(userId, "CENTER_ADMIN", { centerId: targetId });
    }
    if (!hasPermissionToCreate && originatorCenterId) { // If originating from a center, check if user is admin of that center
        hasPermissionToCreate = await checkPermission(userId, "CENTER_ADMIN", { centerId: originatorCenterId });
    }
    // Add more checks if non-admins can trigger certain types of notifications (e.g. system notifications)

    if (!hasPermissionToCreate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to create this notification" }, { status: 403 });
    }
    
    const newNotification = await createNotificationService({ ...body, createdBy: userId });
    return NextResponse.json(newNotification, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create notification:", error);
    if (error.name === "ValidationError") {
        return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create notification", error: error.message }, { status: 500 });
  }
}

/**
 * Handles GET requests to retrieve Notifications for the logged-in user.
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

    // Fetch user and their associated member profile to determine scopes
    const user = await User.findById(userId).lean();
    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    // Attempt to find a member profile linked to this user's email or a direct link if established
    // This part is crucial and depends on how User is linked to Member (e.g., via email or a direct memberId field on User)
    // For this example, let's assume a hypothetical direct link or we search by email.
    // A more robust system would have a direct `memberProfileId` on the `User` model after first login/setup.
    let memberProfile = await Member.findOne({ email: user.email }).select("_id centerId clusterId smallGroupId").lean();
    // If no member profile by email, the user might be an admin without a member profile, or profile uses different email.
    // This logic needs to be robust based on application design.

    const userRolesAndScopes = {
        isHQAdmin: user.assignedRoles.some(r => r.role === "HQ_ADMIN"),
        adminCenterIds: user.assignedRoles.filter(r => r.role === "CENTER_ADMIN" && r.centerId).map(r => r.centerId!),
        leaderClusterIds: user.assignedRoles.filter(r => r.role === "CLUSTER_LEADER" && r.clusterId).map(r => r.clusterId!),
        leaderSmallGroupIds: user.assignedRoles.filter(r => r.role === "SMALL_GROUP_LEADER" && r.smallGroupId).map(r => r.smallGroupId!),
        memberOfCenterId: memberProfile?.centerId,
        memberOfClusterId: memberProfile?.clusterId,
        memberOfSmallGroupId: memberProfile?.smallGroupId,
    };

    filters.userIdForScope = userId;
    if (memberProfile) {
        filters.memberIdForScope = memberProfile._id;
    }

    const result = await getAllNotificationsForUserService(filters, userRolesAndScopes);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve notifications:", error);
    return NextResponse.json({ message: "Failed to retrieve notifications", error: error.message }, { status: 500 });
  }
}


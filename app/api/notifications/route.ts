// app/api/notifications/route.ts
import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // Assuming authOptions is correctly defined for getServerSession
import {
  createNotificationService,
  getAllNotificationsForUserService,
  INotificationCreationPayload,
  INotificationFilters,
  IUserRolesAndScopesForNotifications
} from "@/services/notificationService";
import connectToDB from "@/lib/mongodb"; // Corrected import
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import UserModel, { IUser } from "@/models/user"; 
import MemberModel, { IMember } from "@/models/member"; 
import { Session } from "next-auth"; // Import Session type

// Extend NextAuth Session to include id on user object if not already there by default
interface CustomSession extends Session {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    assignedRoles?: any[]; // Add this if you use it from session
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json() as Partial<INotificationCreationPayload>; // Use partial as some fields are auto-filled
    const { targetLevel, targetId, originatorCenterId } = body;

    if (!targetLevel) {
      return NextResponse.json({ message: "Notification targetLevel is required" }, { status: 400 });
    }

    await connectToDB();
    let hasPermissionToCreate = false;

    // HQ_ADMIN can send any notification.
    if (session.user.assignedRoles?.some(role => role.role === "HQ_ADMIN")) {
        hasPermissionToCreate = true;
    }
    
    // CENTER_ADMIN can send notifications to their center or if originating from their center.
    if (!hasPermissionToCreate && targetLevel === "CENTER" && targetId) {
        const targetCenterId = new mongoose.Types.ObjectId(targetId.toString());
        hasPermissionToCreate = session.user.assignedRoles?.some(role => 
            role.role === "CENTER_ADMIN" && role.scopeId === targetCenterId.toString()
        ) || false;
    }
    if (!hasPermissionToCreate && originatorCenterId) {
        const originCenterObjId = new mongoose.Types.ObjectId(originatorCenterId.toString());
         hasPermissionToCreate = session.user.assignedRoles?.some(role => 
            role.role === "CENTER_ADMIN" && role.scopeId === originCenterObjId.toString()
        ) || false;
    }

    if (!hasPermissionToCreate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to create this notification" }, { status: 403 });
    }
    
    const notificationPayload: INotificationCreationPayload = {
        ...body,
        message: body.message || "Default message", // Ensure message is provided
        type: body.type || "INFO", // Ensure type is provided
        targetLevel: targetLevel, // Already checked
        createdBy: currentUserId,
        // originatorCenterId, targetId, etc. are from body
    };

    const newNotification = await createNotificationService(notificationPayload);
    return NextResponse.json(newNotification, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create notification:", error);
    if (error.name === "ValidationError" || error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create notification", error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as CustomSession | null;
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = new mongoose.Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    
    const filters: Partial<INotificationFilters> = {}; // Use partial for filters
    searchParams.forEach((value, key) => {
        if (key === "page" || key === "limit") {
            (filters as any)[key] = parseInt(value, 10);
        } else if (key === "isRead") {
            filters.isRead = value === "true";
        } else {
            (filters as any)[key] = value;
        }
    });

    await connectToDB();

    const dbUser = await UserModel.findById(currentUserId).lean<IUser>();
    if (!dbUser) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    let memberProfile = await MemberModel.findOne({ email: dbUser.email })
                            .select("_id centerId clusterId smallGroupId")
                            .lean<Pick<IMember, "_id" | "centerId" | "clusterId" | "smallGroupId">>();

    const userRolesAndScopes: IUserRolesAndScopesForNotifications = {
        isHQAdmin: dbUser.assignedRoles.some(r => r.role === "HQ_ADMIN"),
        adminCenterIds: dbUser.assignedRoles.filter(r => r.role === "CENTER_ADMIN" && r.scopeId).map(r => new mongoose.Types.ObjectId(r.scopeId!)),
        leaderClusterIds: dbUser.assignedRoles.filter(r => r.role === "CLUSTER_LEADER" && r.scopeId).map(r => new mongoose.Types.ObjectId(r.scopeId!)),
        leaderSmallGroupIds: dbUser.assignedRoles.filter(r => r.role === "SMALL_GROUP_LEADER" && r.scopeId).map(r => new mongoose.Types.ObjectId(r.scopeId!)),
        memberOfCenterId: memberProfile?.centerId ? new mongoose.Types.ObjectId(memberProfile.centerId.toString()) : undefined,
        memberOfClusterId: memberProfile?.clusterId ? new mongoose.Types.ObjectId(memberProfile.clusterId.toString()) : undefined,
        memberOfSmallGroupId: memberProfile?.smallGroupId ? new mongoose.Types.ObjectId(memberProfile.smallGroupId.toString()) : undefined,
    };

    const finalFilters: INotificationFilters = {
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 10,
        userIdForScope: currentUserId,
        memberIdForScope: memberProfile?._id ? new mongoose.Types.ObjectId(memberProfile._id.toString()) : undefined,
    };

    const result = await getAllNotificationsForUserService(finalFilters, userRolesAndScopes);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve notifications:", error);
    return NextResponse.json({ message: "Failed to retrieve notifications", error: error.message }, { status: 500 });
  }
}


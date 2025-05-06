// app/api/notifications/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth"; // Changed to use auth()
import {
  notificationService // Assuming notificationService is an object with methods like createNotification and getAllNotificationsForUser
} from "@/services/notificationService";
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import mongoose from "mongoose";
import UserModel, { IUser } from "@/models/user"; 
import MemberModel, { IMember } from "@/models/member"; 
import { Session } from "next-auth"; 

interface CustomSession extends Session {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    assignedRoles?: any[]; 
    permissions?: any[]; // Added permissions based on previous patterns
    memberId?: string | null; // Added memberId based on previous patterns
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth() as CustomSession | null;
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json() as Partial<Parameters<typeof notificationService.createNotification>[0]>; 
    const { targetLevel, targetId, originatorCenterId } = body;

    if (!targetLevel) {
      return NextResponse.json({ message: "Notification targetLevel is required" }, { status: 400 });
    }

    await connectToDB();
    let hasPermissionToCreate = false;

    if (session.user.assignedRoles?.some(role => role.role === "HQ_ADMIN")) {
        hasPermissionToCreate = true;
    }
    
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
    
    const notificationPayload: Parameters<typeof notificationService.createNotification>[0] = {
        ...(body as any), // Cast to any to satisfy the spread, ensure all required fields are present
        message: body.message || "Default message", 
        type: body.type || "INFO", 
        targetLevel: targetLevel, 
        createdBy: currentUserId,
    };

    const newNotification = await notificationService.createNotification(notificationPayload);
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
    const session = await auth() as CustomSession | null;
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = new mongoose.Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    
    const filters: Partial<Parameters<typeof notificationService.getAllNotificationsForUser>[0]> = {}; 
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

    const userRolesAndScopes: Parameters<typeof notificationService.getAllNotificationsForUser>[1] = {
        isHQAdmin: dbUser.assignedRoles.some(r => r.role === "HQ_ADMIN"),
        adminCenterIds: dbUser.assignedRoles.filter(r => r.role === "CENTER_ADMIN" && r.scopeId).map(r => new mongoose.Types.ObjectId(r.scopeId!)),
        leaderClusterIds: dbUser.assignedRoles.filter(r => r.role === "CLUSTER_LEADER" && r.scopeId).map(r => new mongoose.Types.ObjectId(r.scopeId!)),
        leaderSmallGroupIds: dbUser.assignedRoles.filter(r => r.role === "SMALL_GROUP_LEADER" && r.scopeId).map(r => new mongoose.Types.ObjectId(r.scopeId!)),
        memberOfCenterId: memberProfile?.centerId ? new mongoose.Types.ObjectId(memberProfile.centerId.toString()) : undefined,
        memberOfClusterId: memberProfile?.clusterId ? new mongoose.Types.ObjectId(memberProfile.clusterId.toString()) : undefined,
        memberOfSmallGroupId: memberProfile?.smallGroupId ? new mongoose.Types.ObjectId(memberProfile.smallGroupId.toString()) : undefined,
    };

    const finalFilters: Parameters<typeof notificationService.getAllNotificationsForUser>[0] = {
        ...(filters as any),
        page: filters.page || 1,
        limit: filters.limit || 10,
        userIdForScope: currentUserId,
        memberIdForScope: memberProfile?._id ? new mongoose.Types.ObjectId(memberProfile._id.toString()) : undefined,
    };

    const result = await notificationService.getAllNotificationsForUser(finalFilters, userRolesAndScopes);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve notifications:", error);
    return NextResponse.json({ message: "Failed to retrieve notifications", error: error.message }, { status: 500 });
  }
}


// app/api/notifications/route.ts
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { notificationService } from "@/services/notificationService";
import { connectToDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import UserModel, { IUser } from "@/models/user";
import MemberModel, { IMember } from "@/models/member";
import { Session } from "next-auth";

// Define types matching your service layer contracts
interface AssignedRole {
  role: string;
  scopeId?: string;
  parentScopeId?: string;
}

interface Permission {
  name: string;
}

interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    assignedRoles?: AssignedRole[];
    permissions?: Permission[];
    memberId?: string | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth() as CustomSession | null;
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { targetLevel, targetId, originatorCenterId } = body;

    if (!targetLevel) {
      return NextResponse.json(
        { message: "Notification targetLevel is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Check permissions
    const isHQAdmin = session.user.assignedRoles?.some(
      (role) => role.role === "HQ_ADMIN"
    );
    let hasPermissionToCreate = isHQAdmin;

    if (!hasPermissionToCreate && targetLevel === "CENTER" && targetId) {
      const targetCenterId = new mongoose.Types.ObjectId(targetId.toString());
      hasPermissionToCreate = session.user.assignedRoles?.some(
        (role) =>
          role.role === "CENTER_ADMIN" &&
          role.scopeId === targetCenterId.toString()
      ) ?? false;
    }

    if (!hasPermissionToCreate && originatorCenterId) {
      const originCenterObjId = new mongoose.Types.ObjectId(
        originatorCenterId.toString()
      );
      hasPermissionToCreate = session.user.assignedRoles?.some(
        (role) =>
          role.role === "CENTER_ADMIN" &&
          role.scopeId === originCenterObjId.toString()
      ) ?? false;
    }

    if (!hasPermissionToCreate) {
      return NextResponse.json(
        { message: "Forbidden: Insufficient permissions" },
        { status: 403 }
      );
    }

    // Prepare notification payload
    const notificationPayload = {
      ...body,
      type: body.type || "INFO",
      content: body.content || "Default message",
      targetLevel,
      createdBy: currentUserId,
    };

    // Remove any undefined fields
    // Remove any undefined fields
const finalPayload = Object.fromEntries(
  Object.entries(notificationPayload).filter(
    ([, value]) => value !== undefined  // Fixed destructuring
  )
);

    const newNotification = await notificationService.addNotification(
      finalPayload
    );
    return NextResponse.json(newNotification, { status: 201 });
  } catch (error) {
    console.error("Failed to create notification:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { message: "Validation Error", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to create notification" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth() as CustomSession | null;
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUserId = new mongoose.Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);

    // Initialize filters with proper types
    const filters: {
      isRead?: boolean;
      page?: number;
      limit?: number;
      status?: string;
      [key: string]: string | number | boolean | undefined;
    } = {};

    // Process search parameters
    searchParams.forEach((value, key) => {
      if (key === "page" || key === "limit") {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          filters[key] = numValue;
        }
      } else if (key === "isRead") {
        filters.isRead = value === "true";
      } else {
        filters[key] = value;
      }
    });

    await connectToDB();

    // Get user data
    const dbUser = await UserModel.findById(currentUserId).lean<IUser>();
    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const memberProfile = await MemberModel.findOne({ email: dbUser.email })
      .select("_id centerId clusterId smallGroupId")
      .lean<Pick<IMember, "_id" | "centerId" | "clusterId" | "smallGroupId">>();

    // Prepare roles and scopes
    const userRolesAndScopes = {
      isHQAdmin: dbUser.assignedRoles?.some((r) => r.role === "HQ_ADMIN") ?? false,
      adminCenterIds: dbUser.assignedRoles
        ?.filter((r) => r.role === "CENTER_ADMIN" && r.scopeId)
        .map((r) => new mongoose.Types.ObjectId(r.scopeId!)),
      leaderClusterIds: dbUser.assignedRoles
        ?.filter((r) => r.role === "CLUSTER_LEADER" && r.scopeId)
        .map((r) => new mongoose.Types.ObjectId(r.scopeId!)),
      leaderSmallGroupIds: dbUser.assignedRoles
        ?.filter((r) => r.role === "SMALL_GROUP_LEADER" && r.scopeId)
        .map((r) => new mongoose.Types.ObjectId(r.scopeId!)),
      memberOfCenterId: memberProfile?.centerId
        ? new mongoose.Types.ObjectId(memberProfile.centerId.toString())
        : undefined,
      memberOfClusterId: memberProfile?.clusterId
        ? new mongoose.Types.ObjectId(memberProfile.clusterId.toString())
        : undefined,
      memberOfSmallGroupId: memberProfile?.smallGroupId
        ? new mongoose.Types.ObjectId(memberProfile.smallGroupId.toString())
        : undefined,
    };

    // Prepare final filters
    const finalFilters = {
      isRead: filters.isRead,
      status: filters.status as string | undefined,
      page: (filters.page as number) ?? 1,
      limit: (filters.limit as number) ?? 10,
      userIdForScope: currentUserId,
      memberIdForScope: memberProfile?._id
        ? new mongoose.Types.ObjectId(memberProfile._id.toString())
        : undefined,
    };

    const result = await notificationService.getAllNotificationsForUser(
      finalFilters,
      userRolesAndScopes
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Failed to retrieve notifications:", error);
    return NextResponse.json(
      { message: "Failed to retrieve notifications" },
      { status: 500 }
    );
  }
}
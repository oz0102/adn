// // app/api/notifications/route.ts
// import { NextResponse, NextRequest } from "next/server";
// import { auth } from "@/auth"; // Changed to use auth()
// import {
//   notificationService // Assuming notificationService is an object with methods like createNotification and getAllNotificationsForUser
// } from "@/services/notificationService";
// import { connectToDB } from "@/lib/mongodb"; // Ensured named import
// import mongoose from "mongoose";
// import UserModel, { IUser } from "@/models/user"; 
// import MemberModel, { IMember } from "@/models/member"; 
// import { Session } from "next-auth"; 

// // Define a more specific type for roles if possible
// interface AssignedRole {
//   role: string;
//   scopeId?: string;
//   parentScopeId?: string; // Added parentScopeId
//   // Index signature removed
// }

// interface Permission { // Placeholder for permission structure
//   name: string;
//   // Index signature removed
// }

// interface CustomSession extends Session {
//   user?: {
//     id?: string | null;
//     name?: string | null;
//     email?: string | null;
//     image?: string | null;
//     assignedRoles?: AssignedRole[]; 
//     permissions?: Permission[]; 
//     memberId?: string | null; 
//   };
// }

// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth() as CustomSession | null;
//     if (!session || !session.user || !session.user.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const currentUserId = new mongoose.Types.ObjectId(session.user.id);
//     const body = await request.json() as Partial<Parameters<typeof notificationService.createNotification>[0]>; 
//     const { targetLevel, targetId, originatorCenterId } = body;

//     if (!targetLevel) {
//       return NextResponse.json({ message: "Notification targetLevel is required" }, { status: 400 });
//     }

//     await connectToDB();
//     let hasPermissionToCreate = false;

//     if (session.user.assignedRoles?.some(role => role.role === "HQ_ADMIN")) {
//         hasPermissionToCreate = true;
//     }
    
//     if (!hasPermissionToCreate && targetLevel === "CENTER" && targetId) {
//         const targetCenterId = new mongoose.Types.ObjectId(targetId.toString());
//         hasPermissionToCreate = session.user.assignedRoles?.some(role => 
//             role.role === "CENTER_ADMIN" && role.scopeId === targetCenterId.toString()
//         ) || false;
//     }
//     if (!hasPermissionToCreate && originatorCenterId) {
//         const originCenterObjId = new mongoose.Types.ObjectId(originatorCenterId.toString());
//          hasPermissionToCreate = session.user.assignedRoles?.some(role => 
//             role.role === "CENTER_ADMIN" && role.scopeId === originCenterObjId.toString()
//         ) || false;
//     }

//     if (!hasPermissionToCreate) {
//       return NextResponse.json({ message: "Forbidden: Insufficient permissions to create this notification" }, { status: 403 });
//     }
    
//     // Ensure body is treated as Partial for safety when spreading
//     const partialBody = body as Partial<Parameters<typeof notificationService.createNotification>[0]>;

//     const notificationPayload: Parameters<typeof notificationService.createNotification>[0] = {
//         ...partialBody,
//         // Ensure all required fields for INotificationCreationPayload are explicitly set
//         // Required fields from INotificationCreationPayload: type, content, targetLevel, createdBy
//         // 'message' is used for 'content' if body.content is not set
//         // 'type' is from body.type or defaults
//         // 'targetLevel' is from body.targetLevel (already checked not null)
//         // 'createdBy' is currentUserId
//         // Assuming 'title' is optional or handled by 'subject' in body
//         // 'recipient' and other optional fields come from 'body' if present
//         type: partialBody.type || "INFO", // Default if not in body
//         content: partialBody.content || partialBody.message || "Default message", // Use content or message
//         targetLevel: targetLevel!, // Already checked for null
//         createdBy: currentUserId,
//         // Optional fields that might be in body:
//         subject: partialBody.subject,
//         recipient: partialBody.recipient,
//         targetId: partialBody.targetId,
//         originatorCenterId: partialBody.originatorCenterId,
//         relatedTo: partialBody.relatedTo,
//         // message from partialBody might be spread here if INotificationCreationPayload allows it
//     };

//     let finalPayload = { ...notificationPayload }; // Use a mutable copy

//     // If content was derived from partialBody.message, and partialBody.content also existed (and was different),
//     // then 'message' might be an unintentional artifact on finalPayload if it was spread from partialBody.
//     // The condition provided in the subtask aims to remove 'message' in such specific scenarios.
//     if (finalPayload.content === partialBody.message && partialBody.content && partialBody.message) {
//         // This implies 'message' might be on finalPayload due to the initial spread of partialBody.
//         // We want to remove it.
//         const { message, ...rest } = finalPayload as typeof finalPayload & { message?: any }; // Cast to allow destructuring of potentially existing message
//         finalPayload = rest;
//     }
//     // Ensure 'message' is not part of the payload if it's not a valid field in the service's expected type,
//     // independent of the condition above. The most robust way for this is if the service expects a type
//     // that explicitly does or does not include 'message'. Assuming it does not include 'message':
//     else if ('message' in finalPayload) { // If 'message' still exists and the above condition didn't catch it
//         const { message, ...rest } = finalPayload as typeof finalPayload & { message?: any };
//         finalPayload = rest;
//     }


//     const newNotification = await notificationService.createNotification(finalPayload);
//     return NextResponse.json(newNotification, { status: 201 });
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     console.error("Failed to create notification:", error);
//     if (error instanceof mongoose.Error.ValidationError) { // Check specific error type
//         return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
//     }
//     return NextResponse.json({ message: "Failed to create notification", error: errorMessage }, { status: 500 });
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const session = await auth() as CustomSession | null;
//     if (!session || !session.user || !session.user.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const currentUserId = new mongoose.Types.ObjectId(session.user.id);
//     const { searchParams } = new URL(request.url);
    
//     // Define filters with a more specific index signature for searchParams
//     const filters: {
//         isRead?: boolean;
//         page?: number;
//         limit?: number;
//         status?: string; // Assuming status might be a string from query params
//         // Index signature for any other dynamic string parameters from query string
//         [key: string]: string | undefined; // Changed index signature
//     } = {};

//     searchParams.forEach((value, key) => {
//         if (key === "page" || key === "limit") {
//             const numValue = parseInt(value, 10);
//             if (!isNaN(numValue)) {
//                  filters[key as 'page' | 'limit'] = numValue;
//             }
//         } else if (key === "isRead") {
//             filters.isRead = value === "true";
//         } else if (key === "status") { // Example for specific string filter
//             filters.status = value;
//         } else {
//             // For other unknown keys, they are assigned as strings.
//             filters[key] = value;
//         }
//     });

//     await connectToDB();

//     const dbUser = await UserModel.findById(currentUserId).lean<IUser>();
//     if (!dbUser) {
//         return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }
    
//     const memberProfile = await MemberModel.findOne({ email: dbUser.email })
//                             .select("_id centerId clusterId smallGroupId")
//                             .lean<Pick<IMember, "_id" | "centerId" | "clusterId" | "smallGroupId">>();

//     const userRolesAndScopes: Parameters<typeof notificationService.getAllNotificationsForUser>[1] = {
//         isHQAdmin: dbUser.assignedRoles.some(r => r.role === "HQ_ADMIN"),
//         adminCenterIds: dbUser.assignedRoles.filter(r => r.role === "CENTER_ADMIN" && r.scopeId).map(r => new mongoose.Types.ObjectId(r.scopeId!)),
//         leaderClusterIds: dbUser.assignedRoles.filter(r => r.role === "CLUSTER_LEADER" && r.scopeId).map(r => new mongoose.Types.ObjectId(r.scopeId!)),
//         leaderSmallGroupIds: dbUser.assignedRoles.filter(r => r.role === "SMALL_GROUP_LEADER" && r.scopeId).map(r => new mongoose.Types.ObjectId(r.scopeId!)),
//         memberOfCenterId: memberProfile?.centerId ? new mongoose.Types.ObjectId(memberProfile.centerId.toString()) : undefined,
//         memberOfClusterId: memberProfile?.clusterId ? new mongoose.Types.ObjectId(memberProfile.clusterId.toString()) : undefined,
//         memberOfSmallGroupId: memberProfile?.smallGroupId ? new mongoose.Types.ObjectId(memberProfile.smallGroupId.toString()) : undefined,
//     };
    
//     // Construct finalFilters ensuring type compatibility with INotificationFilters
//     // The `filters` object might have extra properties not defined in INotificationFilters.
//     // We select only the properties relevant to INotificationFilters or cast if confident.

//     const notificationServiceFilters: Partial<Parameters<typeof notificationService.getAllNotificationsForUser>[0]> = {};
//     if (filters.status !== undefined && typeof filters.status === 'string') {
//         // Assuming status is part of INotificationFilters and is a string enum
//         notificationServiceFilters.status = filters.status as Parameters<typeof notificationService.getAllNotificationsForUser>[0]['status'];
//     }
//     if (filters.isRead !== undefined) {
//         notificationServiceFilters.isRead = filters.isRead;
//     }
//     // page and limit are numbers
//     const pageNum = typeof filters.page === 'number' ? filters.page : (typeof filters.page === 'string' ? parseInt(filters.page,10) : 1);
//     const limitNum = typeof filters.limit === 'number' ? filters.limit : (typeof filters.limit === 'string' ? parseInt(filters.limit,10) : 10);


//     const finalFilters: Parameters<typeof notificationService.getAllNotificationsForUser>[0] = {
//         ...notificationServiceFilters, // Spread known and typed properties
//         page: pageNum || 1,
//         limit: limitNum || 10,
//         userIdForScope: currentUserId, // This is from notificationService
//         memberIdForScope: memberProfile?._id ? new mongoose.Types.ObjectId(memberProfile._id.toString()) : undefined, // This is from notificationService
//     };
    

//     const result = await notificationService.getAllNotificationsForUser(finalFilters, userRolesAndScopes);
//     return NextResponse.json(result, { status: 200 });
//   } catch (error: unknown) {
//     const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
//     console.error("Failed to retrieve notifications:", error);
//     return NextResponse.json({ message: "Failed to retrieve notifications", error: errorMessage }, { status: 500 });
//   }
// }



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
    const finalPayload = Object.fromEntries(
      Object.entries(notificationPayload).filter(
        ([_, value]) => value !== undefined
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
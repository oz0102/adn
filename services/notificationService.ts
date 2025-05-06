// services/notificationService.ts
import Notification, { INotification } from "@/models/notification";
import Member from "@/models/member"; // To validate recipient memberId or targetId if it's a member
import Center from "@/models/center"; // To validate originatorCenterId or targetId if it's a center
import { connectToDB } from "@/lib/mongodb";
import mongoose from "mongoose";

interface CreateNotificationData extends Omit<Partial<INotification>, "status" | "sentAt" | "createdBy"> {
  type: "Email" | "SMS" | "WhatsApp";
  subject: string;
  content: string;
  targetLevel: "HQ" | "CENTER" | "CLUSTER" | "SMALL_GROUP" | "MEMBER";
  // recipient is optional if targetLevel is not MEMBER and targetId is specified for a group
  recipient?: {
    memberId?: string | mongoose.Types.ObjectId;
    email?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
  };
  targetId?: string | mongoose.Types.ObjectId; // ID of Center, Cluster, SmallGroup, or Member
  originatorCenterId?: string | mongoose.Types.ObjectId; // Center from which notification originates, if applicable
  relatedTo?: {
    type: string;
    id: mongoose.Types.ObjectId;
  };
  // createdBy will be added by the system/API route
}

/**
 * Creates a new Notification.
 * Permission checks handled in API routes.
 * @param data - Data for the new notification.
 * @returns The created notification document.
 */
export const createNotificationService = async (data: CreateNotificationData & { createdBy: mongoose.Types.ObjectId }): Promise<INotification> => {
  await connectToDB();

  // Validation based on targetLevel
  if (data.targetLevel === "MEMBER" && !data.targetId && (!data.recipient || !data.recipient.memberId)) {
    throw new Error("For MEMBER level notifications, targetId (member's ID) or recipient.memberId is required.");
  }
  if (data.targetLevel !== "HQ" && data.targetLevel !== "MEMBER" && !data.targetId) {
    throw new Error(`Target ID is required for ${data.targetLevel} level notifications.`);
  }
  if (data.targetLevel === "CENTER" && data.targetId) {
    const centerExists = await Center.findById(data.targetId);
    if (!centerExists) throw new Error("Target Center not found.");
  }
  // Add similar checks for CLUSTER, SMALL_GROUP targetIds if necessary
  if (data.recipient && data.recipient.memberId) {
    const memberExists = await Member.findById(data.recipient.memberId);
    if (!memberExists) throw new Error("Recipient Member not found.");
  }
  if (data.targetLevel === "MEMBER" && data.targetId) {
    const memberExists = await Member.findById(data.targetId);
    if (!memberExists) throw new Error("Target Member not found.");
    // Populate recipient details from member if not provided
    if (!data.recipient || (!data.recipient.email && !data.recipient.phoneNumber && !data.recipient.whatsappNumber)) {
        data.recipient = {
            memberId: memberExists._id,
            email: memberExists.email,
            phoneNumber: memberExists.phoneNumber,
            whatsappNumber: memberExists.whatsappNumber
        };
    }
  }
  if (data.originatorCenterId) {
    const centerExists = await Center.findById(data.originatorCenterId);
    if (!centerExists) throw new Error("Originator Center not found.");
  }

  const newNotification = new Notification(data);
  await newNotification.save();
  return newNotification.populate([
      { path: "recipient.memberId", select: "firstName lastName email" },
      // Populate targetId based on targetLevel might require dynamic refPath or separate queries
      { path: "originatorCenterId", select: "name" },
      { path: "createdBy", select: "email" }
  ]);
};

interface GetNotificationsFilters {
  userIdForScope?: string | mongoose.Types.ObjectId; // User whose notifications are being fetched
  memberIdForScope?: string | mongoose.Types.ObjectId; // Member profile ID for the user
  status?: "Pending" | "Sent" | "Failed";
  page?: number;
  limit?: number;
}

/**
 * Retrieves Notifications based on filters, scoped to the user.
 * This is a complex query. A user should see:
 * 1. Notifications directly targeting their memberId.
 * 2. Notifications targeting HQ.
 * 3. Notifications targeting a Center they belong to / administer.
 * 4. Notifications targeting a Cluster they belong to / lead.
 * 5. Notifications targeting a Small Group they belong to / lead.
 * Access control handled in API routes by ensuring userIdForScope is the logged-in user.
 * @param filters - Filtering options including the user/member ID for scoping.
 * @returns A list of notification documents and pagination info.
 */
export const getAllNotificationsForUserService = async (
    filters: GetNotificationsFilters,
    userRolesAndScopes?: { // This would come from resolving the user's session and roles
        isHQAdmin: boolean;
        adminCenterIds: mongoose.Types.ObjectId[];
        leaderClusterIds: mongoose.Types.ObjectId[];
        leaderSmallGroupIds: mongoose.Types.ObjectId[];
        memberOfCenterId?: mongoose.Types.ObjectId;
        memberOfClusterId?: mongoose.Types.ObjectId;
        memberOfSmallGroupId?: mongoose.Types.ObjectId;
    }
): Promise<{ notifications: INotification[], total: number, page: number, limit: number }> => {
  await connectToDB();
  const { userIdForScope, memberIdForScope, status, page = 1, limit = 20 } = filters;
  const queryConditions: any[] = [];

  // Direct notifications to the member
  if (memberIdForScope) {
    queryConditions.push({ "recipient.memberId": new mongoose.Types.ObjectId(memberIdForScope.toString()) });
    queryConditions.push({ targetLevel: "MEMBER", targetId: new mongoose.Types.ObjectId(memberIdForScope.toString()) });
  }

  // HQ level notifications (visible to all or based on role)
  queryConditions.push({ targetLevel: "HQ" });

  if (userRolesAndScopes) {
    if (userRolesAndScopes.isHQAdmin) {
        // HQ Admin can see all notifications if needed, or this service is always scoped to a user context
        // For a user-centric view, even HQ admin sees what's relevant to them as a user + HQ wide.
    }
    // Center level (member of, or admin of)
    if (userRolesAndScopes.memberOfCenterId) {
        queryConditions.push({ targetLevel: "CENTER", targetId: userRolesAndScopes.memberOfCenterId });
    }
    userRolesAndScopes.adminCenterIds.forEach(id => {
        queryConditions.push({ targetLevel: "CENTER", targetId: id });
    });

    // Cluster level (member of, or leader of)
    if (userRolesAndScopes.memberOfClusterId) {
        queryConditions.push({ targetLevel: "CLUSTER", targetId: userRolesAndScopes.memberOfClusterId });
    }
    userRolesAndScopes.leaderClusterIds.forEach(id => {
        queryConditions.push({ targetLevel: "CLUSTER", targetId: id });
    });
    
    // Small Group level (member of, or leader of)
    if (userRolesAndScopes.memberOfSmallGroupId) {
        queryConditions.push({ targetLevel: "SMALL_GROUP", targetId: userRolesAndScopes.memberOfSmallGroupId });
    }
    userRolesAndScopes.leaderSmallGroupIds.forEach(id => {
        queryConditions.push({ targetLevel: "SMALL_GROUP", targetId: id });
    });
  }
  
  const finalQuery: any = { $or: queryConditions };
  if (status) finalQuery.status = status;

  const total = await Notification.countDocuments(finalQuery);
  const notifications = await Notification.find(finalQuery)
    .populate([
        { path: "recipient.memberId", select: "firstName lastName email" },
        { path: "originatorCenterId", select: "name" },
        { path: "createdBy", select: "email" }
    ])
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return { notifications, total, page, limit };
};

/**
 * Retrieves a specific Notification by its ID.
 * Permission checks (user must be recipient or admin of scope) handled in API route.
 * @param id - The ID of the notification.
 * @returns The notification document or null if not found.
 */
export const getNotificationByIdService = async (id: string): Promise<INotification | null> => {
  await connectToDB();
  return Notification.findById(id).populate([
    { path: "recipient.memberId", select: "firstName lastName email" },
    { path: "originatorCenterId", select: "name" },
    { path: "createdBy", select: "email" }
  ]).lean();
};

/**
 * Updates the status of a Notification (e.g., to Sent, Failed, Read).
 * @param id - The ID of the notification to update.
 * @param statusUpdate - Object containing new status and optionally sentAt.
 * @returns The updated notification document or null if not found.
 */
export const updateNotificationStatusService = async (id: string, statusUpdate: { status: string, sentAt?: Date, readAt?: Date }): Promise<INotification | null> => {
  await connectToDB();
  return Notification.findByIdAndUpdate(id, { $set: statusUpdate }, { new: true }).lean();
};

/**
 * Deletes a Notification (typically an admin action).
 * @param id - The ID of the notification to delete.
 * @returns The deleted notification document or null if not found.
 */
export const deleteNotificationService = async (id: string): Promise<INotification | null> => {
  await connectToDB();
  return Notification.findByIdAndDelete(id).lean();
};


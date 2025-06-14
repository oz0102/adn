// services/notificationService.ts
import Notification, { INotification, NotificationType, NotificationLevel, NotificationStatus } from "@/models/notification";
import MemberModel, { IMember } from "@/models/member";
import CenterModel, { ICenter } from "@/models/center";
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import mongoose, { Types, FilterQuery } from "mongoose";

// Interface for the data needed to create a notification
export interface INotificationCreationPayload {
  type: NotificationType;
  subject?: string; 
  content: string;
  targetLevel: NotificationLevel;
  recipient?: {
    memberId?: Types.ObjectId | string;
    email?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
  };
  targetId?: Types.ObjectId | string; 
  originatorCenterId?: Types.ObjectId | string;
  relatedTo?: {
    type: string;
    id: Types.ObjectId | string;
  };
  createdBy: Types.ObjectId | string;
}

export interface INotificationFilters {
  userIdForScope?: Types.ObjectId | string;
  memberIdForScope?: Types.ObjectId | string;
  status?: NotificationStatus;
  isRead?: boolean; 
  page?: number;
  limit?: number;
}

export interface IUserRolesAndScopesForNotifications {
  isGlobalAdmin: boolean;
  adminCenterIds: Types.ObjectId[];
  leaderClusterIds: Types.ObjectId[];
  leaderSmallGroupIds: Types.ObjectId[];
  memberOfCenterId?: Types.ObjectId;
  memberOfClusterId?: Types.ObjectId;
  memberOfSmallGroupId?: Types.ObjectId;
}

export type PopulatedLeanNotification = Omit<INotification, "recipient.memberId" | "originatorCenterId" | "createdBy" | "targetId" | "versions" | "$isDefault"> & {
  _id: Types.ObjectId;
  recipient?: {
    memberId?: (Pick<IMember, "_id" | "firstName" | "lastName" | "email"> & { _id: Types.ObjectId }) | null;
    email?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
  };
  originatorCenterId?: (Pick<ICenter, "_id" | "name"> & { _id: Types.ObjectId }) | null;
  createdBy?: ({ _id: Types.ObjectId; email?: string; }) | null; 
  targetId?: Types.ObjectId | string; 
};

const addNotification = async (data: INotificationCreationPayload): Promise<INotification> => {
  await connectToDB();

  if (data.targetLevel === NotificationLevel.MEMBER && !data.targetId && (!data.recipient || !data.recipient.memberId)) {
    throw new Error("For MEMBER level notifications, targetId (member's ID) or recipient.memberId is required.");
  }
  if (data.targetLevel !== NotificationLevel.GLOBAL && data.targetLevel !== NotificationLevel.MEMBER && !data.targetId) {
    throw new Error("Target ID is required for non-GLOBAL/non-Member notifications.");
  }

  if (data.targetLevel === NotificationLevel.CENTER && data.targetId) {
    const centerExists = await CenterModel.findById(data.targetId).lean<ICenter | null>();
    if (!centerExists) throw new Error("Target Center not found.");
  }

  if (data.recipient?.memberId) {
    const memberExists = await MemberModel.findById(data.recipient.memberId).lean<IMember | null>();
    if (!memberExists) throw new Error("Recipient Member not found.");
  }

  if (data.targetLevel === NotificationLevel.MEMBER && data.targetId) {
    const memberExists = await MemberModel.findById(data.targetId).lean<IMember | null>();
    if (!memberExists) throw new Error("Target Member not found.");
    
    let memberIdForRecipient: Types.ObjectId | string | undefined = undefined;
    if (memberExists) {
        memberIdForRecipient = memberExists._id as Types.ObjectId | string; 
    }

    if (!data.recipient || (!data.recipient.email && !data.recipient.phoneNumber && !data.recipient.whatsappNumber)) {
      data.recipient = {
        ...data.recipient,
        memberId: memberIdForRecipient, 
        email: memberExists.email,
        phoneNumber: memberExists.phoneNumber,
      };
    }
  }

  if (data.originatorCenterId) {
    const centerExists = await CenterModel.findById(data.originatorCenterId).lean<ICenter | null>();
    if (!centerExists) throw new Error("Originator Center not found.");
  }

  const newNotification = new Notification(data);
  await newNotification.save();
  return newNotification; 
};

const getAllNotificationsForUser = async (
    filters: INotificationFilters,
    userRolesAndScopes: IUserRolesAndScopesForNotifications
): Promise<{ notifications: PopulatedLeanNotification[], total: number, page: number, limit: number }> => {
  await connectToDB();
  const { userIdForScope, memberIdForScope, status, page = 1, limit = 20, isRead } = filters;
  const queryOrConditions: FilterQuery<INotification>[] = [];

  if (memberIdForScope) {
    const memberObjId = new Types.ObjectId(memberIdForScope.toString());
    queryOrConditions.push({ "recipient.memberId": memberObjId });
    queryOrConditions.push({ targetLevel: NotificationLevel.MEMBER, targetId: memberObjId });
  }

  queryOrConditions.push({ targetLevel: NotificationLevel.GLOBAL });

  if (userRolesAndScopes.memberOfCenterId) {
    queryOrConditions.push({ targetLevel: NotificationLevel.CENTER, targetId: userRolesAndScopes.memberOfCenterId });
  }
  userRolesAndScopes.adminCenterIds.forEach(id => {
    queryOrConditions.push({ targetLevel: NotificationLevel.CENTER, targetId: id });
  });

  if (userRolesAndScopes.memberOfClusterId) {
    queryOrConditions.push({ targetLevel: NotificationLevel.CLUSTER, targetId: userRolesAndScopes.memberOfClusterId });
  }
  userRolesAndScopes.leaderClusterIds.forEach(id => {
    queryOrConditions.push({ targetLevel: NotificationLevel.CLUSTER, targetId: id });
  });
    
  if (userRolesAndScopes.memberOfSmallGroupId) {
    queryOrConditions.push({ targetLevel: NotificationLevel.SMALL_GROUP, targetId: userRolesAndScopes.memberOfSmallGroupId });
  }
  userRolesAndScopes.leaderSmallGroupIds.forEach(id => {
    queryOrConditions.push({ targetLevel: NotificationLevel.SMALL_GROUP, targetId: id });
  });
  
  const finalQuery: FilterQuery<INotification> = { $or: queryOrConditions };
  if (status) finalQuery.status = status;
  if (typeof isRead === "boolean") finalQuery.isRead = isRead;

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
    .lean<PopulatedLeanNotification[]>();

  return { notifications, total, page, limit };
};

const getNotificationById = async (id: string): Promise<PopulatedLeanNotification | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  return Notification.findById(id).populate([
    { path: "recipient.memberId", select: "firstName lastName email" },
    { path: "originatorCenterId", select: "name" },
    { path: "createdBy", select: "email" }
  ]).lean<PopulatedLeanNotification | null>();
};

const updateNotificationStatus = async (
    id: string, 
    statusUpdate: { status: NotificationStatus, sentAt?: Date, readAt?: Date, failedReason?: string }
): Promise<PopulatedLeanNotification | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  return Notification.findByIdAndUpdate(id, { $set: statusUpdate }, { new: true })
                    .lean<PopulatedLeanNotification | null>();
};

const markNotificationAsRead = async (id: string, userId: string): Promise<PopulatedLeanNotification | null> => {
    await connectToDB();
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
    return Notification.findByIdAndUpdate(id, { $set: { isRead: true, readAt: new Date() } }, { new: true })
                      .lean<PopulatedLeanNotification | null>();
};

const deleteNotification = async (id: string): Promise<PopulatedLeanNotification | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  return Notification.findByIdAndDelete(id).lean<PopulatedLeanNotification | null>();
};

export const notificationService = {
    addNotification, // Renamed createNotificationService to addNotification
    getAllNotificationsForUser,
    getNotificationById,
    updateNotificationStatus,
    markNotificationAsRead,
    deleteNotification
};

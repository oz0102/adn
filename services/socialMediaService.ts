// services/socialMediaService.ts
import SocialMediaAccountModel, { ISocialMediaAccount, SocialMediaPlatform, IFollowerHistoryEntry } from "@/models/socialMediaAccount";
import CenterModel, { ICenter } from "@/models/center";
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import mongoose, { Types, FilterQuery } from "mongoose"; 
import UserModel, { IUser } from "@/models/user";

export interface ICreateSocialMediaAccountPayload {
  platform: SocialMediaPlatform;
  username: string;
  link: string;
  scope: "HQ" | "CENTER";
  centerId?: Types.ObjectId | string;
  notes?: string;
  createdBy: Types.ObjectId | string;
}

export interface IUpdateSocialMediaAccountPayload {
  platform?: SocialMediaPlatform;
  username?: string;
  link?: string;
  notes?: string;
}

export interface IGetSocialMediaAccountsFilters {
  scope?: "HQ" | "CENTER";
  centerId?: Types.ObjectId | string;
  platform?: SocialMediaPlatform;
  page?: number;
  limit?: number;
}

export type PopulatedLeanSocialMediaAccount = Omit<ISocialMediaAccount, "centerId" | "createdBy" | "followerHistory" | "versions" | "$isDefault"> & {
  _id: Types.ObjectId;
  centerId?: (Pick<ICenter, "_id" | "name"> & { _id: Types.ObjectId }) | null;
  createdBy?: (Pick<IUser, "_id" | "email"> & { _id: Types.ObjectId }) | null;
  followerHistory: IFollowerHistoryEntry[];
};

const createSocialMediaAccount = async (data: ICreateSocialMediaAccountPayload): Promise<ISocialMediaAccount> => {
  await connectToDB();
  if (data.scope === "CENTER" && !data.centerId) {
    throw new Error("Center ID is required for CENTER-scoped social media accounts.");
  }
  if (data.scope === "CENTER" && data.centerId) {
    const centerExists = await CenterModel.findById(data.centerId).lean<ICenter>();
    if (!centerExists) {
      throw new Error("Invalid Center ID: Center does not exist.");
    }
  } else if (data.scope === "HQ") {
    data.centerId = undefined;
  }
  try {
    const newAccount = new SocialMediaAccountModel(data);
    await newAccount.save();
    return newAccount; 
  } catch (error: any) {
    if (error.code === 11000) {
        throw new Error(`A social media account with this platform and username already exists for the specified scope.`);
    }
    throw error;
  }
};

const getAllSocialMediaAccounts = async (filters: IGetSocialMediaAccountsFilters): Promise<PopulatedLeanSocialMediaAccount[]> => {
  await connectToDB();
  const query: FilterQuery<ISocialMediaAccount> = {};
  if (filters.scope) query.scope = filters.scope;
  if (filters.centerId) query.centerId = new Types.ObjectId(filters.centerId.toString());
  if (filters.platform) query.platform = filters.platform;
  if (filters.scope === "HQ") {
    query.centerId = { $exists: false };
  }
  const accounts = await SocialMediaAccountModel.find(query)
    .populate<{ centerId?: PopulatedLeanSocialMediaAccount["centerId"] }>({ path: "centerId", select: "name" })
    .populate<{ createdBy?: PopulatedLeanSocialMediaAccount["createdBy"] }>({ path: "createdBy", select: "email" })
    .lean<PopulatedLeanSocialMediaAccount[]>();
  return accounts;
};

const getSocialMediaAccountById = async (id: string): Promise<PopulatedLeanSocialMediaAccount | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  const account = await SocialMediaAccountModel.findById(id)
    .populate<{ centerId?: PopulatedLeanSocialMediaAccount["centerId"] }>({ path: "centerId", select: "name" })
    .populate<{ createdBy?: PopulatedLeanSocialMediaAccount["createdBy"] }>({ path: "createdBy", select: "email" })
    .lean<PopulatedLeanSocialMediaAccount | null>();
  return account;
};

const updateSocialMediaAccount = async (id: string, data: IUpdateSocialMediaAccountPayload): Promise<PopulatedLeanSocialMediaAccount | null> => {
  await connectToDB();
    if (!Types.ObjectId.isValid(id)) return null;
  try {
    const updatedAccount = await SocialMediaAccountModel.findByIdAndUpdate(id, data, { new: true })
      .populate<{ centerId?: PopulatedLeanSocialMediaAccount["centerId"] }>({ path: "centerId", select: "name" })
      .populate<{ createdBy?: PopulatedLeanSocialMediaAccount["createdBy"] }>({ path: "createdBy", select: "email" })
      .lean<PopulatedLeanSocialMediaAccount | null>();
    return updatedAccount;
  } catch (error: any) {
    if (error.code === 11000) {
        throw new Error(`Update failed: A social media account with this platform and username already exists for the specified scope.`);
    }
    throw error;
  }
};

const deleteSocialMediaAccount = async (id: string): Promise<PopulatedLeanSocialMediaAccount | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  const deletedAccount = await SocialMediaAccountModel.findByIdAndDelete(id)
                            .lean<PopulatedLeanSocialMediaAccount | null>();
  return deletedAccount;
};

const updateFollowerCount = async (accountId: string, newFollowerCount: number): Promise<ISocialMediaAccount | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(accountId)) return null;
  const account = await SocialMediaAccountModel.findById(accountId);
  if (!account) {
    throw new Error("Social media account not found.");
  }
  account.followerCount = newFollowerCount;
  account.lastFollowerUpdate = new Date();
  account.followerHistory.push({ date: new Date(), count: newFollowerCount });
  await account.save();
  return SocialMediaAccountModel.findById(account._id)
    .populate("centerId", "name")
    .populate("createdBy", "email")
    .exec();
};

interface LeanFollowerHistoryAccountOnly {
    _id: Types.ObjectId;
    followerHistory: IFollowerHistoryEntry[];
}

const getFollowerHistory = async (accountId: string): Promise<IFollowerHistoryEntry[]> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(accountId)) return [];
  const account = await SocialMediaAccountModel.findById(accountId)
                            .select("followerHistory")
                            .lean<LeanFollowerHistoryAccountOnly>();
  if (!account) {
    throw new Error("Social media account not found.");
  }
  return account.followerHistory || [];
};

const getAccounts = async (filters?: IGetSocialMediaAccountsFilters): Promise<PopulatedLeanSocialMediaAccount[]> => {
  return getAllSocialMediaAccounts(filters || {});
};

const updateAllFollowerCounts = async (): Promise<void> => {
  console.log("Placeholder: updateAllFollowerCounts called. In a real app, this would update follower counts from APIs.");
  return Promise.resolve();
};

export const socialMediaService = {
  createSocialMediaAccount,
  getAllSocialMediaAccounts,
  getSocialMediaAccountById,
  updateSocialMediaAccount,
  deleteSocialMediaAccount,
  updateFollowerCount,
  getFollowerHistory,
  getAccounts,
  updateAllFollowerCounts
};

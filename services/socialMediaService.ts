// services/socialMediaService.ts
import SocialMediaAccount, { ISocialMediaAccount, SocialMediaPlatform } from "@/models/socialMediaAccount";
import Center from "@/models/center"; // To validate centerId
import { connectToDB } from "@/lib/mongodb";
import mongoose from "mongoose";
// Assuming SocialMediaAccountFormValues and UpdateSocialMediaAccountFormValues are defined elsewhere
// For service layer, we can use Partial<ISocialMediaAccount> or define specific interfaces

interface CreateSocialMediaAccountData {
  platform: SocialMediaPlatform;
  username: string;
  link: string;
  scope: "HQ" | "CENTER";
  centerId?: string | mongoose.Types.ObjectId; // Required if scope is "CENTER"
  notes?: string;
  createdBy?: string | mongoose.Types.ObjectId;
}

interface UpdateSocialMediaAccountData {
  platform?: SocialMediaPlatform;
  username?: string;
  link?: string;
  notes?: string;
  // Follower count and history are typically managed by separate processes
}

/**
 * Creates a new Social Media Account.
 * Permission checks (e.g., HQ_ADMIN or CENTER_ADMIN for the centerId) handled in API routes.
 * @param data - Data for the new social media account.
 * @returns The created social media account document.
 */
export const createSocialMediaAccountService = async (data: CreateSocialMediaAccountData): Promise<ISocialMediaAccount> => {
  await connectToDB();

  if (data.scope === "CENTER" && !data.centerId) {
    throw new Error("Center ID is required for CENTER-scoped social media accounts.");
  }
  if (data.scope === "CENTER" && data.centerId) {
    const centerExists = await Center.findById(data.centerId);
    if (!centerExists) {
      throw new Error("Invalid Center ID: Center does not exist.");
    }
  } else if (data.scope === "HQ") {
    data.centerId = undefined; // Ensure centerId is not set for HQ scope
  }

  // Uniqueness is handled by compound indexes in the model
  try {
    const newAccount = new SocialMediaAccount(data);
    await newAccount.save();
    return newAccount;
  } catch (error: any) {
    if (error.code === 11000) { // MongoError: E11000 duplicate key error
        throw new Error(`A social media account with this platform and username already exists for the specified scope.`);
    }
    throw error;
  }
};

interface GetSocialMediaAccountsFilters {
  scope?: "HQ" | "CENTER";
  centerId?: string | mongoose.Types.ObjectId;
  platform?: SocialMediaPlatform;
}

/**
 * Retrieves Social Media Accounts based on filters.
 * Access control handled in API routes.
 * @param filters - Filtering options.
 * @returns A list of social media account documents.
 */
export const getAllSocialMediaAccountsService = async (filters: GetSocialMediaAccountsFilters): Promise<ISocialMediaAccount[]> => {
  await connectToDB();
  const query: any = {};
  if (filters.scope) query.scope = filters.scope;
  if (filters.centerId) query.centerId = new mongoose.Types.ObjectId(filters.centerId.toString());
  if (filters.platform) query.platform = filters.platform;
  
  // If scope is HQ, explicitly ensure centerId is not part of the query unless specifically requested for some reason
  if (filters.scope === "HQ") {
    query.centerId = { $exists: false };
  }

  return SocialMediaAccount.find(query).populate("centerId", "name").populate("createdBy", "email").lean();
};

/**
 * Retrieves a specific Social Media Account by its ID.
 * Permission checks handled in API route.
 * @param id - The ID of the social media account.
 * @returns The social media account document or null if not found.
 */
export const getSocialMediaAccountByIdService = async (id: string): Promise<ISocialMediaAccount | null> => {
  await connectToDB();
  return SocialMediaAccount.findById(id).populate("centerId", "name").populate("createdBy", "email").lean();
};

/**
 * Updates an existing Social Media Account.
 * Scope and centerId are generally not updatable directly; delete and recreate if scope changes.
 * Permission checks handled in API route.
 * @param id - The ID of the social media account to update.
 * @param data - The data to update the account with.
 * @returns The updated social media account document or null if not found.
 */
export const updateSocialMediaAccountService = async (id: string, data: UpdateSocialMediaAccountData): Promise<ISocialMediaAccount | null> => {
  await connectToDB();
  // Prevent changing scope or centerId directly, as it affects uniqueness and ownership.
  // If data contains scope or centerId, throw error or ignore them.
  const { ...updateData } = data; // Exclude scope and centerId from direct update data
  
  try {
      const updatedAccount = await SocialMediaAccount.findByIdAndUpdate(id, updateData, { new: true })
                                  .populate("centerId", "name")
                                  .populate("createdBy", "email")
                                  .lean();
    return updatedAccount;
  } catch (error: any) {
    if (error.code === 11000) {
        throw new Error(`Update failed: A social media account with this platform and username already exists for the specified scope.`);
    }
    throw error;
  }
};

/**
 * Deletes a Social Media Account.
 * Permission checks handled in API route.
 * @param id - The ID of the social media account to delete.
 * @returns The deleted social media account document or null if not found.
 */
export const deleteSocialMediaAccountService = async (id: string): Promise<ISocialMediaAccount | null> => {
  await connectToDB();
  return SocialMediaAccount.findByIdAndDelete(id).lean();
};

/**
 * Updates follower count for a specific account and adds a history entry.
 * This would typically be called by a scheduled job or an external trigger.
 * @param accountId - The ID of the social media account.
 * @param newFollowerCount - The new follower count.
 * @returns The updated social media account document.
 */
export const updateFollowerCountService = async (accountId: string, newFollowerCount: number): Promise<ISocialMediaAccount | null> => {
  await connectToDB();
  const account = await SocialMediaAccount.findById(accountId);
  if (!account) {
    throw new Error("Social media account not found.");
  }

  account.followerCount = newFollowerCount;
  account.lastFollowerUpdate = new Date();
  account.followerHistory.push({ date: new Date(), count: newFollowerCount });
  // Optional: Trim followerHistory if it gets too long
  // const maxHistoryLength = 100; 
  // if (account.followerHistory.length > maxHistoryLength) { 
  //   account.followerHistory = account.followerHistory.slice(-maxHistoryLength); 
  // }
  await account.save();
  return account.populate([
    { path: "centerId", select: "name" },
    { path: "createdBy", select: "email"}
  ]);
};

/**
 * Retrieves follower history for a specific account.
 * @param accountId - The ID of the social media account.
 * @param days - Number of past days to retrieve history for (approximate).
 * @returns Array of follower history entries.
 */
export const getFollowerHistoryService = async (accountId: string, days: number = 30): Promise<ISocialMediaAccount["followerHistory"]> => {
  await connectToDB();
  const account = await SocialMediaAccount.findById(accountId).select("followerHistory").lean();
  if (!account) {
    throw new Error("Social media account not found.");
  }
  // Filter history if needed, though typically the whole array is returned and frontend handles display period.
  // If filtering by date:
  // const sinceDate = new Date();
  // sinceDate.setDate(sinceDate.getDate() - days);
  // return account.followerHistory.filter(entry => entry.date >= sinceDate);
  return account.followerHistory;
};

// updateAllFollowerCounts would be a more complex service, likely iterating through accounts
// and calling external APIs to fetch actual follower counts, then calling updateFollowerCountService for each.
// This is beyond simple CRUD and depends on external API integrations.


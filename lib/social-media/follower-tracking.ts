// Follower tracking service for scheduled updates
import connectToDatabase from "@/lib/db";
// Attempt to import ISocialMediaAccount, if it fails, we might need to define it or use a more generic Mongoose type
import SocialMediaAccount, { ISocialMediaAccount, SocialMediaPlatform } from "@/models/socialMediaAccount";
import { getPlatformApiHandler } from "./platform-api";

// Define the structure for growth metrics based on typical usage
interface GrowthMetric {
  count: number;
  percentage: number; // Assuming this structure, adjust if model method returns differently
}

// Define the type for the result of updating a single account
interface UpdateAccountResult {
  account: ISocialMediaAccount; // Using the imported interface for the account document
  weeklyGrowth: GrowthMetric;   // Using the defined GrowthMetric type
  monthlyGrowth: GrowthMetric;  // Using the defined GrowthMetric type
}

/**
 * Updates follower count for a specific social media account
 * @param accountId The MongoDB ID of the account to update
 * @returns The updated account with follower count and growth metrics
 */
export async function updateAccountFollowers(accountId: string): Promise<UpdateAccountResult> { // Added return type
  try {
    await connectToDatabase();
    
    const account = await SocialMediaAccount.findById(accountId);
    if (!account) {
      throw new Error(`Account not found with ID: ${accountId}`);
    }
    
    const apiHandler = getPlatformApiHandler(account.platform as SocialMediaPlatform);
    const followerCount = await apiHandler.getFollowerCount(account.username, account.url);
    const now = new Date();
    
    const shouldAddToHistory = 
      followerCount !== account.currentFollowers || 
      !account.lastUpdated || 
      (now.getTime() - account.lastUpdated.getTime() > 24 * 60 * 60 * 1000);
    
    if (shouldAddToHistory) {
      account.followerHistory.push({
        count: followerCount,
        date: now
      });
    }
    
    account.currentFollowers = followerCount;
    account.lastUpdated = now;
    
    await account.save();
    
    const weeklyGrowth = account.getWeeklyGrowth();
    const monthlyGrowth = account.getMonthlyGrowth();
    
    return {
      account,
      weeklyGrowth,
      monthlyGrowth
    };
  } catch (error) {
    console.error(`Error updating followers for account ${accountId}:`, error);
    throw error;
  }
}

/**
 * Updates follower counts for all social media accounts
 * @returns Summary of update results
 */
export async function updateAllAccountFollowers() {
  try {
    await connectToDatabase();
    
    const accounts = await SocialMediaAccount.find({});
    
    const results = {
      total: accounts.length,
      successful: 0,
      failed: 0,
      updatedAccounts: [] as UpdateAccountResult[] // Applied the defined type here
    };
    
    for (const account of accounts) {
      try {
        const result = await updateAccountFollowers(account._id.toString()); // Ensure _id is string if needed
        results.successful++;
        results.updatedAccounts.push(result);
      } catch (error) {
        console.error(`Failed to update account ${account._id}:`, error);
        results.failed++;
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error updating all account followers:", error);
    throw error;
  }
}

/**
 * Schedules regular updates for follower counts
 * This would typically be called from a cron job or worker
 */
export async function scheduleFollowerUpdates() {
  try {
    console.log("Starting scheduled follower count updates");
    const results = await updateAllAccountFollowers();
    console.log(`Completed scheduled updates: ${results.successful}/${results.total} successful`);
    return results;
  } catch (error) {
    console.error("Error in scheduled follower updates:", error);
    throw error;
  }
}

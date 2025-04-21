// Follower tracking service for scheduled updates
import connectToDatabase from '@/lib/db';
import SocialMediaAccount, { SocialMediaPlatform } from '@/models/socialMediaAccount';
import { getPlatformApiHandler } from './platform-api';

/**
 * Updates follower count for a specific social media account
 * @param accountId The MongoDB ID of the account to update
 * @returns The updated account with follower count and growth metrics
 */
export async function updateAccountFollowers(accountId: string) {
  try {
    await connectToDatabase();
    
    // Find the account
    const account = await SocialMediaAccount.findById(accountId);
    if (!account) {
      throw new Error(`Account not found with ID: ${accountId}`);
    }
    
    // Get the appropriate API handler for this platform
    const apiHandler = getPlatformApiHandler(account.platform as SocialMediaPlatform);
    
    // Get current follower count
    const followerCount = await apiHandler.getFollowerCount(account.username, account.url);
    
    // Update account with new follower count
    const now = new Date();
    
    // Add to history only if count has changed or it's been at least 24 hours since last update
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
    
    // Calculate growth metrics
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
    
    // Get all accounts
    const accounts = await SocialMediaAccount.find({});
    
    // Track results
    const results = {
      total: accounts.length,
      successful: 0,
      failed: 0,
      updatedAccounts: [] as any[]
    };
    
    // Update each account
    for (const account of accounts) {
      try {
        const result = await updateAccountFollowers(account._id);
        results.successful++;
        results.updatedAccounts.push(result);
      } catch (error) {
        console.error(`Failed to update account ${account._id}:`, error);
        results.failed++;
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error updating all account followers:', error);
    throw error;
  }
}

/**
 * Schedules regular updates for follower counts
 * This would typically be called from a cron job or worker
 */
export async function scheduleFollowerUpdates() {
  try {
    console.log('Starting scheduled follower count updates');
    const results = await updateAllAccountFollowers();
    console.log(`Completed scheduled updates: ${results.successful}/${results.total} successful`);
    return results;
  } catch (error) {
    console.error('Error in scheduled follower updates:', error);
    throw error;
  }
}

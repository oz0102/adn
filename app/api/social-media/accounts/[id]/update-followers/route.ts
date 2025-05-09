// app/api/social-media/accounts/[id]/update-followers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SocialMediaAccount, { SocialMediaPlatform, ISocialMediaAccount, GrowthResult } from '@/models/socialMediaAccount';
import { getTelegramFollowers as fetchTelegramFollowers } from '@/lib/social-media/telegram-scraper';
import { errorHandler } from '@/lib/error-handler';

// Helper function to fetch follower count based on platform
async function getFollowerCount(account: ISocialMediaAccount): Promise<number> {
  const { platform, username } = account;
  
  switch (platform) {
    case SocialMediaPlatform.Telegram:
      return await fetchTelegramFollowers(username);
    
    // For other platforms, we would implement API calls here
    // These would be implemented with proper API keys and rate limiting
    case SocialMediaPlatform.Twitter:
      // Twitter API implementation would go here
      return 0;
      
    case SocialMediaPlatform.Facebook:
      // Facebook API implementation would go here
      return 0;
      
    case SocialMediaPlatform.YouTube:
      // YouTube API implementation would go here
      return 0;
      
    case SocialMediaPlatform.Instagram:
      // Instagram API implementation would go here
      return 0;
      
    case SocialMediaPlatform.TikTok:
      // TikTok API implementation would go here
      return 0;
      
    default:
      return 0;
  }
}

// POST handler to update follower count for a specific account
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await connectToDatabase();
    
    // Check if account exists
    const account = await SocialMediaAccount.findById(id);
    
    if (!account) {
      return NextResponse.json(
        { error: 'Social media account not found' },
        { status: 404 }
      );
    }
    
    // Get current follower count
    const followerCount = await getFollowerCount(account);
    
    // Update account with new follower count
    const now = new Date();
    
    // Add to history only if count has changed
    if (followerCount !== account.currentFollowers) {
      account.followerHistory.push({
        count: followerCount,
        date: now
      });
    }
    
    account.currentFollowers = followerCount;
    account.lastUpdated = now;
    
    await account.save();
    
    // Calculate growth metrics
    const weeklyGrowth: GrowthResult = account.getWeeklyGrowth();
    const monthlyGrowth: GrowthResult = account.getMonthlyGrowth();
    
    return NextResponse.json({
      account,
      weeklyGrowth,
      monthlyGrowth
    });
  } catch (error) {
    return errorHandler(error);
  }
}
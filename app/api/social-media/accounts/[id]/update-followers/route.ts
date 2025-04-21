// API route handler for updating follower counts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SocialMediaAccount, { SocialMediaPlatform } from '@/models/socialMediaAccount';
import { errorHandler } from '@/lib/error-handler';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Helper function to fetch follower count from Telegram
async function getTelegramFollowers(username: string): Promise<number> {
  try {
    const response = await axios.get(`https://t.me/${username}`);
    const $ = cheerio.load(response.data);
    const membersText = $('.tgme_page_extra').text();
    const membersMatch = membersText.match(/(\d+(?:\s\d+)*)\s+members?/i);
    
    if (membersMatch && membersMatch[1]) {
      // Remove spaces and parse as integer
      const count = parseInt(membersMatch[1].replace(/\s/g, ''), 10);
      return isNaN(count) ? 0 : count;
    }
    
    return 0;
  } catch (error) {
    console.error(`Error fetching Telegram followers for ${username}:`, error);
    return 0;
  }
}

// Helper function to fetch follower count based on platform
async function getFollowerCount(account: any): Promise<number> {
  const { platform, username, url } = account;
  
  switch (platform) {
    case SocialMediaPlatform.TELEGRAM:
      return await getTelegramFollowers(username);
    
    // For other platforms, we would implement API calls here
    // These would be implemented with proper API keys and rate limiting
    case SocialMediaPlatform.TWITTER:
      // Twitter API implementation would go here
      return 0;
      
    case SocialMediaPlatform.FACEBOOK:
      // Facebook API implementation would go here
      return 0;
      
    case SocialMediaPlatform.YOUTUBE:
      // YouTube API implementation would go here
      return 0;
      
    case SocialMediaPlatform.INSTAGRAM:
      // Instagram API implementation would go here
      return 0;
      
    case SocialMediaPlatform.TIKTOK:
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
    
    return NextResponse.json({
      account,
      weeklyGrowth: account.getWeeklyGrowth(),
      monthlyGrowth: account.getMonthlyGrowth()
    });
  } catch (error) {
    return errorHandler(error);
  }
}

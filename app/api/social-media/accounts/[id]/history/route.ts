// API route handler for getting follower history for a specific account
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SocialMediaAccount from '@/models/socialMediaAccount';
import { errorHandler } from '@/lib/error-handler';

// GET handler to retrieve follower history for a specific account
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    
    await connectToDatabase();
    
    // Check if account exists
    const account = await SocialMediaAccount.findById(id);
    
    if (!account) {
      return NextResponse.json(
        { error: 'Social media account not found' },
        { status: 404 }
      );
    }
    
    // Calculate the date for filtering history
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Filter history records by date
    const filteredHistory = account.followerHistory.filter(
      record => record.date >= cutoffDate
    );
    
    return NextResponse.json({
      accountId: id,
      platform: account.platform,
      username: account.username,
      currentFollowers: account.currentFollowers,
      history: filteredHistory,
      weeklyGrowth: account.getWeeklyGrowth(),
      monthlyGrowth: account.getMonthlyGrowth()
    });
  } catch (error) {
    return errorHandler(error);
  }
}

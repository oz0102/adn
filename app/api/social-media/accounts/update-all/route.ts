// API route handler for updating all social media accounts' follower counts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SocialMediaAccount from '@/models/socialMediaAccount';
import { errorHandler } from '@/lib/error-handler';

// POST handler to update follower counts for all accounts
export async function POST() {
  try {
    await connectToDatabase();
    
    // Get all accounts
    const accounts = await SocialMediaAccount.find({});
    
    // For each account, trigger the update endpoint
    const updatePromises = accounts.map(async (account) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/social-media/accounts/${account._id}/update-followers`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update account ${account._id}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error updating account ${account._id}:`, error);
        return null;
      }
    });
    
    // Wait for all updates to complete
    const results = await Promise.all(updatePromises);
    
    // Filter out null results (failed updates)
    const successfulUpdates = results.filter(Boolean);
    
    return NextResponse.json({
      message: `Updated ${successfulUpdates.length} of ${accounts.length} accounts`,
      updatedAccounts: successfulUpdates
    });
  } catch (error) {
    return errorHandler(error);
  }
}

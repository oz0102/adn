// API route handler for social media accounts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SocialMediaAccount from '@/models/socialMediaAccount';
import { socialMediaAccountSchema } from '@/lib/validations/social-media';
import { errorHandler } from '@/lib/error-handler';

// GET handler to retrieve all social media accounts
export async function GET() {
  try {
    await connectToDatabase();
    const accounts = await SocialMediaAccount.find({}).sort({ platform: 1, username: 1 });
    return NextResponse.json(accounts);
  } catch (error) {
    return errorHandler(error);
  }
}

// POST handler to create a new social media account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = socialMediaAccountSchema.parse(body);
    
    await connectToDatabase();
    
    // Check if account already exists
    const existingAccount = await SocialMediaAccount.findOne({
      platform: validatedData.platform,
      username: validatedData.username
    });
    
    if (existingAccount) {
      return NextResponse.json(
        { error: 'Account already exists for this platform and username' },
        { status: 409 }
      );
    }
    
    // Create new account
    const newAccount = await SocialMediaAccount.create({
      ...validatedData,
      followerHistory: [],
      lastUpdated: new Date()
    });
    
    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    return errorHandler(error);
  }
}

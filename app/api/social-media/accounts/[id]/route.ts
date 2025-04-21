// API route handler for specific social media account operations
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import SocialMediaAccount from '@/models/socialMediaAccount';
import { updateSocialMediaAccountSchema } from '@/lib/validations/social-media';
import { errorHandler } from '@/lib/error-handler';

// GET handler to retrieve a specific social media account
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await connectToDatabase();
    const account = await SocialMediaAccount.findById(id);
    
    if (!account) {
      return NextResponse.json(
        { error: 'Social media account not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(account);
  } catch (error) {
    return errorHandler(error);
  }
}

// PATCH handler to update a specific social media account
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate the request body
    const validatedData = updateSocialMediaAccountSchema.parse(body);
    
    await connectToDatabase();
    
    // Check if account exists
    const account = await SocialMediaAccount.findById(id);
    
    if (!account) {
      return NextResponse.json(
        { error: 'Social media account not found' },
        { status: 404 }
      );
    }
    
    // Check if updating to a username that already exists for this platform
    if (validatedData.platform && validatedData.username) {
      const existingAccount = await SocialMediaAccount.findOne({
        platform: validatedData.platform,
        username: validatedData.username,
        _id: { $ne: id }
      });
      
      if (existingAccount) {
        return NextResponse.json(
          { error: 'Account already exists for this platform and username' },
          { status: 409 }
        );
      }
    }
    
    // Update account
    const updatedAccount = await SocialMediaAccount.findByIdAndUpdate(
      id,
      { ...validatedData },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedAccount);
  } catch (error) {
    return errorHandler(error);
  }
}

// DELETE handler to remove a specific social media account
export async function DELETE(
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
    
    // Delete account
    await SocialMediaAccount.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error) {
    return errorHandler(error);
  }
}

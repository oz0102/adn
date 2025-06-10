//app\api\social-media\accounts\[id]\route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Changed to use auth()
import { socialMediaService } from "@/services/socialMediaService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import SocialMediaAccountModel from "@/models/socialMediaAccount";

interface Params {
  params: { id: string };
}

/**
 * Handles GET requests to retrieve a specific Social Media Account by ID.
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await auth(); // Changed to use auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    const accountId = params.id;

    await connectToDB();
    const account = await socialMediaService.getSocialMediaAccountById(accountId);

    if (!account) {
      return NextResponse.json({ message: "Social Media Account not found" }, { status: 404 });
    }

    let canView = await checkPermission(userId, "GLOBAL_ADMIN");
    const centerIdString = account.centerId?._id?.toString(); 

    if (!canView && account.scope === "CENTER" && centerIdString) {
      canView = await checkPermission(userId, "CENTER_ADMIN", { centerId: new mongoose.Types.ObjectId(centerIdString) });
    } else if (!canView && account.scope === "GLOBAL") {
      canView = true; 
    }

    if (!canView) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }
    
    return NextResponse.json(account, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to retrieve social media account ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve social media account", error: errorMessage }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update a specific Social Media Account by ID.
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth(); // Changed to use auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const accountId = params.id;

    await connectToDB();
    const existingAccount = await SocialMediaAccountModel.findById(accountId).select("scope centerId").lean();
    if (!existingAccount) {
      return NextResponse.json({ message: "Social Media Account not found" }, { status: 404 });
    }

    let canUpdate = await checkPermission(userId, "GLOBAL_ADMIN");
    if (!canUpdate && existingAccount.scope === "CENTER" && existingAccount.centerId) {
      canUpdate = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingAccount.centerId });
    }

    if (!canUpdate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to update this account" }, { status: 403 });
    }

    const body = await request.json();
    const updatedAccount = await socialMediaService.updateSocialMediaAccount(accountId, body);

    if (!updatedAccount) {
      return NextResponse.json({ message: "Account not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedAccount, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to update social media account ${params.id}:`, error);
     if (errorMessage.includes("already exists")) {
        return NextResponse.json({ message: errorMessage }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update social media account", error: errorMessage }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a specific Social Media Account by ID.
 */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth(); // Changed to use auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const accountId = params.id;

    await connectToDB();
    const existingAccount = await SocialMediaAccountModel.findById(accountId).select("scope centerId").lean();
    if (!existingAccount) {
      return NextResponse.json({ message: "Social Media Account not found" }, { status: 404 });
    }

    let canDelete = await checkPermission(userId, "GLOBAL_ADMIN");
    if (!canDelete && existingAccount.scope === "CENTER" && existingAccount.centerId) {
      canDelete = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingAccount.centerId });
    }

    if (!canDelete) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to delete this account" }, { status: 403 });
    }

    const deletedAccount = await socialMediaService.deleteSocialMediaAccount(accountId);
    if (!deletedAccount) {
      return NextResponse.json({ message: "Account not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Social Media Account deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to delete social media account ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete social media account", error: errorMessage }, { status: 500 });
  }
}

export async function POST_UpdateFollowers(request: Request, { params }: Params) {
  try {
    const session = await auth(); // Changed to use auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const accountId = params.id;

    await connectToDB();
    const accountToUpdate = await SocialMediaAccountModel.findById(accountId).select("scope centerId").lean();
    if (!accountToUpdate) {
      return NextResponse.json({ message: "Social Media Account not found" }, { status: 404 });
    }

    let canTriggerUpdate = await checkPermission(userId, "GLOBAL_ADMIN");
    if (!canTriggerUpdate && accountToUpdate.scope === "CENTER" && accountToUpdate.centerId) {
      canTriggerUpdate = await checkPermission(userId, "CENTER_ADMIN", { centerId: accountToUpdate.centerId });
    }

    if (!canTriggerUpdate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const mockFollowerCount = Math.floor(Math.random() * 10000);
    const updatedAccount = await socialMediaService.updateFollowerCount(accountId, mockFollowerCount);
    
    return NextResponse.json(updatedAccount, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to update follower count for account ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to update follower count", error: errorMessage }, { status: 500 });
  }
}

export async function GET_FollowerHistory(request: Request, { params }: Params) {
  try {
    const session = await auth(); // Changed to use auth()
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const accountId = params.id;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    await connectToDB();
    const account = await SocialMediaAccountModel.findById(accountId).select("scope centerId").lean();
    if (!account) {
      return NextResponse.json({ message: "Social Media Account not found" }, { status: 404 });
    }

    let canViewHistory = await checkPermission(userId, "GLOBAL_ADMIN");
    if (!canViewHistory && account.scope === "CENTER" && account.centerId) {
      canViewHistory = await checkPermission(userId, "CENTER_ADMIN", { centerId: account.centerId });
    } else if (!canViewHistory && account.scope === "GLOBAL") {
      canViewHistory = true; 
    }

    if (!canViewHistory) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }
    const history = await socialMediaService.getFollowerHistory(accountId, days); // Added days parameter
    return NextResponse.json(history, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to get follower history for account ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to get follower history", error: errorMessage }, { status: 500 });
  }
}


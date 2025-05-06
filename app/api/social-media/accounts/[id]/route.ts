import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  getSocialMediaAccountByIdService,
  updateSocialMediaAccountService,
  deleteSocialMediaAccountService,
  updateFollowerCountService,
  getFollowerHistoryService
} from "@/services/socialMediaService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import SocialMediaAccount from "@/models/socialMediaAccount"; // For fetching account details for permission checks

interface Params {
  params: { id: string };
}

/**
 * Handles GET requests to retrieve a specific Social Media Account by ID.
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const accountId = params.id;

    await connectToDB();
    const account = await getSocialMediaAccountByIdService(accountId);

    if (!account) {
      return NextResponse.json({ message: "Social Media Account not found" }, { status: 404 });
    }

    let canView = await checkPermission(userId, "HQ_ADMIN");
    if (!canView && account.scope === "CENTER" && account.centerId) {
      canView = await checkPermission(userId, "CENTER_ADMIN", { centerId: account.centerId });
    } else if (!canView && account.scope === "HQ") {
      canView = true; // HQ accounts are generally viewable by logged-in users if directly accessed
    }

    if (!canView) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }
    
    return NextResponse.json(account, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to retrieve social media account ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve social media account", error: error.message }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update a specific Social Media Account by ID.
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const accountId = params.id;

    await connectToDB();
    const existingAccount = await SocialMediaAccount.findById(accountId).select("scope centerId").lean();
    if (!existingAccount) {
      return NextResponse.json({ message: "Social Media Account not found" }, { status: 404 });
    }

    let canUpdate = await checkPermission(userId, "HQ_ADMIN");
    if (!canUpdate && existingAccount.scope === "CENTER" && existingAccount.centerId) {
      canUpdate = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingAccount.centerId });
    }

    if (!canUpdate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to update this account" }, { status: 403 });
    }

    const body = await request.json();
    const updatedAccount = await updateSocialMediaAccountService(accountId, body);

    if (!updatedAccount) {
      return NextResponse.json({ message: "Account not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedAccount, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to update social media account ${params.id}:`, error);
     if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update social media account", error: error.message }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a specific Social Media Account by ID.
 */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const accountId = params.id;

    await connectToDB();
    const existingAccount = await SocialMediaAccount.findById(accountId).select("scope centerId").lean();
    if (!existingAccount) {
      return NextResponse.json({ message: "Social Media Account not found" }, { status: 404 });
    }

    let canDelete = await checkPermission(userId, "HQ_ADMIN");
    if (!canDelete && existingAccount.scope === "CENTER" && existingAccount.centerId) {
      canDelete = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingAccount.centerId });
    }

    if (!canDelete) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to delete this account" }, { status: 403 });
    }

    const deletedAccount = await deleteSocialMediaAccountService(accountId);
    if (!deletedAccount) {
      return NextResponse.json({ message: "Account not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Social Media Account deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete social media account ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete social media account", error: error.message }, { status: 500 });
  }
}

/**
 * Handles POST requests to manually trigger follower count update for a specific account.
 * /api/social-media/accounts/[id]/update-followers
 */
// This should be in a separate route file like /api/social-media/accounts/[id]/update-followers/route.ts
// For now, adding a placeholder here for the concept. A real implementation would call external APIs.
export async function POST_UpdateFollowers(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const accountId = params.id;

    await connectToDB();
    const accountToUpdate = await SocialMediaAccount.findById(accountId).select("scope centerId").lean();
    if (!accountToUpdate) {
      return NextResponse.json({ message: "Social Media Account not found" }, { status: 404 });
    }

    let canTriggerUpdate = await checkPermission(userId, "HQ_ADMIN");
    if (!canTriggerUpdate && accountToUpdate.scope === "CENTER" && accountToUpdate.centerId) {
      canTriggerUpdate = await checkPermission(userId, "CENTER_ADMIN", { centerId: accountToUpdate.centerId });
    }

    if (!canTriggerUpdate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    // In a real scenario, this would call an external API to get the follower count
    const mockFollowerCount = Math.floor(Math.random() * 10000);
    const updatedAccount = await updateFollowerCountService(accountId, mockFollowerCount);
    
    return NextResponse.json(updatedAccount, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to update follower count for account ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to update follower count", error: error.message }, { status: 500 });
  }
}

/**
 * Handles GET requests to retrieve follower history for a specific account.
 * /api/social-media/accounts/[id]/history
 */
// This should be in a separate route file like /api/social-media/accounts/[id]/history/route.ts
export async function GET_FollowerHistory(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = new mongoose.Types.ObjectId(session.user.id);
    const accountId = params.id;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    await connectToDB();
    const account = await SocialMediaAccount.findById(accountId).select("scope centerId").lean();
    if (!account) {
      return NextResponse.json({ message: "Social Media Account not found" }, { status: 404 });
    }

    let canViewHistory = await checkPermission(userId, "HQ_ADMIN");
    if (!canViewHistory && account.scope === "CENTER" && account.centerId) {
      canViewHistory = await checkPermission(userId, "CENTER_ADMIN", { centerId: account.centerId });
    } else if (!canViewHistory && account.scope === "HQ") {
      canViewHistory = true; // Allow viewing history for HQ accounts if directly accessed
    }

    if (!canViewHistory) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const history = await getFollowerHistoryService(accountId, days);
    return NextResponse.json(history, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to get follower history for account ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to get follower history", error: error.message }, { status: 500 });
  }
}


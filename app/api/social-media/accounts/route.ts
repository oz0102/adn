import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  createSocialMediaAccountService,
  getAllSocialMediaAccountsService,
  updateFollowerCountService, // For manual trigger, if needed via API
} from "@/services/socialMediaService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";

/**
 * Handles POST requests to create a new Social Media Account.
 * Requires HQ_ADMIN or CENTER_ADMIN (if scope is CENTER and for that centerId).
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const body = await request.json();
    const { scope, centerId } = body;

    if (!scope || (scope === "CENTER" && !centerId)) {
      return NextResponse.json({ message: "Scope and Center ID (if scope is CENTER) are required" }, { status: 400 });
    }

    await connectToDB();
    let hasPermissionToCreate = await checkPermission(userId, "HQ_ADMIN");

    if (!hasPermissionToCreate && scope === "CENTER") {
      hasPermissionToCreate = await checkPermission(userId, "CENTER_ADMIN", { centerId });
    }

    if (!hasPermissionToCreate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to create social media account for this scope" }, { status: 403 });
    }
    
    body.createdBy = userId; // Add createdBy field
    const newAccount = await createSocialMediaAccountService(body);
    return NextResponse.json(newAccount, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create social media account:", error);
    if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create social media account", error: error.message }, { status: 500 });
  }
}

/**
 * Handles GET requests to retrieve Social Media Accounts.
 * Filters by scope (HQ/CENTER) and centerId.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") as "HQ" | "CENTER" | undefined;
    const centerId = searchParams.get("centerId");
    const platform = searchParams.get("platform") as any;

    const filters: any = {};
    if (scope) filters.scope = scope;
    if (centerId) filters.centerId = centerId;
    if (platform) filters.platform = platform;

    await connectToDB();
    let canView = await checkPermission(userId, "HQ_ADMIN");

    if (!canView && scope === "CENTER" && centerId) {
      canView = await checkPermission(userId, "CENTER_ADMIN", { centerId });
    } else if (!canView && scope === "HQ") {
      // Any logged-in user can view HQ accounts by default, or restrict further if needed.
      // For now, let's assume HQ accounts are more broadly visible if explicitly queried.
      canView = true; 
    } else if (!canView && !scope && !centerId) {
        // If no scope is defined, HQ admin sees all, center admin could see their center's + HQ.
        // For simplicity, if not HQ_ADMIN and no scope, deny or return only accessible.
        // This part can be refined based on exact requirements for a general GET without scope.
        // For now, let's allow if they are a center admin to see their own + HQ.
        // This would require fetching all their center admin roles and then filtering.
        // A simpler approach: if not HQ_ADMIN, they MUST provide a scope or centerId they have access to.
        return NextResponse.json({ message: "Forbidden: Please specify a scope (HQ or CENTER with centerId) you have access to, or have HQ Admin role." }, { status: 403 });
    }

    if (!canView) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to view social media accounts for this scope" }, { status: 403 });
    }
    
    // If a center admin is querying, and no specific scope is given, or scope=HQ, they should see HQ accounts.
    // If they query for a specific centerId, they must be admin of THAT center.
    // If they query for scope=CENTER without a centerId, it's ambiguous - could return all their centers' accounts.

    const accounts = await getAllSocialMediaAccountsService(filters);
    return NextResponse.json(accounts, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve social media accounts:", error);
    return NextResponse.json({ message: "Failed to retrieve social media accounts", error: error.message }, { status: 500 });
  }
}

// Endpoint to manually trigger follower update for ALL accounts (admin only)
// POST /api/social-media/accounts/update-all-followers
// This would be a separate route file or added here if simple enough.
// For now, focusing on CRUD for accounts themselves.


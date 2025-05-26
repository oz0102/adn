import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Corrected: Use auth() for server-side session
import { socialMediaService } from "@/services/socialMediaService"; // Corrected import
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import { SocialMediaPlatform } from "@/models/socialMediaAccount"; // Assuming platform enum/type

// Define a more specific type for query filters
interface SocialMediaQueryFilters {
  scope?: "HQ" | "CENTER";
  centerId?: string | null;
  platform?: SocialMediaPlatform | string; // Allow string for flexibility if enum is not exhaustive
  [key: string]: any; // Allow other string keys for dynamic filters
}

/**
 * Handles POST requests to create a new Social Media Account.
 * Requires HQ_ADMIN or CENTER_ADMIN (if scope is CENTER and for that centerId).
 */
export async function POST(request: Request) {
  try {
    const session = await auth(); // Corrected: Use auth() to get session
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
    const newAccount = await socialMediaService.createSocialMediaAccount(body); // Corrected usage
    return NextResponse.json(newAccount, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Failed to create social media account:", error);
    if (errorMessage.includes("already exists")) {
        return NextResponse.json({ message: errorMessage }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to create social media account", error: errorMessage }, { status: 500 });
  }
}

/**
 * Handles GET requests to retrieve Social Media Accounts.
 * Filters by scope (HQ/CENTER) and centerId.
 */
export async function GET(request: Request) {
  try {
    const session = await auth(); // Corrected: Use auth() to get session
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") as "HQ" | "CENTER" | undefined;
    const centerId = searchParams.get("centerId");
    const platform = searchParams.get("platform") as SocialMediaPlatform | string | undefined | null;

    const filters: SocialMediaQueryFilters = {};
    if (scope) filters.scope = scope;
    if (centerId) filters.centerId = centerId;
    if (platform) filters.platform = platform;

    await connectToDB();
    let canView = await checkPermission(userId, "HQ_ADMIN");

    if (!canView && scope === "CENTER" && centerId) {
      canView = await checkPermission(userId, "CENTER_ADMIN", { centerId });
    } else if (!canView && scope === "HQ") {
      canView = true; 
    } else if (!canView && !scope && !centerId) {
        return NextResponse.json({ message: "Forbidden: Please specify a scope (HQ or CENTER with centerId) you have access to, or have HQ Admin role." }, { status: 403 });
    }

    if (!canView) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to view social media accounts for this scope" }, { status: 403 });
    }
    
    const accounts = await socialMediaService.getAllSocialMediaAccounts(filters); // Corrected usage
    return NextResponse.json(accounts, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Failed to retrieve social media accounts:", error);
    return NextResponse.json({ message: "Failed to retrieve social media accounts", error: errorMessage }, { status: 500 });
  }
}


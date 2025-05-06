import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  createEventService,
  getAllEventsService
} from "@/services/eventService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";

/**
 * Handles POST requests to create a new Event.
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
    // Add more granular permissions if event creation is allowed by other roles (e.g., event manager role)

    if (!hasPermissionToCreate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to create event for this scope" }, { status: 403 });
    }
    
    body.createdBy = userId; // Add createdBy field
    const newEvent = await createEventService(body);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create event:", error);
    if (error.name === "ValidationError") {
        return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create event", error: error.message }, { status: 500 });
  }
}

/**
 * Handles GET requests to retrieve Events.
 * Filters by scope (HQ/CENTER) and centerId, and other event properties.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Public events might be viewable without login, or by any logged-in user for HQ scope.
    // For now, requiring login for all event viewing.
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    
    const filters: any = {};
    searchParams.forEach((value, key) => {
        if (key === "page" || key === "limit") {
            filters[key] = parseInt(value, 10);
        } else if (key === "startDateBefore" || key === "startDateAfter") {
            filters[key] = new Date(value);
        } else {
            filters[key] = value;
        }
    });

    await connectToDB();
    let canView = await checkPermission(userId, "HQ_ADMIN"); // HQ Admin can see all

    // If not HQ_ADMIN, apply scope-based viewing logic
    // All logged-in users can see HQ events by default.
    // For CENTER events, they must be admin of that center or it's a public event (not implemented yet).
    if (!canView) {
        if (filters.scope === "CENTER" && filters.centerId) {
            canView = await checkPermission(userId, "CENTER_ADMIN", { centerId: filters.centerId });
            // If not center admin, they can still view if it's their center (e.g. member of that center)
            // This requires linking user to member and member to center. For now, only admin view.
        } else if (filters.scope === "HQ") {
            canView = true; // All logged-in users can view HQ events
        } else if (!filters.scope && !filters.centerId) {
            // No specific scope requested by non-HQ_ADMIN. 
            // Default to showing HQ events and events from centers they administer.
            // This is more complex: would need to fetch user's roles, get their centerIds, then OR query.
            // For simplicity now: if no scope, and not HQ_ADMIN, they only see HQ events by default.
            filters.scope = "HQ";
            canView = true;
        } else {
            // If a centerId is provided without scope=CENTER, or other ambiguous cases for non-HQ_ADMIN
            return NextResponse.json({ message: "Forbidden: Insufficient permissions or ambiguous scope for your role." }, { status: 403 });
        }
    }

    if (!canView && !(filters.scope === "HQ")) { // Double check if not HQ_ADMIN and trying to access restricted center events
         return NextResponse.json({ message: "Forbidden: Insufficient permissions to view events for this scope" }, { status: 403 });
    }

    const result = await getAllEventsService(filters);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve events:", error);
    return NextResponse.json({ message: "Failed to retrieve events", error: error.message }, { status: 500 });
  }
}


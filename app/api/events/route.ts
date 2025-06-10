import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Changed to use auth()
import {
  eventService // Assuming eventService is an object with methods
} from "@/services/eventService";
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";

// Define a more specific type for event query filters
interface EventQueryFilters {
  page?: number;
  limit?: number;
  startDateBefore?: Date;
  startDateAfter?: Date;
  endDateBefore?: Date;
  endDateAfter?: Date;
  scope?: string;
  centerId?: string | { $in: mongoose.Types.ObjectId[] };
  createdBy?: mongoose.Types.ObjectId;
  $or?: Array<Partial<EventQueryFilters>>; // For OR conditions with more specific typing
  // Index signature for other dynamic string parameters from query string.
  // Specific properties like 'page', 'limit', 'startDateBefore', etc., handle their own types.
  [key: string]: string | undefined; // Only allow string values for unspecified keys from query params
}

export async function POST(request: Request) {
  try {
    const session = await auth(); 
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
    let hasPermissionToCreate = await checkPermission(userId, "GLOBAL_ADMIN");

    if (!hasPermissionToCreate && scope === "CENTER") {
      hasPermissionToCreate = await checkPermission(userId, "CENTER_ADMIN", { centerId });
    }

    if (!hasPermissionToCreate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to create event for this scope" }, { status: 403 });
    }
    
    body.createdBy = userId; 
    const newEvent = await eventService.createEvent(body); // Changed to use eventService
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Failed to create event:", error);
    if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create event", error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth(); 
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const { searchParams } = new URL(request.url);
    
    const filters: EventQueryFilters = {};
    searchParams.forEach((value, key) => {
        const k = key as keyof EventQueryFilters; // Cast key to keyof EventQueryFilters
        if (k === "page" || k === "limit") {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue)) {
                filters[k] = numValue;
            }
        } else if (k === "startDateBefore" || k === "startDateAfter" || k === "endDateBefore" || k === "endDateAfter") {
            const dateValue = new Date(value);
            // Potentially check if dateValue is valid, though Date constructor handles invalid dates gracefully (e.g. returns 'Invalid Date')
            filters[k] = dateValue;
        } else if (k === "scope") { // 'scope' is explicitly string
            filters[k] = value;
        } else if (k === "centerId") { // 'centerId' is string from query, or ObjectId[] set later
            filters[k] = value; 
        } else if (k === "createdBy") {
            if (mongoose.Types.ObjectId.isValid(value)) {
                filters[k] = new mongoose.Types.ObjectId(value);
            }
            // else: invalid ObjectId string, potentially log or ignore
        } else {
            // This branch handles any other string parameters not explicitly typed above
            // It relies on the index signature [key: string]: string | undefined;
            filters[key] = value; // 'key' (original string) is used here for the index signature
        }
    });

    await connectToDB();
    const canViewAll = await checkPermission(userId, "GLOBAL_ADMIN");

    const userPermissions = session.user.permissions || []; // Assuming permissions are on session.user

    if (!canViewAll) {
        const adminOfCenterIds = userPermissions
            .filter(p => p.role === "CENTER_ADMIN" && p.centerId)
            .map(p => p.centerId!.toString());

        if (filters.scope === "CENTER" && filters.centerId) {
            if (!adminOfCenterIds.includes(filters.centerId.toString())) {
                 return NextResponse.json({ message: "Forbidden: Insufficient permissions to view events for this center" }, { status: 403 });
            }
        } else if (filters.scope === "CENTER" && !filters.centerId) {
            // If requesting all center events but not GLOBAL_ADMIN, restrict to their admin centers
            if (adminOfCenterIds.length > 0) {
                filters.centerId = { $in: adminOfCenterIds.map(id => new mongoose.Types.ObjectId(id)) };
            } else {
                // No centers administered, and not GLOBAL_ADMIN, so cannot view general CENTER scope
                return NextResponse.json({ message: "Forbidden: No centers administered to view events for this scope" }, { status: 403 });
            }
        } else if (!filters.scope && !filters.centerId) {
            // Default: Show GLOBAL events and events from administered centers
            const orConditions = [{ scope: "GLOBAL" }];
            if (adminOfCenterIds.length > 0) {
                orConditions.push({ scope: "CENTER", centerId: { $in: adminOfCenterIds.map(id => new mongoose.Types.ObjectId(id)) } });
            }
            filters.$or = orConditions;
            delete filters.scope; // Remove scope if $or is used
            delete filters.centerId; // Remove centerId if $or is used
        } else if (filters.scope !== "GLOBAL") {
             return NextResponse.json({ message: "Forbidden: Insufficient permissions or ambiguous scope for your role." }, { status: 403 });
        }
        // If filters.scope is GLOBAL, any logged-in user can view (implicit by not returning 403 earlier)
    }
    // If canViewAll (GLOBAL_ADMIN), no additional scope filtering needed here, service will handle filters as is.

    const result = await eventService.getAllEvents(filters, userPermissions, userId); // Changed to use eventService, pass permissions and userId
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Failed to retrieve events:", error);
    return NextResponse.json({ message: "Failed to retrieve events", error: errorMessage }, { status: 500 });
  }
}


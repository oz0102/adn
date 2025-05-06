import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Changed to use auth()
import {
  eventService // Assuming eventService is an object with methods
} from "@/services/eventService";
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";

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
    let hasPermissionToCreate = await checkPermission(userId, "HQ_ADMIN");

    if (!hasPermissionToCreate && scope === "CENTER") {
      hasPermissionToCreate = await checkPermission(userId, "CENTER_ADMIN", { centerId });
    }

    if (!hasPermissionToCreate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to create event for this scope" }, { status: 403 });
    }
    
    body.createdBy = userId; 
    const newEvent = await eventService.createEvent(body); // Changed to use eventService
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create event:", error);
    if (error.name === "ValidationError") {
        return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create event", error: error.message }, { status: 500 });
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
    
    const filters: any = {};
    searchParams.forEach((value, key) => {
        if (key === "page" || key === "limit") {
            filters[key] = parseInt(value, 10);
        } else if (key === "startDateBefore" || key === "startDateAfter" || key === "endDateBefore" || key === "endDateAfter") { // Added endDate filters
            filters[key] = new Date(value);
        } else {
            filters[key] = value;
        }
    });

    await connectToDB();
    let canViewAll = await checkPermission(userId, "HQ_ADMIN"); 

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
            // If requesting all center events but not HQ_ADMIN, restrict to their admin centers
            if (adminOfCenterIds.length > 0) {
                filters.centerId = { $in: adminOfCenterIds.map(id => new mongoose.Types.ObjectId(id)) };
            } else {
                // No centers administered, and not HQ_ADMIN, so cannot view general CENTER scope
                return NextResponse.json({ message: "Forbidden: No centers administered to view events for this scope" }, { status: 403 });
            }
        } else if (!filters.scope && !filters.centerId) {
            // Default: Show HQ events and events from administered centers
            const orConditions = [{ scope: "HQ" }];
            if (adminOfCenterIds.length > 0) {
                orConditions.push({ scope: "CENTER", centerId: { $in: adminOfCenterIds.map(id => new mongoose.Types.ObjectId(id)) } });
            }
            filters.$or = orConditions;
            delete filters.scope; // Remove scope if $or is used
            delete filters.centerId; // Remove centerId if $or is used
        } else if (filters.scope !== "HQ") {
             return NextResponse.json({ message: "Forbidden: Insufficient permissions or ambiguous scope for your role." }, { status: 403 });
        }
        // If filters.scope is HQ, any logged-in user can view (implicit by not returning 403 earlier)
    }
    // If canViewAll (HQ_ADMIN), no additional scope filtering needed here, service will handle filters as is.

    const result = await eventService.getAllEvents(filters, userPermissions, userId); // Changed to use eventService, pass permissions and userId
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Failed to retrieve events:", error);
    return NextResponse.json({ message: "Failed to retrieve events", error: error.message }, { status: 500 });
  }
}


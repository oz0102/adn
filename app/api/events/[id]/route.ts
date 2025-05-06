import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  getEventByIdService,
  updateEventService,
  deleteEventService
} from "@/services/eventService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import Event from "@/models/event"; // For fetching event details for permission checks

interface Params {
  params: { id: string };
}

/**
 * Handles GET requests to retrieve a specific Event by ID.
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    // Public events might be viewable without login.
    // For now, let's assume login is required to see event details.
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const eventId = params.id;

    await connectToDB();
    const event = await getEventByIdService(eventId);

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    let canView = await checkPermission(userId, "HQ_ADMIN");
    if (!canView && event.scope === "CENTER" && event.centerId) {
      canView = await checkPermission(userId, "CENTER_ADMIN", { centerId: event.centerId });
      // Add logic here if members of the center can view the event details
    } else if (!canView && event.scope === "HQ") {
      canView = true; // All logged-in users can view details of HQ events
    }

    if (!canView) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to view this event" }, { status: 403 });
    }
    
    return NextResponse.json(event, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to retrieve event ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve event", error: error.message }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update a specific Event by ID.
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const eventId = params.id;

    await connectToDB();
    const existingEvent = await Event.findById(eventId).select("scope centerId createdBy").lean();
    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    let canUpdate = await checkPermission(userId, "HQ_ADMIN");
    if (!canUpdate && existingEvent.scope === "CENTER" && existingEvent.centerId) {
      canUpdate = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingEvent.centerId });
    }
    // Add more granular checks, e.g., if the user is the original creator (existingEvent.createdBy)
    // or has a specific event_manager role for that scope.

    if (!canUpdate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to update this event" }, { status: 403 });
    }

    const body = await request.json();
    // Prevent changing scope, centerId, or createdBy via this update
    delete body.scope;
    delete body.centerId;
    delete body.createdBy;

    const updatedEvent = await updateEventService(eventId, body);

    if (!updatedEvent) {
      return NextResponse.json({ message: "Event not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to update event ${params.id}:`, error);
    if (error.name === "ValidationError") {
        return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update event", error: error.message }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a specific Event by ID.
 */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const eventId = params.id;

    await connectToDB();
    const existingEvent = await Event.findById(eventId).select("scope centerId").lean();
    if (!existingEvent) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    let canDelete = await checkPermission(userId, "HQ_ADMIN");
    if (!canDelete && existingEvent.scope === "CENTER" && existingEvent.centerId) {
      canDelete = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingEvent.centerId });
    }

    if (!canDelete) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to delete this event" }, { status: 403 });
    }

    const deletedEvent = await deleteEventService(eventId);
    if (!deletedEvent) {
      return NextResponse.json({ message: "Event not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete event ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete event", error: error.message }, { status: 500 });
  }
}


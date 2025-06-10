import { NextResponse } from "next/server";
import { auth } from "@/auth"; // Changed to use auth()
import {
  eventService // Assuming eventService is an object with methods
} from "@/services/eventService";
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import Event from "@/models/event"; 

interface Params {
  params: { id: string };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await auth(); 
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const eventId = params.id;

    await connectToDB();
    const event = await eventService.getEventById(eventId); // Changed to use eventService

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    let canView = await checkPermission(userId, "GLOBAL_ADMIN");
    if (!canView && event.scope === "CENTER" && event.centerId) {
      canView = await checkPermission(userId, "CENTER_ADMIN", { centerId: event.centerId.toString() }); // Ensure centerId is string for checkPermission
    } else if (!canView && event.scope === "GLOBAL") {
      canView = true; 
    }

    if (!canView) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to view this event" }, { status: 403 });
    }
    
    return NextResponse.json(event, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to retrieve event ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve event", error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth(); 
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

    let canUpdate = await checkPermission(userId, "GLOBAL_ADMIN");
    if (!canUpdate && existingEvent.scope === "CENTER" && existingEvent.centerId) {
      canUpdate = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingEvent.centerId.toString() });
    }

    if (!canUpdate) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to update this event" }, { status: 403 });
    }

    const body = await request.json();
    delete body.scope;
    delete body.centerId;
    delete body.createdBy;

    const updatedEvent = await eventService.updateEvent(eventId, body); // Changed to use eventService

    if (!updatedEvent) {
      return NextResponse.json({ message: "Event not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to update event ${params.id}:`, error);
    if (error instanceof mongoose.Error.ValidationError) {
        return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update event", error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth(); 
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

    let canDelete = await checkPermission(userId, "GLOBAL_ADMIN");
    if (!canDelete && existingEvent.scope === "CENTER" && existingEvent.centerId) {
      canDelete = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingEvent.centerId.toString() });
    }

    if (!canDelete) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to delete this event" }, { status: 403 });
    }

    const deletedEvent = await eventService.deleteEvent(eventId); // Changed to use eventService
    if (!deletedEvent) {
      return NextResponse.json({ message: "Event not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to delete event ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete event", error: errorMessage }, { status: 500 });
  }
}


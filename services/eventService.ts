// services/eventService.ts
import Event, { IEvent } from "@/models/event";
import Center from "@/models/center"; // To validate centerId if scope is CENTER
import { connectToDB } from "@/lib/mongodb";
import mongoose from "mongoose";

interface CreateEventData extends Omit<Partial<IEvent>, "scope" | "centerId" | "createdBy"> {
  title: string;
  description: string;
  eventType: string;
  startDate: Date;
  endDate: Date;
  location: string;
  address: IEvent["address"];
  organizer: mongoose.Types.ObjectId; // Team ID
  scope: "HQ" | "CENTER";
  centerId?: string | mongoose.Types.ObjectId; // Required if scope is CENTER
  createdBy: string | mongoose.Types.ObjectId;
}

interface UpdateEventData extends Omit<Partial<IEvent>, "scope" | "centerId" | "createdBy"> {
  // Scope and centerId are generally not updatable for an event; delete and recreate if scope changes.
}

/**
 * Creates a new Event.
 * Permission checks (e.g., HQ_ADMIN or CENTER_ADMIN for the centerId) handled in API routes.
 * @param data - Data for the new event.
 * @returns The created event document.
 */
export const createEventService = async (data: CreateEventData): Promise<IEvent> => {
  await connectToDB();

  if (data.scope === "CENTER" && !data.centerId) {
    throw new Error("Center ID is required for CENTER-scoped events.");
  }
  if (data.scope === "CENTER" && data.centerId) {
    const centerExists = await Center.findById(data.centerId);
    if (!centerExists) {
      throw new Error("Invalid Center ID: Center does not exist.");
    }
  } else if (data.scope === "HQ") {
    data.centerId = undefined; // Ensure centerId is not set for HQ scope
  }

  const newEvent = new Event(data);
  await newEvent.save();
  return newEvent.populate([
      { path: "organizer", select: "name" }, // Assuming Team model has a name
      { path: "centerId", select: "name" },
      { path: "createdBy", select: "email" }
  ]);
};

interface GetEventsFilters {
  scope?: "HQ" | "CENTER";
  centerId?: string | mongoose.Types.ObjectId;
  eventType?: string;
  startDateBefore?: Date;
  startDateAfter?: Date;
  page?: number;
  limit?: number;
}

/**
 * Retrieves Events based on filters.
 * Access control handled in API routes.
 * @param filters - Filtering options.
 * @returns A list of event documents and pagination info.
 */
export const getAllEventsService = async (filters: GetEventsFilters): Promise<{ events: IEvent[], total: number, page: number, limit: number }> => {
  await connectToDB();
  const { scope, centerId, eventType, startDateBefore, startDateAfter, page = 1, limit = 20 } = filters;
  const query: any = {};

  if (scope) query.scope = scope;
  if (centerId) query.centerId = new mongoose.Types.ObjectId(centerId.toString());
  if (eventType) query.eventType = eventType;
  
  if (scope === "HQ") {
    query.centerId = { $exists: false };
  }

  if (startDateBefore || startDateAfter) {
    query.startDate = {};
    if (startDateAfter) query.startDate.$gte = startDateAfter;
    if (startDateBefore) query.startDate.$lte = startDateBefore;
  }

  const total = await Event.countDocuments(query);
  const events = await Event.find(query)
    .populate([
        { path: "organizer", select: "name" },
        { path: "centerId", select: "name" },
        { path: "createdBy", select: "email" }
    ])
    .sort({ startDate: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return { events, total, page, limit };
};

/**
 * Retrieves a specific Event by its ID.
 * Permission checks handled in API route.
 * @param id - The ID of the event.
 * @returns The event document or null if not found.
 */
export const getEventByIdService = async (id: string): Promise<IEvent | null> => {
  await connectToDB();
  return Event.findById(id).populate([
      { path: "organizer", select: "name" },
      { path: "centerId", select: "name" },
      { path: "createdBy", select: "email" }
  ]).lean();
};

/**
 * Updates an existing Event.
 * Scope and centerId are not updatable. createdBy is not updatable.
 * Permission checks handled in API route.
 * @param id - The ID of the event to update.
 * @param data - The data to update the event with.
 * @returns The updated event document or null if not found.
 */
export const updateEventService = async (id: string, data: UpdateEventData): Promise<IEvent | null> => {
  await connectToDB();
  // Exclude scope, centerId, createdBy from update data
  const { ...updatePayload } = data;
  return Event.findByIdAndUpdate(id, updatePayload, { new: true })
    .populate([
        { path: "organizer", select: "name" },
        { path: "centerId", select: "name" },
        { path: "createdBy", select: "email" }
    ]).lean();
};

/**
 * Deletes an Event.
 * Permission checks handled in API route.
 * @param id - The ID of the event to delete.
 * @returns The deleted event document or null if not found.
 */
export const deleteEventService = async (id: string): Promise<IEvent | null> => {
  await connectToDB();
  return Event.findByIdAndDelete(id).lean();
};


// services/eventService.ts
import Event, { IEvent } from "@/models/event";
import Center from "@/models/center"; 
import { connectToDB } from "@/lib/mongodb";
import mongoose, { FilterQuery, Types } from "mongoose"; // Added FilterQuery and Types

interface CreateEventData extends Omit<Partial<IEvent>, "scope" | "centerId" | "createdBy"> {
  title: string;
  description: string;
  eventType: string;
  startDate: Date;
  endDate: Date;
  location: string;
  address: IEvent["address"];
  organizer: mongoose.Types.ObjectId; 
  scope: "GLOBAL" | "CENTER";
  centerId?: string | mongoose.Types.ObjectId; 
  createdBy: string | mongoose.Types.ObjectId;
}

interface UpdateEventData extends Omit<Partial<IEvent>, "scope" | "centerId" | "createdBy"> {
}

const createEvent = async (data: CreateEventData): Promise<IEvent> => {
  await connectToDB();

  if (data.scope === "CENTER" && !data.centerId) {
    throw new Error("Center ID is required for CENTER-scoped events.");
  }
  if (data.scope === "CENTER" && data.centerId) {
    const centerExists = await Center.findById(data.centerId);
    if (!centerExists) {
      throw new Error("Invalid Center ID: Center does not exist.");
    }
  } else if (data.scope === "GLOBAL") {
    data.centerId = undefined; 
  }

  const newEvent = new Event(data);
  await newEvent.save();
  return newEvent.populate([
      { path: "organizer", select: "name" }, 
      { path: "centerId", select: "name" },
      { path: "createdBy", select: "email" }
  ]);
};

interface GetEventsFilters {
  scope?: "GLOBAL" | "CENTER";
  centerId?: string | mongoose.Types.ObjectId | { $in: Types.ObjectId[] }; // Allow $in for centerId
  eventType?: string;
  startDateBefore?: Date;
  startDateAfter?: Date;
  endDateBefore?: Date; // Added endDate filters
  endDateAfter?: Date;  // Added endDate filters
  $or?: any[]; // For complex OR conditions
  page?: number;
  limit?: number;
}

// Define a type for user permissions if it's not already defined elsewhere
interface UserPermission {
    role: string;
    centerId?: Types.ObjectId | string;
    // other permission-related fields
}

const getAllEvents = async (filters: GetEventsFilters, userPermissions?: UserPermission[], userId?: Types.ObjectId): Promise<{ events: IEvent[], total: number, page: number, limit: number }> => {
  await connectToDB();
  const { scope, centerId, eventType, startDateBefore, startDateAfter, endDateBefore, endDateAfter, $or, page = 1, limit = 20 } = filters;
  const query: FilterQuery<IEvent> = {}; // Use FilterQuery<IEvent>

  if ($or) {
    query.$or = $or;
  } else {
    if (scope) query.scope = scope;
    if (centerId) {
        if (typeof centerId === 'string' && Types.ObjectId.isValid(centerId)) {
            query.centerId = new mongoose.Types.ObjectId(centerId);
        } else if (typeof centerId === 'object' && centerId.$in) {
            query.centerId = { $in: centerId.$in.map(id => new Types.ObjectId(id.toString())) };
        } else if (centerId instanceof Types.ObjectId) {
            query.centerId = centerId;
        }
    }
    if (eventType) query.eventType = eventType;
    
    if (scope === "GLOBAL") {
      query.centerId = { $exists: false };
    }
  }

  if (startDateBefore || startDateAfter) {
    query.startDate = {};
    if (startDateAfter) query.startDate.$gte = startDateAfter;
    if (startDateBefore) query.startDate.$lte = startDateBefore;
  }

  if (endDateBefore || endDateAfter) { // Added handling for endDate filters
    query.endDate = {};
    if (endDateAfter) query.endDate.$gte = endDateAfter;
    if (endDateBefore) query.endDate.$lte = endDateBefore;
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

const getEventById = async (id: string): Promise<IEvent | null> => {
  await connectToDB();
  return Event.findById(id).populate([
      { path: "organizer", select: "name" },
      { path: "centerId", select: "name" },
      { path: "createdBy", select: "email" }
  ]).lean();
};

const updateEvent = async (id: string, data: UpdateEventData): Promise<IEvent | null> => {
  await connectToDB();
  const { ...updatePayload } = data;
  return Event.findByIdAndUpdate(id, updatePayload, { new: true })
    .populate([
        { path: "organizer", select: "name" },
        { path: "centerId", select: "name" },
        { path: "createdBy", select: "email" }
    ]).lean();
};

const deleteEvent = async (id: string): Promise<IEvent | null> => {
  await connectToDB();
  return Event.findByIdAndDelete(id).lean();
};

export const eventService = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
};

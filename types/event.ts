import { ObjectId } from 'mongoose';
import { Address } from './member';

export type EventType = 'Sunday Service' | 'Midweek Service' | 'Cluster Meeting' | 'Small Group' | 'Training' | 'Other';

export interface Event {
  _id?: string | ObjectId;
  title: string;
  description: string;
  eventType: EventType;
  startDate: Date | string;
  endDate: Date | string;
  location: string;
  address: Address;
  organizer: string | ObjectId;
  flyer?: string;
  reminderSent: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy: string | ObjectId;
}

export interface EventWithOrganizer extends Event {
  organizerDetails?: {
    _id: string | ObjectId;
    name: string;
  };
  creatorDetails?: {
    _id: string | ObjectId;
    email: string;
  };
}

export interface EventFormData extends Omit<Event, 'organizer' | 'createdBy'> {
  organizer: string;
  createdBy?: string;
}

export interface EventFilters {
  search?: string;
  eventType?: EventType;
  startDate?: Date | string;
  endDate?: Date | string;
  organizer?: string;
  page?: number;
  limit?: number;
}

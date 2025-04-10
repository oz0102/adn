import { ObjectId } from 'mongoose';
import { EventType } from './event';

export type FollowUpPersonType = 'New Attendee' | 'Member';
export type FollowUpStatus = 'Pending' | 'In Progress' | 'Completed' | 'Failed';
export type ContactMethod = 'Email' | 'SMS' | 'WhatsApp' | 'Call' | 'In Person';
export type ResponseType = 'Positive' | 'Negative' | 'No Response';

export interface FollowUpAttempt {
  attemptNumber: number;
  date: Date | string;
  contactMethod: ContactMethod;
  response: ResponseType;
  notes?: string;
  conductedBy: string | ObjectId;
}

export interface NewAttendee {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  whatsappNumber?: string;
  address?: string;
  visitDate: Date | string;
  referredBy?: string | ObjectId;
}

export interface MissedEvent {
  eventId: string | ObjectId;
  eventDate: Date | string;
  eventType: EventType;
}

export interface FollowUp {
  _id?: string | ObjectId;
  personType: FollowUpPersonType;
  personId?: string | ObjectId;
  newAttendee?: NewAttendee;
  missedEvent?: MissedEvent;
  status: FollowUpStatus;
  assignedTo: string | ObjectId;
  attempts: FollowUpAttempt[];
  nextFollowUpDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface FollowUpWithDetails extends FollowUp {
  personDetails?: {
    _id: string | ObjectId;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber: string;
    profilePhoto?: string;
  };
  eventDetails?: {
    _id: string | ObjectId;
    title: string;
    startDate: Date | string;
  };
  assignedToUser?: {
    _id: string | ObjectId;
    email: string;
  };
  attemptDetails?: Array<FollowUpAttempt & {
    conductedByUser?: {
      _id: string | ObjectId;
      email: string;
    }
  }>;
}

export interface FollowUpFormData extends Omit<FollowUp, 'assignedTo'> {
  assignedTo: string;
  newAttempt?: {
    contactMethod: ContactMethod;
    response: ResponseType;
    notes?: string;
  };
}

export interface FollowUpFilters {
  personType?: FollowUpPersonType;
  personId?: string;
  status?: FollowUpStatus;
  assignedTo?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
}

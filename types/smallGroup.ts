import { ObjectId } from 'mongoose';
import { Address } from './member';
import { MeetingSchedule } from './cluster';

export interface SmallGroup {
  _id?: string | ObjectId;
  groupId: string;
  name: string;
  location: string;
  address: Address;
  leaderId: string | ObjectId;
  contactPhone: string;
  contactEmail: string;
  photo?: string;
  description: string;
  meetingSchedule: MeetingSchedule;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface SmallGroupWithLeader extends SmallGroup {
  leader?: {
    _id: string | ObjectId;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
}

export interface SmallGroupFormData extends Omit<SmallGroup, 'leaderId'> {
  leaderId: string;
}

export interface SmallGroupFilters {
  search?: string;
  leaderId?: string;
  page?: number;
  limit?: number;
}

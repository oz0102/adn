import { ObjectId } from 'mongoose';
import { Address } from './member';

export interface MeetingSchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time: string;
  frequency: 'Weekly' | 'Bi-weekly' | 'Monthly';
}

export interface Cluster {
  _id?: string | ObjectId;
  clusterId: string;
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

export interface ClusterWithLeader extends Cluster {
  leader?: {
    _id: string | ObjectId;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
}

export interface ClusterFormData extends Omit<Cluster, 'leaderId'> {
  leaderId: string;
}

export interface ClusterFilters {
  search?: string;
  leaderId?: string;
  page?: number;
  limit?: number;
}

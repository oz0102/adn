import { ObjectId } from 'mongoose';

export interface Team {
  _id?: string | ObjectId;
  name: string;
  description: string;
  leaderId: string | ObjectId;
  assistantLeaderIds: (string | ObjectId)[];
  members: (string | ObjectId)[];
  responsibilities: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface TeamWithMembers extends Team {
  leader?: {
    _id: string | ObjectId;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  assistantLeaders?: Array<{
    _id: string | ObjectId;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  }>;
  memberDetails?: Array<{
    _id: string | ObjectId;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  }>;
}

export interface TeamFormData extends Omit<Team, 'leaderId' | 'assistantLeaderIds' | 'members'> {
  leaderId: string;
  assistantLeaderIds: string[];
  members: string[];
}

export interface TeamFilters {
  search?: string;
  leaderId?: string;
  memberId?: string;
  page?: number;
  limit?: number;
}

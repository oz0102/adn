import { ObjectId } from 'mongoose';
import { EventType } from './event';

export type AttendanceStatus = 'Present' | 'Absent' | 'Excused';

export interface AttendanceMember {
  memberId: string | ObjectId;
  status: AttendanceStatus;
  checkInTime?: Date | string;
}

export interface Attendance {
  _id?: string | ObjectId;
  eventId: string | ObjectId;
  eventType: EventType;
  date: Date | string;
  members: AttendanceMember[];
  totalPresent: number;
  totalAbsent: number;
  totalExcused: number;
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  recordedBy: string | ObjectId;
}

export interface AttendanceWithDetails extends Attendance {
  eventDetails?: {
    _id: string | ObjectId;
    title: string;
    startDate: Date | string;
    endDate: Date | string;
  };
  memberDetails?: Array<{
    _id: string | ObjectId;
    memberId: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
    status: AttendanceStatus;
    checkInTime?: Date | string;
  }>;
  recordedByUser?: {
    _id: string | ObjectId;
    email: string;
  };
}

export interface AttendanceFormData extends Omit<Attendance, 'eventId' | 'recordedBy'> {
  eventId: string;
  recordedBy?: string;
  memberAttendance: Array<{
    memberId: string;
    status: AttendanceStatus;
  }>;
}

export interface AttendanceFilters {
  eventId?: string;
  eventType?: EventType;
  startDate?: Date | string;
  endDate?: Date | string;
  memberId?: string;
  status?: AttendanceStatus;
  page?: number;
  limit?: number;
}

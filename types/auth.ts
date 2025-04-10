import { ObjectId } from 'mongoose';

export type UserRole = 'Admin' | 'Pastor' | 'ClusterLead' | 'SmallGroupLead' | 'PublicityLead' | 'MediaLead' | 'TechnicalLead' | 'Member';

export interface User {
  _id?: string | ObjectId;
  email: string;
  passwordHash?: string;
  role: UserRole;
  permissions: string[];
  lastLogin?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UserWithoutPassword extends Omit<User, 'passwordHash'> {
  passwordHash?: never;
}

export interface UserFormData extends Omit<User, 'passwordHash'> {
  password?: string;
  confirmPassword?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
}

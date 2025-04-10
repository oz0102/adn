import { ObjectId } from 'mongoose';

export interface Skill {
  name: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  certified: boolean;
}

export interface Education {
  level: 'No education' | 'Primary School' | 'Secondary School' | 'BSC' | 'OND' | 'HND' | 'MSc' | 'PhD';
  institution: string;
  course: string;
  graduationYear: number;
}

export interface SpiritualGrowthStage {
  date: Date | string;
  notes: string;
}

export interface SpiritualGrowth {
  newConvert?: SpiritualGrowthStage;
  waterBaptism?: SpiritualGrowthStage;
  holyGhostBaptism?: SpiritualGrowthStage;
  worker?: SpiritualGrowthStage;
  minister?: SpiritualGrowthStage;
  ordainedMinister?: SpiritualGrowthStage;
}

export interface Training {
  program: string;
  startDate: Date | string;
  completionDate?: Date | string;
  status: 'In Progress' | 'Completed' | 'Dropped';
  notes: string;
}

export interface TeamMembership {
  teamId: string | ObjectId;
  role: 'Member' | 'Assistant' | 'Lead';
  joinDate: Date | string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface Member {
  _id?: string | ObjectId;
  memberId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: Date | string;
  email: string;
  phoneNumber: string;
  whatsappNumber?: string;
  address: Address;
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  relationshipStatus?: 'Single' | 'In a relationship' | 'Engaged' | 'Married' | 'Separated' | 'Divorced' | 'Widowed';
  occupation?: string;
  employer?: string;
  profilePhoto?: string;
  education?: Education;
  skills: Skill[];
  spiritualGrowth: SpiritualGrowth;
  training: Training[];
  clusterId?: string | ObjectId;
  smallGroupId?: string | ObjectId;
  teams: TeamMembership[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: string | ObjectId;
  lastUpdatedBy?: string | ObjectId;
}

export interface MemberFormData extends Omit<Member, 'skills' | 'training' | 'teams' | 'spiritualGrowth'> {
  skills: Skill[];
  training: Training[];
  teams: TeamMembership[];
  spiritualGrowth: SpiritualGrowth;
}

export interface MemberFilters {
  search?: string;
  clusterId?: string;
  smallGroupId?: string;
  teamId?: string;
  spiritualGrowthStage?: keyof SpiritualGrowth;
  gender?: 'Male' | 'Female';
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  page?: number;
  limit?: number;
}

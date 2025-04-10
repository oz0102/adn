import { ObjectId } from 'mongoose';

export type ProgramFlyerStatus = 'Draft' | 'Published';

export interface ProgramFlyer {
  _id?: string | ObjectId;
  title: string;
  eventId: string | ObjectId;
  description: string;
  templateId: string | ObjectId;
  generatedContent: string;
  imageUrl: string;
  links: string[];
  status: ProgramFlyerStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy: string | ObjectId;
}

export interface ProgramFlyerWithDetails extends ProgramFlyer {
  eventDetails?: {
    _id: string | ObjectId;
    title: string;
    startDate: Date | string;
    endDate: Date | string;
  };
  templateDetails?: {
    _id: string | ObjectId;
    name: string;
    templateType: string;
  };
  creatorDetails?: {
    _id: string | ObjectId;
    email: string;
  };
}

export interface ProgramFlyerFormData extends Omit<ProgramFlyer, 'eventId' | 'templateId' | 'createdBy'> {
  eventId: string;
  templateId: string;
  createdBy?: string;
}

export interface ProgramFlyerFilters {
  search?: string;
  eventId?: string;
  templateId?: string;
  status?: ProgramFlyerStatus;
  page?: number;
  limit?: number;
}

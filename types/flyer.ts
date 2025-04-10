import { ObjectId } from 'mongoose';

export type TemplateType = 'Orientation' | 'Event' | 'Announcement' | 'Training' | 'Other';
export type PositionType = 'Top' | 'Middle' | 'Bottom' | 'Left' | 'Right' | 'Center';

export interface TemplateStructure {
  titlePosition: PositionType;
  descriptionPosition: PositionType;
  imagePosition: PositionType;
  linksPosition: PositionType;
}

export interface FlyerTemplate {
  _id?: string | ObjectId;
  name: string;
  description: string;
  templateType: TemplateType;
  backgroundImages: string[];
  templateStructure: TemplateStructure;
  promptTemplate: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy: string | ObjectId;
}

export interface FlyerTemplateWithCreator extends FlyerTemplate {
  creatorDetails?: {
    _id: string | ObjectId;
    email: string;
  };
}

export interface FlyerTemplateFormData extends Omit<FlyerTemplate, 'createdBy'> {
  createdBy?: string;
}

export interface FlyerTemplateFilters {
  search?: string;
  templateType?: TemplateType;
  page?: number;
  limit?: number;
}

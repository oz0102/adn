import { ObjectId } from 'mongoose';

export interface Report {
  _id?: string | ObjectId;
  reportType: string;
  title: string;
  description: string;
  dateRange: {
    startDate: Date | string;
    endDate: Date | string;
  };
  data: any; // Flexible structure based on report type
  generatedBy: string | ObjectId;
  createdAt?: Date | string;
}

export interface ReportWithGenerator extends Report {
  generatorDetails?: {
    _id: string | ObjectId;
    email: string;
  };
}

export interface ReportFormData extends Omit<Report, 'generatedBy'> {
  generatedBy?: string;
}

export interface ReportFilters {
  reportType?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  generatedBy?: string;
  page?: number;
  limit?: number;
}

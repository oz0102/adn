import { ObjectId } from 'mongoose';

// Export all types from individual type files
export * from './member';
export * from './cluster';
export * from './smallGroup';
export * from './team';
export * from './event';
export * from './attendance';
export * from './followUp';
export * from './notification';
export * from './discipleshipGoal';
export * from './flyer';
export * from './programFlyer';
export * from './auth';
export * from './report';

// Common types used across the application
export type ID = string | ObjectId;

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

export interface FileUploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface StatsCard {
  title: string;
  value: number | string;
  icon?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  period?: string;
}

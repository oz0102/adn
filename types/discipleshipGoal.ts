import { ObjectId } from 'mongoose';

export type DiscipleshipGoalStatus = 'In Progress' | 'Achieved' | 'Failed';

export interface WeeklyProgress {
  week: string; // Format: YYYY-WW
  count: number;
  newAdditions: number;
}

export interface DiscipleshipGoal {
  _id?: string | ObjectId;
  targetNumber: number;
  startDate: Date | string;
  endDate: Date | string;
  currentCount: number;
  weeklyProgress: WeeklyProgress[];
  status: DiscipleshipGoalStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy: string | ObjectId;
}

export interface DiscipleshipGoalWithCreator extends DiscipleshipGoal {
  creatorDetails?: {
    _id: string | ObjectId;
    email: string;
  };
}

export interface DiscipleshipGoalFormData extends Omit<DiscipleshipGoal, 'createdBy'> {
  createdBy?: string;
}

export interface DiscipleshipGoalFilters {
  status?: DiscipleshipGoalStatus;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
}

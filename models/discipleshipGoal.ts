import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklyProgress {
  week: string;
  count: number;
  newAdditions: number;
}

export interface IDiscipleshipGoal extends Document {
  targetNumber: number;
  startDate: Date;
  endDate: Date;
  currentCount: number;
  weeklyProgress: IWeeklyProgress[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const WeeklyProgressSchema = new Schema({
  week: { 
    type: String, 
    required: true,
    trim: true
  },
  count: { 
    type: Number, 
    required: true,
    min: 0
  },
  newAdditions: { 
    type: Number, 
    required: true,
    min: 0
  }
});

const DiscipleshipGoalSchema: Schema = new Schema(
  {
    targetNumber: { 
      type: Number, 
      required: true,
      min: 1
    },
    startDate: { 
      type: Date, 
      required: true
    },
    endDate: { 
      type: Date, 
      required: true
    },
    currentCount: { 
      type: Number, 
      required: true,
      default: 0,
      min: 0
    },
    weeklyProgress: [{ 
      type: WeeklyProgressSchema
    }],
    status: { 
      type: String, 
      required: true,
      enum: ['In Progress', 'Achieved', 'Failed'],
      default: 'In Progress'
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.DiscipleshipGoal || mongoose.model<IDiscipleshipGoal>('DiscipleshipGoal', DiscipleshipGoalSchema);

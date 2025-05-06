import mongoose, { Schema, Document } from 'mongoose';

export interface IWeeklyProgress {
  week: string; // YYYY-WW format
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
  level: 'HQ' | 'CENTER' | 'CLUSTER' | 'SMALL_GROUP' | 'INDIVIDUAL'; // Added field
  centerId?: mongoose.Types.ObjectId; // Added field, Ref to Center
  clusterId?: mongoose.Types.ObjectId; // Added field, Ref to Cluster
  smallGroupId?: mongoose.Types.ObjectId; // Added field, Ref to SmallGroup
  memberId?: mongoose.Types.ObjectId; // Added field, Ref to Member (if level is INDIVIDUAL)
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId; // Ref to User
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
}, { _id: false });

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
    level: {
      type: String,
      enum: ['HQ', 'CENTER', 'CLUSTER', 'SMALL_GROUP', 'INDIVIDUAL'],
      required: true
    }, // Added field
    centerId: {
      type: Schema.Types.ObjectId,
      ref: 'Center',
      sparse: true
    }, // Added field
    clusterId: {
      type: Schema.Types.ObjectId,
      ref: 'Cluster',
      sparse: true
    }, // Added field
    smallGroupId: {
      type: Schema.Types.ObjectId,
      ref: 'SmallGroup',
      sparse: true
    }, // Added field
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      sparse: true
    }, // Added field
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

// Add relevant indexes
DiscipleshipGoalSchema.index({ level: 1 });
DiscipleshipGoalSchema.index({ centerId: 1 });
DiscipleshipGoalSchema.index({ clusterId: 1 });
DiscipleshipGoalSchema.index({ smallGroupId: 1 });
DiscipleshipGoalSchema.index({ memberId: 1 });

// Custom validator to ensure correct IDs are present based on level
DiscipleshipGoalSchema.path('centerId').validate(function (value) {
  if (this.level === 'CENTER' || this.level === 'CLUSTER' || this.level === 'SMALL_GROUP') {
    return !!value;
  }
  return true;
}, 'Center ID is required for CENTER, CLUSTER, or SMALL_GROUP level goals.');

DiscipleshipGoalSchema.path('clusterId').validate(function (value) {
  if (this.level === 'CLUSTER' || this.level === 'SMALL_GROUP') {
    return !!value;
  }
  return true;
}, 'Cluster ID is required for CLUSTER or SMALL_GROUP level goals.');

DiscipleshipGoalSchema.path('smallGroupId').validate(function (value) {
  if (this.level === 'SMALL_GROUP') {
    return !!value;
  }
  return true;
}, 'Small Group ID is required for SMALL_GROUP level goals.');

DiscipleshipGoalSchema.path('memberId').validate(function (value) {
  if (this.level === 'INDIVIDUAL') {
    return !!value;
  }
  return true;
}, 'Member ID is required for INDIVIDUAL level goals.');


export default mongoose.models.DiscipleshipGoal || mongoose.model<IDiscipleshipGoal>('DiscipleshipGoal', DiscipleshipGoalSchema);


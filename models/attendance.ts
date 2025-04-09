import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceMember {
  memberId: mongoose.Types.ObjectId;
  status: string;
  checkInTime?: Date;
}

export interface IAttendance extends Document {
  eventId: mongoose.Types.ObjectId;
  eventType: string;
  date: Date;
  members: IAttendanceMember[];
  totalPresent: number;
  totalAbsent: number;
  totalExcused: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  recordedBy: mongoose.Types.ObjectId;
}

const AttendanceMemberSchema = new Schema({
  memberId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Member',
    required: true 
  },
  status: { 
    type: String, 
    required: true,
    enum: ['Present', 'Absent', 'Excused'],
    default: 'Absent'
  },
  checkInTime: { 
    type: Date
  }
});

const AttendanceSchema: Schema = new Schema(
  {
    eventId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Event',
      required: true
    },
    eventType: { 
      type: String, 
      required: true,
      enum: ['Sunday Service', 'Midweek Service', 'Cluster Meeting', 'Small Group', 'Training', 'Other']
    },
    date: { 
      type: Date, 
      required: true
    },
    members: [{ 
      type: AttendanceMemberSchema
    }],
    totalPresent: { 
      type: Number, 
      default: 0
    },
    totalAbsent: { 
      type: Number, 
      default: 0
    },
    totalExcused: { 
      type: Number, 
      default: 0
    },
    notes: { 
      type: String
    },
    recordedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

// Create indexes
AttendanceSchema.index({ eventId: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ 'members.memberId': 1 });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);

import mongoose, { Schema, Document } from 'mongoose';

// Define IAddress interface here to avoid import issues
export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface ICluster extends Document {
  clusterId: string;
  name: string;
  location: string;
  address: IAddress;
  leaderId?: mongoose.Types.ObjectId; // Made optional
  contactPhone: string;
  contactEmail: string;
  photo?: string;
  description: string;
  meetingSchedules: Array<{  // Changed to array of meeting schedules
    day: string;
    time: string;
    frequency: string;
  }>;
  centerId?: mongoose.Types.ObjectId; // Optional: Allows a cluster to be a regional grouping not directly parented by a single center.
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String }
});

const MeetingScheduleSchema = new Schema({
  day: { 
    type: String, 
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  time: { 
    type: String, 
    required: true 
  },
  frequency: { 
    type: String, 
    required: true,
    enum: ['Weekly', 'Bi-weekly', 'Monthly']
  }
});

const ClusterSchema: Schema = new Schema(
  {
    clusterId: { 
      type: String, 
      required: true, 
      trim: true
    },
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    location: { 
      type: String, 
      required: true,
      trim: true
    },
    address: { 
      type: AddressSchema,
      required: true
    },
    leaderId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Member',
      required: false  // Made optional
    },
    contactPhone: { 
      type: String,
      required: true,
      trim: true
    },
    contactEmail: { 
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    photo: { 
      type: String
    },
    description: { 
      type: String,
      required: true
    },
    meetingSchedules: { // Changed from meetingSchedule to meetingSchedules
      type: [MeetingScheduleSchema],
      required: true,
      validate: [
        {
          validator: function(schedules: any[]) {
            return schedules && schedules.length > 0;
          },
          message: 'At least one meeting schedule is required'
        }
      ]
    },
    centerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Center',
      required: false  // Optional: Allows a cluster to be a regional grouping not directly parented by a single center.
    }
  },
  { 
    timestamps: true 
  }
);

// Create indexes
ClusterSchema.index({ clusterId: 1 }, { unique: true });
ClusterSchema.index({ leaderId: 1 });
ClusterSchema.index({ centerId: 1 });

export default mongoose.models.Cluster || mongoose.model<ICluster>('Cluster', ClusterSchema);

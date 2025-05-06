import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './member'; // Assuming IAddress is in member.ts or a shared types file

export interface ISmallGroup extends Document {
  groupId: string;
  name: string;
  location: string;
  address: IAddress;
  leaderId: mongoose.Types.ObjectId; // Ref to Member
  contactPhone: string;
  contactEmail: string;
  photo?: string;
  description: string;
  meetingSchedule: {
    day: string;
    time: string;
    frequency: string;
  };
  clusterId: mongoose.Types.ObjectId; // Added: Ref to Cluster
  centerId: mongoose.Types.ObjectId; // Added: Ref to Center
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

const SmallGroupSchema: Schema = new Schema(
  {
    groupId: { 
      type: String, 
      required: true, 
      unique: true,
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
      required: true
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
    meetingSchedule: { 
      type: MeetingScheduleSchema,
      required: true
    },
    clusterId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Cluster',
      required: true 
    }, // Added field
    centerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Center',
      required: true 
    } // Added field
  },
  { 
    timestamps: true 
  }
);

// Create indexes
SmallGroupSchema.index({ groupId: 1 }, { unique: true });
SmallGroupSchema.index({ leaderId: 1 });
SmallGroupSchema.index({ clusterId: 1 }); // Added index
SmallGroupSchema.index({ centerId: 1 }); // Added index

export default mongoose.models.SmallGroup || mongoose.model<ISmallGroup>('SmallGroup', SmallGroupSchema);


import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './member';

export interface IEvent extends Document {
  title: string;
  description: string;
  eventType: string;
  startDate: Date;
  endDate: Date;
  location: string;
  address: IAddress;
  organizer: mongoose.Types.ObjectId;
  flyer?: string;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String }
});

const EventSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String, 
      required: true
    },
    eventType: { 
      type: String, 
      required: true,
      enum: ['Sunday Service', 'Midweek Service', 'Cluster Meeting', 'Small Group', 'Training', 'Other']
    },
    startDate: { 
      type: Date, 
      required: true
    },
    endDate: { 
      type: Date, 
      required: true
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
    organizer: { 
      type: Schema.Types.ObjectId, 
      ref: 'Team',
      required: true
    },
    flyer: { 
      type: String
    },
    reminderSent: { 
      type: Boolean, 
      default: false
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

// Create indexes
EventSchema.index({ startDate: 1 });
EventSchema.index({ eventType: 1 });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

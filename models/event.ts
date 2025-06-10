import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './member'; // Assuming IAddress is in member.ts or a shared types file

export interface IEvent extends Document {
  title: string;
  description: string;
  eventType: string;
  startDate: Date;
  endDate: Date;
  location: string;
  address: IAddress;
  organizer: mongoose.Types.ObjectId; // Ref to Team
  flyer?: string;
  reminderSent: boolean;
  scope: 'HQ' | 'CENTER'; // Added field
  centerId?: mongoose.Types.ObjectId; // Added field, Ref to Center, sparse if scope is HQ
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId; // Ref to User
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
    scope: {
      type: String,
      enum: ['GLOBAL', 'CENTER'],
      required: true
    }, // Added field
    centerId: {
      type: Schema.Types.ObjectId,
      ref: 'Center',
      // sparse: true, // Required if scope is 'CENTER', otherwise can be null
      // Add a custom validator if needed to enforce this based on scope value
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

// Create indexes
EventSchema.index({ startDate: 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ scope: 1 }); // Added index
EventSchema.index({ centerId: 1 }); // Added index

// Custom validator to ensure centerId is present if scope is 'CENTER'
EventSchema.path('centerId').validate(function (value) {
  if (this.scope === 'CENTER') {
    return !!value;
  }
  return true;
}, 'Center ID is required when event scope is CENTER.');

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);


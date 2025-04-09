import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUpAttempt {
  attemptNumber: number;
  date: Date;
  contactMethod: string;
  response: string;
  notes?: string;
  conductedBy: mongoose.Types.ObjectId;
}

export interface INewAttendee {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  whatsappNumber?: string;
  address?: string;
  visitDate: Date;
  referredBy?: mongoose.Types.ObjectId;
}

export interface IMissedEvent {
  eventId: mongoose.Types.ObjectId;
  eventDate: Date;
  eventType: string;
}

export interface IFollowUp extends Document {
  personType: string;
  personId?: mongoose.Types.ObjectId;
  newAttendee?: INewAttendee;
  missedEvent?: IMissedEvent;
  status: string;
  assignedTo: mongoose.Types.ObjectId;
  attempts: IFollowUpAttempt[];
  nextFollowUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpAttemptSchema = new Schema({
  attemptNumber: { 
    type: Number, 
    required: true,
    min: 1
  },
  date: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  contactMethod: { 
    type: String, 
    required: true,
    enum: ['Email', 'SMS', 'WhatsApp', 'Call', 'In Person']
  },
  response: { 
    type: String, 
    required: true,
    enum: ['Positive', 'Negative', 'No Response']
  },
  notes: { 
    type: String
  },
  conductedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  }
});

const NewAttendeeSchema = new Schema({
  firstName: { 
    type: String, 
    required: true,
    trim: true
  },
  lastName: { 
    type: String, 
    required: true,
    trim: true
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true
  },
  phoneNumber: { 
    type: String,
    required: true,
    trim: true
  },
  whatsappNumber: { 
    type: String,
    trim: true
  },
  address: { 
    type: String
  },
  visitDate: { 
    type: Date,
    required: true
  },
  referredBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'Member'
  }
});

const MissedEventSchema = new Schema({
  eventId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Event',
    required: true
  },
  eventDate: { 
    type: Date,
    required: true
  },
  eventType: { 
    type: String,
    required: true
  }
});

const FollowUpSchema: Schema = new Schema(
  {
    personType: { 
      type: String, 
      required: true,
      enum: ['New Attendee', 'Member']
    },
    personId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Member'
    },
    newAttendee: { 
      type: NewAttendeeSchema
    },
    missedEvent: { 
      type: MissedEventSchema
    },
    status: { 
      type: String, 
      required: true,
      enum: ['Pending', 'In Progress', 'Completed', 'Failed'],
      default: 'Pending'
    },
    assignedTo: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    attempts: [{ 
      type: FollowUpAttemptSchema
    }],
    nextFollowUpDate: { 
      type: Date
    }
  },
  { 
    timestamps: true 
  }
);

// Create indexes
FollowUpSchema.index({ personId: 1 });
FollowUpSchema.index({ status: 1 });
FollowUpSchema.index({ nextFollowUpDate: 1 });
FollowUpSchema.index({ assignedTo: 1 });

export default mongoose.models.FollowUp || mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);

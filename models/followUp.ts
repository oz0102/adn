// import mongoose, { Schema, Document } from 'mongoose';

// export interface IFollowUpAttempt {
//   attemptNumber: number;
//   date: Date;
//   contactMethod: string;
//   response: string;
//   notes?: string;
//   conductedBy: mongoose.Types.ObjectId;
// }

// export interface INewAttendee {
//   firstName: string;
//   lastName: string;
//   email?: string;
//   phoneNumber: string;
//   whatsappNumber?: string;
//   address?: string;
//   visitDate: Date;
//   referredBy?: mongoose.Types.ObjectId;
// }

// export interface IMissedEvent {
//   eventId: mongoose.Types.ObjectId;
//   eventDate: Date;
//   eventType: string;
// }

// export interface IFollowUp extends Document {
//   personType: string;
//   personId?: mongoose.Types.ObjectId;
//   newAttendee?: INewAttendee;
//   missedEvent?: IMissedEvent;
//   status: string;
//   assignedTo: mongoose.Types.ObjectId;
//   attempts: IFollowUpAttempt[];
//   nextFollowUpDate?: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const FollowUpAttemptSchema = new Schema({
//   attemptNumber: { 
//     type: Number, 
//     required: true,
//     min: 1
//   },
//   date: { 
//     type: Date, 
//     required: true,
//     default: Date.now
//   },
//   contactMethod: { 
//     type: String, 
//     required: true,
//     enum: ['Email', 'SMS', 'WhatsApp', 'Call', 'In Person']
//   },
//   response: { 
//     type: String, 
//     required: true,
//     enum: ['Positive', 'Negative', 'No Response']
//   },
//   notes: { 
//     type: String
//   },
//   conductedBy: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'User',
//     required: true
//   }
// });

// const NewAttendeeSchema = new Schema({
//   firstName: { 
//     type: String, 
//     required: true,
//     trim: true
//   },
//   lastName: { 
//     type: String, 
//     required: true,
//     trim: true
//   },
//   email: { 
//     type: String,
//     trim: true,
//     lowercase: true
//   },
//   phoneNumber: { 
//     type: String,
//     required: true,
//     trim: true
//   },
//   whatsappNumber: { 
//     type: String,
//     trim: true
//   },
//   address: { 
//     type: String
//   },
//   visitDate: { 
//     type: Date,
//     required: true
//   },
//   referredBy: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'Member'
//   }
// });

// const MissedEventSchema = new Schema({
//   eventId: { 
//     type: Schema.Types.ObjectId, 
//     ref: 'Event',
//     required: true
//   },
//   eventDate: { 
//     type: Date,
//     required: true
//   },
//   eventType: { 
//     type: String,
//     required: true
//   }
// });

// const FollowUpSchema: Schema = new Schema(
//   {
//     personType: { 
//       type: String, 
//       required: true,
//       enum: ['New Attendee', 'Member']
//     },
//     personId: { 
//       type: Schema.Types.ObjectId, 
//       ref: 'Member'
//     },
//     newAttendee: { 
//       type: NewAttendeeSchema
//     },
//     missedEvent: { 
//       type: MissedEventSchema
//     },
//     status: { 
//       type: String, 
//       required: true,
//       enum: ['Pending', 'In Progress', 'Completed', 'Failed'],
//       default: 'Pending'
//     },
//     assignedTo: { 
//       type: Schema.Types.ObjectId, 
//       ref: 'User',
//       required: true
//     },
//     attempts: [{ 
//       type: FollowUpAttemptSchema
//     }],
//     nextFollowUpDate: { 
//       type: Date
//     }
//   },
//   { 
//     timestamps: true 
//   }
// );

// // Create indexes
// FollowUpSchema.index({ personId: 1 });
// FollowUpSchema.index({ status: 1 });
// FollowUpSchema.index({ nextFollowUpDate: 1 });
// FollowUpSchema.index({ assignedTo: 1 });

// export default mongoose.models.FollowUp || mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);


// models/followUp.ts - Updated Model Schema
import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUpAttempt {
  attemptNumber: number;
  date: Date;
  contactMethod: string; // 'Email', 'SMS', 'WhatsApp', 'Call', 'In Person'
  response: string; // 'Positive', 'Negative', 'No Response'
  notes?: string;
  prayerRequests?: string[];
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
  invitedFor?: string; // e.g., 'Sunday Service', 'Breakfast Meeting'
}

export interface IMissedEvent {
  eventId: mongoose.Types.ObjectId;
  eventDate: Date;
  eventType: string;
}

export interface IHandoffDetails {
  clusterId: mongoose.Types.ObjectId;
  clusterLeadId: mongoose.Types.ObjectId;
  handoffDate: Date;
  notes: string;
}

export interface IFollowUp extends Document {
  personType: string; // 'Member', 'Attendee', 'Unregistered Guest', 'New Convert'
  personId?: mongoose.Types.ObjectId; // For 'Member' type
  attendeeId?: mongoose.Types.ObjectId; // For 'Attendee' type
  newAttendee?: INewAttendee; // For 'Unregistered Guest' type
  missedEvent?: IMissedEvent;
  status: string; // 'Pending', 'In Progress', 'Completed', 'Failed'
  responseCategory: string; // 'Promising', 'Undecided', 'Cold' (corresponds to Green, Yellow, Red in spreadsheet)
  assignedTo: mongoose.Types.ObjectId;
  attempts: IFollowUpAttempt[];
  requiredAttempts: number; // Configurable based on person type
  frequency: string; // e.g., '2/week', '1/week'
  nextFollowUpDate?: Date;
  handedOffToCluster?: IHandoffDetails;
  prayerRequests?: string[]; // To track prayer needs from the call script
  scheduleEndDate?: Date; // When follow-up period should end
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
  prayerRequests: [{ 
    type: String 
  }],
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
  },
  invitedFor: {
    type: String
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

const HandoffDetailsSchema = new Schema({
  clusterId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Cluster',
    required: true
  },
  clusterLeadId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  handoffDate: { 
    type: Date,
    default: Date.now,
    required: true
  },
  notes: { 
    type: String
  }
});

const FollowUpSchema: Schema = new Schema(
  {
    personType: { 
      type: String, 
      required: true,
      enum: ['Member', 'Attendee', 'Unregistered Guest', 'New Convert']
    },
    personId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Member', // Link to Member if personType is 'Member'
      optional: true
    },
    attendeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Attendee', // Link to Attendee if personType is 'Attendee'
      optional: true
    },
    newAttendee: { 
      type: NewAttendeeSchema // For 'Unregistered Guest'
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
    responseCategory: {
      type: String,
      enum: ['Promising', 'Undecided', 'Cold'],
      default: 'Undecided'
    },
    assignedTo: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    attempts: [{ 
      type: FollowUpAttemptSchema
    }],
    requiredAttempts: {
      type: Number,
      default: 8,
      min: 1
    },
    frequency: {
      type: String,
      default: '2/week',
      enum: ['1/week', '2/week', '3/week', 'custom']
    },
    nextFollowUpDate: { 
      type: Date
    },
    handedOffToCluster: {
      type: HandoffDetailsSchema
    },
    prayerRequests: [{
      type: String
    }],
    scheduleEndDate: {
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
FollowUpSchema.index({ attendeeId: 1 });
FollowUpSchema.index({ responseCategory: 1 });
FollowUpSchema.index({ 'handedOffToCluster.clusterId': 1 });

export default mongoose.models.FollowUp || mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);

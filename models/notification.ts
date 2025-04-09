import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  type: string;
  recipient: {
    memberId: mongoose.Types.ObjectId;
    email?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
  };
  subject: string;
  content: string;
  relatedTo: {
    type: string;
    id: mongoose.Types.ObjectId;
  };
  status: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RecipientSchema = new Schema({
  memberId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Member',
    required: true
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true
  },
  phoneNumber: { 
    type: String,
    trim: true
  },
  whatsappNumber: { 
    type: String,
    trim: true
  }
});

const RelatedToSchema = new Schema({
  type: { 
    type: String, 
    required: true,
    enum: ['Event', 'Birthday', 'Follow-up', 'Training', 'Other']
  },
  id: { 
    type: Schema.Types.ObjectId, 
    required: true
  }
});

const NotificationSchema: Schema = new Schema(
  {
    type: { 
      type: String, 
      required: true,
      enum: ['Email', 'SMS', 'WhatsApp']
    },
    recipient: { 
      type: RecipientSchema,
      required: true
    },
    subject: { 
      type: String, 
      required: true,
      trim: true
    },
    content: { 
      type: String, 
      required: true
    },
    relatedTo: { 
      type: RelatedToSchema,
      required: true
    },
    status: { 
      type: String, 
      required: true,
      enum: ['Pending', 'Sent', 'Failed'],
      default: 'Pending'
    },
    sentAt: { 
      type: Date
    }
  },
  { 
    timestamps: true 
  }
);

// Create indexes
NotificationSchema.index({ 'recipient.memberId': 1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ sentAt: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

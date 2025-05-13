import mongoose, { Schema, Document } from 'mongoose';

// Define and export Enums for NotificationType, NotificationLevel, NotificationStatus
export enum NotificationType {
  EMAIL = 'Email',
  SMS = 'SMS',
  WHATSAPP = 'WhatsApp',
  IN_APP = 'IN_APP' // Added IN_APP type
}

export enum NotificationLevel {
  HQ = 'HQ',
  CENTER = 'CENTER',
  CLUSTER = 'CLUSTER',
  SMALL_GROUP = 'SMALL_GROUP',
  MEMBER = 'MEMBER'
}

export enum NotificationStatus {
  PENDING = 'Pending',
  SENT = 'Sent',
  FAILED = 'Failed',
  READ = 'Read' // Added READ status for IN_APP
}

export interface INotification extends Document {
  type: NotificationType;
  recipient: {
    memberId?: mongoose.Types.ObjectId; 
    email?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
  };
  subject?: string; // Made optional as IN_APP might not need it
  content: string;
  relatedTo?: {
    type: string;
    id: mongoose.Types.ObjectId;
  };
  status: NotificationStatus;
  sentAt?: Date;
  readAt?: Date; // Added for IN_APP notifications
  isRead?: boolean; // Added for IN_APP notifications, default false
  failedReason?: string; // Added to store reason for failure
  targetLevel: NotificationLevel; 
  targetId?: mongoose.Types.ObjectId; 
  originatorCenterId?: mongoose.Types.ObjectId; 
  createdBy?: mongoose.Types.ObjectId; // Added createdBy
  createdAt: Date;
  updatedAt: Date;
}

const RecipientSchema = new Schema({
  memberId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Member'
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
}, { _id: false });

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
}, { _id: false });

const NotificationSchema: Schema = new Schema(
  {
    type: { 
      type: String, 
      required: true,
      enum: Object.values(NotificationType) // Use enum values
    },
    recipient: { 
      type: RecipientSchema,
    },
    subject: { 
      type: String, 
      // required: true, // Made optional
      trim: true,
      validate: {
        validator: function(value: any): boolean {
          // Use type assertion to access document properties
          const doc = this as unknown as INotification;
          return doc.type === NotificationType.EMAIL ? !!value : true;
        },
        message: 'Email subject is required for EMAIL notifications'
      }
    },
    content: { 
      type: String, 
      required: true
    },
    relatedTo: { 
      type: RelatedToSchema
    },
    status: { 
      type: String, 
      required: true,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING
    },
    sentAt: { 
      type: Date
    },
    readAt: { // Added
      type: Date
    },
    isRead: { // Added
      type: Boolean,
      default: false
    },
    failedReason: { // Added
      type: String
    },
    targetLevel: {
      type: String,
      enum: Object.values(NotificationLevel),
      required: true
    }, 
    targetId: {
      type: Schema.Types.ObjectId
      // sparse: true 
    }, 
    originatorCenterId: {
      type: Schema.Types.ObjectId,
      ref: 'Center'
      // sparse: true
    }, 
    createdBy: { // Added
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { 
    timestamps: true 
  }
);

NotificationSchema.index({ 'recipient.memberId': 1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ sentAt: 1 });
NotificationSchema.index({ targetLevel: 1 });
NotificationSchema.index({ targetId: 1 });
NotificationSchema.index({ originatorCenterId: 1 });
NotificationSchema.index({ createdBy: 1 }); // Added index
NotificationSchema.index({ isRead: 1 }); // Added index

NotificationSchema.path('recipient').validate(function(value: any): boolean {
  // Use double type assertion for safety
  const doc = this as unknown as INotification;
  if (doc.targetLevel === NotificationLevel.MEMBER && !doc.targetId && (!value || !value.memberId && !value.email && !value.phoneNumber)) {
    return false; 
  }
  return true;
}, 'Recipient details or targetId are required for MEMBER level notifications.');

NotificationSchema.path('targetId').validate(function(value: any): boolean {
  // Use double type assertion for safety
  const doc = this as unknown as INotification;
  if (doc.targetLevel !== NotificationLevel.HQ && !value) {
    return false; 
  }
  return true;
}, 'Target ID is required for CENTER, CLUSTER, SMALL_GROUP, or MEMBER level notifications.');

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

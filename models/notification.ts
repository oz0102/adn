import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  type: 'Email' | 'SMS' | 'WhatsApp';
  recipient: {
    memberId?: mongoose.Types.ObjectId; // Optional if targetLevel is not MEMBER
    email?: string;
    phoneNumber?: string;
    whatsappNumber?: string;
  };
  subject: string;
  content: string;
  relatedTo?: {
    type: string;
    id: mongoose.Types.ObjectId;
  };
  status: 'Pending' | 'Sent' | 'Failed';
  sentAt?: Date;
  targetLevel: 'HQ' | 'CENTER' | 'CLUSTER' | 'SMALL_GROUP' | 'MEMBER'; // Added field
  targetId?: mongoose.Types.ObjectId; // Added field (references Center, Cluster, SmallGroup, or Member)
  originatorCenterId?: mongoose.Types.ObjectId; // Added field, Ref to Center
  createdAt: Date;
  updatedAt: Date;
}

const RecipientSchema = new Schema({
  memberId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Member'
    // Not strictly required here, as targetId might point to a member directly or a group
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
    // Consider adding a 'refPath' if 'id' can refer to different collections based on 'type'
  }
}, { _id: false });

const NotificationSchema: Schema = new Schema(
  {
    type: { 
      type: String, 
      required: true,
      enum: ['Email', 'SMS', 'WhatsApp']
    },
    recipient: { 
      type: RecipientSchema,
      // Recipient details might be derived based on targetLevel and targetId, 
      // or explicitly provided for direct member notifications.
      // Making it not strictly required at schema root if targetLevel is not MEMBER.
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
      type: RelatedToSchema
    },
    status: { 
      type: String, 
      required: true,
      enum: ['Pending', 'Sent', 'Failed'],
      default: 'Pending'
    },
    sentAt: { 
      type: Date
    },
    targetLevel: {
      type: String,
      enum: ['HQ', 'CENTER', 'CLUSTER', 'SMALL_GROUP', 'MEMBER'],
      required: true
    }, // Added field
    targetId: {
      type: Schema.Types.ObjectId,
      // refPath: 'targetLevelRefPath' // If targetId can refer to different models based on targetLevel
      // For simplicity, direct reference might require service-level logic to determine the correct model.
      sparse: true // Can be null if targetLevel is HQ (all users)
    }, // Added field
    originatorCenterId: {
      type: Schema.Types.ObjectId,
      ref: 'Center',
      sparse: true
    } // Added field
  },
  { 
    timestamps: true 
  }
);

// Create indexes
NotificationSchema.index({ 'recipient.memberId': 1 });
NotificationSchema.index({ status: 1 });
NotificationSchema.index({ sentAt: 1 });
NotificationSchema.index({ targetLevel: 1 });
NotificationSchema.index({ targetId: 1 });
NotificationSchema.index({ originatorCenterId: 1 });

// Validator to ensure recipient or targetId is present based on targetLevel
NotificationSchema.path('recipient').validate(function (value) {
  if (this.targetLevel === 'MEMBER' && !this.targetId && (!value || !value.memberId && !value.email && !value.phoneNumber)) {
    return false; // If MEMBER target, need recipient details or targetId pointing to member
  }
  return true;
}, 'Recipient details or targetId are required for MEMBER level notifications.');

NotificationSchema.path('targetId').validate(function (value) {
  if (this.targetLevel !== 'HQ' && !value) {
    return false; // targetId is required if not an HQ-wide notification
  }
  return true;
}, 'Target ID is required for CENTER, CLUSTER, SMALL_GROUP, or MEMBER level notifications.');


export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);


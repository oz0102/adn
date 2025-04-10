import { ObjectId } from 'mongoose';

export type NotificationType = 'Email' | 'SMS' | 'WhatsApp';
export type NotificationStatus = 'Pending' | 'Sent' | 'Failed';
export type RelatedEntityType = 'Event' | 'Birthday' | 'Follow-up' | 'Training' | 'Other';

export interface NotificationRecipient {
  memberId: string | ObjectId;
  email?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
}

export interface NotificationRelatedTo {
  type: RelatedEntityType;
  id: string | ObjectId;
}

export interface Notification {
  _id?: string | ObjectId;
  type: NotificationType;
  recipient: NotificationRecipient;
  subject: string;
  content: string;
  relatedTo: NotificationRelatedTo;
  status: NotificationStatus;
  sentAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface NotificationWithDetails extends Notification {
  recipientDetails?: {
    _id: string | ObjectId;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
  };
  relatedEntityDetails?: {
    title?: string;
    name?: string;
    date?: Date | string;
  };
}

export interface NotificationFormData extends Omit<Notification, 'recipient' | 'relatedTo'> {
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientWhatsapp?: string;
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
}

export interface NotificationFilters {
  type?: NotificationType;
  status?: NotificationStatus;
  recipientId?: string;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
}

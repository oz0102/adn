import mongoose, { Schema, Document } from 'mongoose';

// Assuming IAddress is defined elsewhere, e.g., in member.ts or a shared types file
// For now, let's define a placeholder if not readily available to avoid import errors during this step
interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface ICenter extends Document {
  name: string;
  location?: string; // Or a structured address object
  address?: IAddress; // Re-use from member.ts if suitable
  centerAdmins: mongoose.Types.ObjectId[]; // Ref to Users
  // parentHQId: mongoose.Types.ObjectId; // If multiple HQs, else implicit
  createdAt: Date;
  updatedAt: Date;

  // Center-specific communication credentials
  useCenterSpecificSms: boolean;
  centerSmsApiToken?: string; // Potentially encrypted
  centerSmsSenderName?: string;
  useCenterSpecificWhatsApp: boolean;
  centerWhatsAppPhoneNumberId?: string;
  centerWhatsAppAccessToken?: string; // Potentially encrypted
  useCenterSpecificEmail: boolean;
  centerZeptomailToken?: string; // Potentially encrypted
  centerEmailFrom?: string;
}

const CenterSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    location: { type: String, trim: true },
    // address: { type: AddressSchema }, // If using structured address, ensure AddressSchema is defined and imported
    centerAdmins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    // parentHQId: { type: Schema.Types.ObjectId, ref: 'HQ' }, // If HQ is a collection

    useCenterSpecificSms: { type: Boolean, default: false },
    centerSmsApiToken: { type: String, trim: true },
    centerSmsSenderName: { type: String, trim: true },
    useCenterSpecificWhatsApp: { type: Boolean, default: false },
    centerWhatsAppPhoneNumberId: { type: String, trim: true },
    centerWhatsAppAccessToken: { type: String, trim: true },
    useCenterSpecificEmail: { type: Boolean, default: false },
    centerZeptomailToken: { type: String, trim: true },
    centerEmailFrom: { type: String, trim: true, lowercase: true },
  },
  { timestamps: true }
);

// A common pattern for Next.js with Mongoose is to check if the model already exists
export default mongoose.models.Center || mongoose.model<ICenter>('Center', CenterSchema);


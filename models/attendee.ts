import mongoose, { Schema, Document } from 'mongoose';

// Interface for Address (can be shared or defined per model)
// For now, defining it locally for this model.
// Consider moving to a shared types directory if used by many models.
export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface IAttendee extends Document {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  whatsappNumber?: string;
  // Flattened address fields for simplicity, can be a sub-document with IAddress if preferred
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_country?: string;
  address_postalCode?: string;
  centerId: mongoose.Schema.Types.ObjectId; // Required link to a Center
  clusterId?: mongoose.Schema.Types.ObjectId; // Optional link to a Cluster
  firstAttendanceDate: Date;
  lastAttendanceDate: Date;
  attendanceCount: number;
  level: 'First-Timer' | 'Occasional Attendee' | 'Regular Attendee';
  tags: string[];
  notes?: string;
  createdBy?: mongoose.Schema.Types.ObjectId; // User who created this attendee record
  updatedBy?: mongoose.Schema.Types.ObjectId; // User who last updated this attendee record
  // Timestamps (createdAt, updatedAt) are added by Mongoose option below
}

const AttendeeSchema: Schema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true }, // sparse for optional unique fields
    phoneNumber: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, trim: true },
    address_street: { type: String, trim: true },
    address_city: { type: String, trim: true },
    address_state: { type: String, trim: true },
    address_country: { type: String, trim: true },
    address_postalCode: { type: String, trim: true },
    centerId: { type: Schema.Types.ObjectId, ref: 'Center', required: true },
    clusterId: { type: Schema.Types.ObjectId, ref: 'Cluster' },
    firstAttendanceDate: { type: Date, required: true, default: Date.now },
    lastAttendanceDate: { type: Date, required: true, default: Date.now },
    attendanceCount: { type: Number, default: 1 },
    level: {
      type: String,
      enum: ['First-Timer', 'Occasional Attendee', 'Regular Attendee'],
      default: 'First-Timer',
    },
    tags: [{ type: String }],
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Indexes
AttendeeSchema.index({ centerId: 1 });
AttendeeSchema.index({ phoneNumber: 1, centerId: 1 }); // Index phone number within a center
AttendeeSchema.index({ email: 1, centerId: 1 }, { sparse: true }); // Sparse index for optional unique email within a center
AttendeeSchema.index({ clusterId: 1 });
AttendeeSchema.index({ level: 1 });
AttendeeSchema.index({ firstAttendanceDate: 1 });
AttendeeSchema.index({ lastAttendanceDate: 1 });

// Export the model, ensuring it's not re-defined if already compiled
export default mongoose.models.Attendee || mongoose.model<IAttendee>('Attendee', AttendeeSchema);

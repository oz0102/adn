import mongoose, { Schema, Document } from "mongoose";

export type SocialMediaPlatform = "Facebook" | "Instagram" | "Twitter" | "YouTube" | "LinkedIn" | "TikTok" | "Other";

export interface IFollowerHistoryEntry {
  date: Date;
  count: number;
}

export interface ISocialMediaAccount extends Document {
  platform: SocialMediaPlatform;
  username: string;
  link: string;
  followerCount: number;
  lastFollowerUpdate?: Date;
  followerHistory: IFollowerHistoryEntry[];
  scope: "HQ" | "CENTER"; // To define if it's an HQ account or Center-specific
  centerId?: mongoose.Types.ObjectId; // Required if scope is "CENTER"
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId; // User who added this account
}

const FollowerHistorySchema = new Schema({
  date: { type: Date, required: true },
  count: { type: Number, required: true, min: 0 }
}, { _id: false });

const SocialMediaAccountSchema: Schema = new Schema(
  {
    platform: {
      type: String,
      required: true,
      enum: ["Facebook", "Instagram", "Twitter", "YouTube", "LinkedIn", "TikTok", "Other"]
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    link: {
      type: String,
      required: true,
      trim: true
    },
    followerCount: {
      type: Number,
      default: 0,
      min: 0
    },
    lastFollowerUpdate: { type: Date },
    followerHistory: [{ type: FollowerHistorySchema }],
    scope: {
      type: String,
      enum: ["HQ", "CENTER"],
      required: true,
      default: "HQ"
    },
    centerId: {
      type: Schema.Types.ObjectId,
      ref: "Center",
      sparse: true // Required if scope is "CENTER"
    },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

// Compound index for platform, username, and centerId (if present) to ensure uniqueness per scope
SocialMediaAccountSchema.index({ platform: 1, username: 1, centerId: 1 }, { unique: true, partialFilterExpression: { centerId: { $exists: true } } });
SocialMediaAccountSchema.index({ platform: 1, username: 1, scope: 1 }, { unique: true, partialFilterExpression: { centerId: { $exists: false }, scope: "HQ" } });

SocialMediaAccountSchema.index({ scope: 1 });
SocialMediaAccountSchema.index({ centerId: 1 });

// Custom validator to ensure centerId is present if scope is "CENTER"
SocialMediaAccountSchema.path("centerId").validate(function (value: any) {
  if (this.scope === "CENTER") {
    return !!value;
  }
  return true;
}, "Center ID is required when social media account scope is CENTER.");

export default mongoose.models.SocialMediaAccount || mongoose.model<ISocialMediaAccount>("SocialMediaAccount", SocialMediaAccountSchema);


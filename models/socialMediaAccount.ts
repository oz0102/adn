import mongoose, { Schema, Document } from "mongoose";

// Changed from type to enum to allow runtime usage (e.g., Object.values)
export enum SocialMediaPlatform {
  Facebook = "Facebook",
  Instagram = "Instagram",
  Twitter = "Twitter",
  YouTube = "YouTube",
  LinkedIn = "LinkedIn",
  TikTok = "TikTok",
  Other = "Other"
}

export interface IFollowerHistoryEntry {
  date: Date;
  count: number;
}

export interface ISocialMediaAccount extends Document {
  platform: SocialMediaPlatform; // Now uses the enum
  username: string;
  link: string;
  followerCount: number;
  lastFollowerUpdate?: Date;
  followerHistory: IFollowerHistoryEntry[];
  scope: "HQ" | "CENTER";
  centerId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
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
      enum: Object.values(SocialMediaPlatform) // Use enum values for Mongoose enum validator
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
      sparse: true
    },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

SocialMediaAccountSchema.index({ platform: 1, username: 1, centerId: 1 }, { unique: true, partialFilterExpression: { centerId: { $exists: true } } });
SocialMediaAccountSchema.index({ platform: 1, username: 1, scope: 1 }, { unique: true, partialFilterExpression: { centerId: { $exists: false }, scope: "HQ" } });
SocialMediaAccountSchema.index({ scope: 1 });
SocialMediaAccountSchema.index({ centerId: 1 });

SocialMediaAccountSchema.path("centerId").validate(function (value: any) {
  if (this.scope === "CENTER") {
    return !!value;
  }
  return true;
}, "Center ID is required when social media account scope is CENTER.");

const SocialMediaAccountModel = mongoose.models.SocialMediaAccount || mongoose.model<ISocialMediaAccount>("SocialMediaAccount", SocialMediaAccountSchema);

export default SocialMediaAccountModel;


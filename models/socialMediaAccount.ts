//adn\models\socialMediaAccount.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the supported social media platforms
export enum SocialMediaPlatform {
  TWITTER = 'Twitter',
  FACEBOOK = 'Facebook',
  YOUTUBE = 'YouTube',
  INSTAGRAM = 'Instagram',
  TIKTOK = 'TikTok',
  TELEGRAM = 'Telegram'
}

// Interface for follower history records
export interface FollowerRecord {
  count: number;
  date: Date;
}

// Interface for growth metrics
export interface GrowthResult {
  count: number;
  percentage: number;
}

// Interface for the social media account document
export interface ISocialMediaAccount extends Document {
  platform: SocialMediaPlatform;
  username: string;
  url: string;
  currentFollowers: number;
  followerHistory: FollowerRecord[];
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
  // Add method signatures to interface
  getWeeklyGrowth(): GrowthResult;
  getMonthlyGrowth(): GrowthResult;
}

// Schema for follower history records
const FollowerRecordSchema = new Schema<FollowerRecord>(
  {
    count: { type: Number, required: true },
    date: { type: Date, required: true }
  },
  { _id: false }
);

// Schema for social media accounts
const SocialMediaAccountSchema = new Schema<ISocialMediaAccount>(
  {
    platform: {
      type: String,
      enum: Object.values(SocialMediaPlatform),
      required: true
    },
    username: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    currentFollowers: {
      type: Number,
      default: 0
    },
    followerHistory: {
      type: [FollowerRecordSchema],
      default: []
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create a compound index on platform and username to ensure uniqueness
SocialMediaAccountSchema.index({ platform: 1, username: 1 }, { unique: true });

// Helper methods to calculate growth
SocialMediaAccountSchema.methods.getWeeklyGrowth = function(this: ISocialMediaAccount): GrowthResult {
  const history = this.followerHistory;
  if (history.length < 2) return { count: 0, percentage: 0 };
  
  // Find record from 7 days ago
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Find the closest record to 7 days ago
  const weekAgoRecord = history
    .filter((record: FollowerRecord) => record.date <= weekAgo)
    .sort((a: FollowerRecord, b: FollowerRecord) => b.date.getTime() - a.date.getTime())[0];
  
  if (!weekAgoRecord) return { count: 0, percentage: 0 };
  
  const growth = this.currentFollowers - weekAgoRecord.count;
  const percentage = weekAgoRecord.count > 0 
    ? (growth / weekAgoRecord.count) * 100 
    : 0;
  
  return { count: growth, percentage };
};

SocialMediaAccountSchema.methods.getMonthlyGrowth = function(this: ISocialMediaAccount): GrowthResult {
  const history = this.followerHistory;
  if (history.length < 2) return { count: 0, percentage: 0 };
  
  // Find record from 30 days ago
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  // Find the closest record to 30 days ago
  const monthAgoRecord = history
    .filter((record: FollowerRecord) => record.date <= monthAgo)
    .sort((a: FollowerRecord, b: FollowerRecord) => b.date.getTime() - a.date.getTime())[0];
  
  if (!monthAgoRecord) return { count: 0, percentage: 0 };
  
  const growth = this.currentFollowers - monthAgoRecord.count;
  const percentage = monthAgoRecord.count > 0 
    ? (growth / monthAgoRecord.count) * 100 
    : 0;
  
  return { count: growth, percentage };
};

// Create or retrieve the model
// Fix for "Cannot read properties of undefined" error by safely checking if mongoose.models exists
const SocialMediaAccount: Model<ISocialMediaAccount> = 
  (mongoose.models && mongoose.models.SocialMediaAccount as Model<ISocialMediaAccount>) || 
  mongoose.model<ISocialMediaAccount>('SocialMediaAccount', SocialMediaAccountSchema);

export default SocialMediaAccount;
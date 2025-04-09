import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description: string;
  leaderId: mongoose.Types.ObjectId;
  assistantLeaderIds: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  responsibilities: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      unique: true,
      trim: true
    },
    description: { 
      type: String, 
      required: true
    },
    leaderId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Member',
      required: true
    },
    assistantLeaderIds: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Member'
    }],
    members: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'Member'
    }],
    responsibilities: [{ 
      type: String
    }]
  },
  { 
    timestamps: true 
  }
);

// Create indexes
TeamSchema.index({ name: 1 }, { unique: true });
TeamSchema.index({ leaderId: 1 });

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IProgramFlyer extends Document {
  title: string;
  eventId: mongoose.Types.ObjectId;
  description: string;
  templateId: mongoose.Types.ObjectId;
  generatedContent: string;
  imageUrl: string;
  links: string[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const ProgramFlyerSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    eventId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Event',
      required: true
    },
    description: { 
      type: String, 
      required: true
    },
    templateId: { 
      type: Schema.Types.ObjectId, 
      ref: 'FlyerTemplate',
      required: true
    },
    generatedContent: { 
      type: String
    },
    imageUrl: { 
      type: String
    },
    links: [{ 
      type: String
    }],
    status: { 
      type: String, 
      required: true,
      enum: ['Draft', 'Published'],
      default: 'Draft'
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.models.ProgramFlyer || mongoose.model<IProgramFlyer>('ProgramFlyer', ProgramFlyerSchema);

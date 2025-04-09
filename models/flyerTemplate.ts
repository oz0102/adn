import mongoose, { Schema, Document } from 'mongoose';

export interface IFlyerTemplate extends Document {
  name: string;
  description: string;
  templateType: string;
  backgroundImages: string[];
  templateStructure: {
    titlePosition: string;
    descriptionPosition: string;
    imagePosition: string;
    linksPosition: string;
  };
  promptTemplate: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const TemplateStructureSchema = new Schema({
  titlePosition: { 
    type: String, 
    required: true,
    enum: ['Top', 'Middle', 'Bottom', 'Left', 'Right', 'Center']
  },
  descriptionPosition: { 
    type: String, 
    required: true,
    enum: ['Top', 'Middle', 'Bottom', 'Left', 'Right', 'Center']
  },
  imagePosition: { 
    type: String, 
    required: true,
    enum: ['Top', 'Middle', 'Bottom', 'Left', 'Right', 'Center']
  },
  linksPosition: { 
    type: String, 
    required: true,
    enum: ['Top', 'Middle', 'Bottom', 'Left', 'Right', 'Center']
  }
});

const FlyerTemplateSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    description: { 
      type: String, 
      required: true
    },
    templateType: { 
      type: String, 
      required: true,
      enum: ['Orientation', 'Event', 'Announcement', 'Training', 'Other']
    },
    backgroundImages: [{ 
      type: String
    }],
    templateStructure: { 
      type: TemplateStructureSchema,
      required: true
    },
    promptTemplate: { 
      type: String, 
      required: true
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

export default mongoose.models.FlyerTemplate || mongoose.model<IFlyerTemplate>('FlyerTemplate', FlyerTemplateSchema);

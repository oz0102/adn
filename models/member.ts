import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill {
  name: string;
  proficiencyLevel: string;
  certified: boolean;
}

export interface IEducation {
  level: string;
  institution: string;
  course: string;
  graduationYear: number;
}

export interface ISpiritualGrowth {
  newConvert?: { date: Date; notes: string };
  waterBaptism?: { date: Date; notes: string };
  holyGhostBaptism?: { date: Date; notes: string };
  worker?: { date: Date; notes: string };
  minister?: { date: Date; notes: string };
  ordainedMinister?: { date: Date; notes: string };
}

export interface ITraining {
  program: string;
  startDate: Date;
  completionDate?: Date;
  status: string;
  notes: string;
}

export interface ITeamMembership {
  teamId: mongoose.Types.ObjectId;
  role: string;
  joinDate: Date;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface IMember extends Document {
  memberId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dateOfBirth: Date;
  email?: string; // Made optional as per schema, will be unique with centerId if present
  phoneNumber: string;
  whatsappNumber?: string;
  address: IAddress;
  maritalStatus: string;
  relationshipStatus?: string;
  occupation?: string;
  employer?: string;
  profilePhoto?: string;
  education?: IEducation;
  skills: ISkill[];
  spiritualGrowth: ISpiritualGrowth;
  training: ITraining[];
  centerId: mongoose.Types.ObjectId; // Added: Ref to Center
  clusterId?: mongoose.Types.ObjectId;
  smallGroupId?: mongoose.Types.ObjectId;
  teams: ITeamMembership[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  lastUpdatedBy?: mongoose.Types.ObjectId;
}

const SkillSchema = new Schema({
  name: { type: String, required: true },
  proficiencyLevel: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner'
  },
  certified: { type: Boolean, default: false }
});

const EducationSchema = new Schema({
  level: { 
    type: String, 
    enum: ['No education', 'Primary School', 'Secondary School', 'BSC', 'OND', 'HND', 'MSc', 'PhD'],
    required: true
  },
  institution: { type: String },
  course: { type: String },
  graduationYear: { type: Number }
});

const SpiritualGrowthSchema = new Schema({
  newConvert: { 
    date: { type: Date },
    notes: { type: String }
  },
  waterBaptism: { 
    date: { type: Date },
    notes: { type: String }
  },
  holyGhostBaptism: { 
    date: { type: Date },
    notes: { type: String }
  },
  worker: { 
    date: { type: Date },
    notes: { type: String }
  },
  minister: { 
    date: { type: Date },
    notes: { type: String }
  },
  ordainedMinister: { 
    date: { type: Date },
    notes: { type: String }
  }
});

const TrainingSchema = new Schema({
  program: { type: String, required: true },
  startDate: { type: Date, required: true },
  completionDate: { type: Date },
  status: { 
    type: String, 
    enum: ['In Progress', 'Completed', 'Dropped'],
    default: 'In Progress'
  },
  notes: { type: String }
});

const TeamMembershipSchema = new Schema({
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  role: { 
    type: String, 
    enum: ['Member', 'Assistant', 'Lead'],
    default: 'Member'
  },
  joinDate: { type: Date, default: Date.now }
});

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String }
});

const MemberSchema: Schema = new Schema(
  {
    memberId: { 
      type: String, 
      required: true,
      trim: true
      // Unique constraint handled by compound index below
    },
    firstName: { 
      type: String, 
      required: true,
      trim: true
    },
    middleName: { 
      type: String,
      trim: true
    },
    lastName: { 
      type: String, 
      required: true,
      trim: true
    },
    gender: { 
      type: String, 
      required: true,
      enum: ['Male', 'Female']
    },
    dateOfBirth: { 
      type: Date,
      required: true
    },
    email: { 
      type: String,
      trim: true,
      lowercase: true
      // Unique constraint handled by compound index below, if email is present
    },
    phoneNumber: { 
      type: String,
      required: true,
      trim: true
      // Unique constraint handled by compound index below
    },
    whatsappNumber: { 
      type: String,
      trim: true
    },
    address: { 
      type: AddressSchema,
      required: true
    },
    maritalStatus: { 
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed'],
      required: true
    },
    relationshipStatus: { 
      type: String,
      enum: ['Single', 'In a relationship', 'Engaged', 'Married', 'Separated', 'Divorced', 'Widowed']
    },
    occupation: { 
      type: String,
      trim: true
    },
    employer: { 
      type: String,
      trim: true
    },
    profilePhoto: { 
      type: String
    },
    education: { 
      type: EducationSchema
    },
    skills: [{ 
      type: SkillSchema
    }],
    spiritualGrowth: { 
      type: SpiritualGrowthSchema,
      default: {}
    },
    training: [{ 
      type: TrainingSchema
    }],
    centerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Center',
      required: true 
    }, // Added field
    clusterId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Cluster'
    },
    smallGroupId: { 
      type: Schema.Types.ObjectId, 
      ref: 'SmallGroup'
    },
    teams: [{ 
      type: TeamMembershipSchema
    }],
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    },
    lastUpdatedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User'
    }
  },
  { 
    timestamps: true 
  }
);

// Create indexes
MemberSchema.index({ centerId: 1, memberId: 1 }, { unique: true }); // Compound unique index
MemberSchema.index({ centerId: 1, email: 1 }, { unique: true, sparse: true }); // Compound unique index for email if present
MemberSchema.index({ centerId: 1, phoneNumber: 1 }, { unique: true }); // Compound unique index

MemberSchema.index({ centerId: 1 }); // Index for centerId itself
MemberSchema.index({ clusterId: 1 });
MemberSchema.index({ smallGroupId: 1 });
MemberSchema.index({ 'teams.teamId': 1 });
MemberSchema.index({ dateOfBirth: 1 });


export default mongoose.models.Member || mongoose.model<IMember>('Member', MemberSchema);


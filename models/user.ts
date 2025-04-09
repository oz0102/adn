import mongoose, { Schema, Document } from 'mongoose';
import { hash } from 'bcrypt';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: string;
  permissions: string[];
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      required: true,
      enum: ['Admin', 'Pastor', 'ClusterLead', 'SmallGroupLead', 'PublicityLead', 'MediaLead', 'TechnicalLead', 'Member']
    },
    permissions: [{ 
      type: String 
    }],
    lastLogin: { 
      type: Date 
    }
  },
  { 
    timestamps: true 
  }
);

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await hash(this.passwordHash, 10);
  }
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

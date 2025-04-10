/**
 * User model - Server-side only
 * This file should never be imported by client-side code
 */

import mongoose, { Schema, Document } from 'mongoose';
import { hash } from 'bcryptjs';

// Verify we're on the server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

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

// Use mongoose.models to check if the model already exists to prevent model overwrite errors
const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;

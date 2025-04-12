// //models\user.ts
// // This file is only used on the server side
// // Add a check to prevent importing in browser environments
// if (typeof window !== 'undefined') {
//   throw new Error('This module is server-side only and cannot be imported in browser code');
// }

// import mongoose, { Schema, Document } from 'mongoose';
// import { hash } from 'bcryptjs';

// export interface IUser extends Document {
//   email: string;
//   passwordHash: string;
//   role: string;
//   permissions: string[];
//   lastLogin: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const UserSchema: Schema = new Schema(
//   {
//     email: { 
//       type: String, 
//       required: true, 
//       unique: true,
//       trim: true,
//       lowercase: true
//     },
//     passwordHash: { 
//       type: String, 
//       required: true 
//     },
//     role: { 
//       type: String, 
//       required: true,
//       enum: ['Admin', 'Pastor', 'ClusterLead', 'SmallGroupLead', 'PublicityLead', 'MediaLead', 'TechnicalLead', 'Member']
//     },
//     permissions: [{ 
//       type: String 
//     }],
//     lastLogin: { 
//       type: Date 
//     }
//   },
//   { 
//     timestamps: true 
//   }
// );

// // Pre-save hook to hash password
// UserSchema.pre('save', async function(next) {
//   if (this.isModified('passwordHash')) {
//     this.passwordHash = await hash(this.passwordHash, 10);
//   }
//   next();
// });

// export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);


// This file is only used on the server side
// Add a check to prevent importing in browser environments
if (typeof window !== 'undefined') {
  throw new Error('This module is server-side only and cannot be imported in browser code');
}

import mongoose, { Schema, Document } from 'mongoose';
import { hash } from 'bcryptjs';

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
UserSchema.pre('save', async function(this: IUser, next) {
  if (this.isModified('passwordHash')) {
    // Cast passwordHash to string to ensure TypeScript knows it's a string
    this.passwordHash = await hash(this.passwordHash as string, 10);
  }
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
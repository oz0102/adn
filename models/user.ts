//models\user.ts

// This file is only used on the server side
// Add a check to prevent importing in browser environments
if (typeof window !== "undefined") {
  throw new Error("This module is server-side only and cannot be imported in browser code");
}

import mongoose, { Schema, Document } from "mongoose";
import { hash } from "bcryptjs";

export interface IAssignedRole {
  role: string; // e.g., HQ_ADMIN, CENTER_ADMIN, CLUSTER_LEADER, SMALL_GROUP_LEADER, MEMBER_ADMIN, REGULAR_MEMBER
  centerId?: mongoose.Types.ObjectId;
  clusterId?: mongoose.Types.ObjectId;
  smallGroupId?: mongoose.Types.ObjectId;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  assignedRoles: IAssignedRole[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AssignedRoleSchema: Schema = new Schema({
  role: { 
    type: String, 
    required: true,
    enum: ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER", "MEMBER_ADMIN", "REGULAR_MEMBER"] // Define comprehensive roles
  },
  centerId: { type: Schema.Types.ObjectId, ref: "Center" },
  clusterId: { type: Schema.Types.ObjectId, ref: "Cluster" },
  smallGroupId: { type: Schema.Types.ObjectId, ref: "SmallGroup" }
}, { _id: false });

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
    assignedRoles: [{ type: AssignedRoleSchema, default: [] }], // Replaces role and permissions
    lastLogin: { 
      type: Date 
    }
  },
  {
    timestamps: true 
  }
);

// Pre-save hook to hash password
UserSchema.pre("save", async function(this: IUser, next) {
  // Only hash the password if it has been modified (or is new)
  if (this.isModified("passwordHash")) {
    // Cast passwordHash to string to ensure TypeScript knows it's a string
    this.passwordHash = await hash(this.passwordHash as string, 10);
  }
  next();
});

UserSchema.index({ "assignedRoles.role": 1 });
UserSchema.index({ "assignedRoles.centerId": 1 });
UserSchema.index({ "assignedRoles.clusterId": 1 });
UserSchema.index({ "assignedRoles.smallGroupId": 1 });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);


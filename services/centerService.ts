// services/centerService.ts
import CenterModel, { ICenter } from "@/models/center";
import UserModel, { IUser } from "@/models/user"; 
import connectToDB from "@/lib/mongodb"; 
import mongoose, { Types, LeanDocument, FilterQuery } from "mongoose";

export interface ICenterCreatePayload extends Omit<Partial<ICenter>, "_id" | "centerAdmins"> {
  name: string;
  centerAdmins?: (Types.ObjectId | string)[]; // Array of User IDs
  // Add other required fields for creation if any
}

export interface ICenterUpdatePayload extends Partial<ICenterCreatePayload> {}

// Type for populated lean center document
export type PopulatedLeanCenter = Omit<LeanDocument<ICenter>, "centerAdmins"> & {
  _id: Types.ObjectId;
  centerAdmins?: (Pick<LeanDocument<IUser>, "_id" | "email" | "name"> & { _id: Types.ObjectId })[];
};

export const createCenterService = async (data: ICenterCreatePayload): Promise<ICenter> => {
  await connectToDB();
  if (data.centerAdmins && data.centerAdmins.length > 0) {
    const admins = await UserModel.find({ 
      _id: { $in: data.centerAdmins },
    }).lean<IUser[]>();
    if (admins.length !== data.centerAdmins.length) {
      const foundAdminIds = admins.map(admin => admin._id.toString());
      const notFoundAdmins = data.centerAdmins.filter(adminId => !foundAdminIds.includes(adminId.toString()));
      throw new Error(`One or more assigned center admins are invalid: ${notFoundAdmins.join(", ")}.`);
    }
  }
  const newCenter = new CenterModel(data);
  await newCenter.save();
  return newCenter; // Returning Mongoose document
};

export const getAllCentersService = async (filters?: FilterQuery<ICenter>): Promise<PopulatedLeanCenter[]> => {
  await connectToDB();
  return CenterModel.find(filters || {}).populate<{ centerAdmins: PopulatedLeanCenter["centerAdmins"] }>("centerAdmins", "email name").lean<PopulatedLeanCenter[]>();
};

export const getCenterByIdService = async (id: string): Promise<PopulatedLeanCenter | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  return CenterModel.findById(id).populate<{ centerAdmins: PopulatedLeanCenter["centerAdmins"] }>("centerAdmins", "email name").lean<PopulatedLeanCenter>();
};

export const updateCenterService = async (id: string, data: ICenterUpdatePayload): Promise<PopulatedLeanCenter | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;

  if (data.centerAdmins && data.centerAdmins.length > 0) {
    const admins = await UserModel.find({ _id: { $in: data.centerAdmins } }).lean<IUser[]>();
    if (admins.length !== data.centerAdmins.length) {
      const foundAdminIds = admins.map(admin => admin._id.toString());
      const notFoundAdmins = data.centerAdmins.filter(adminId => !foundAdminIds.includes(adminId.toString()));
      throw new Error(`One or more assigned center admins are invalid during update: ${notFoundAdmins.join(", ")}.`);
    }
  }
  return CenterModel.findByIdAndUpdate(id, data, { new: true })
                    .populate<{ centerAdmins: PopulatedLeanCenter["centerAdmins"] }>("centerAdmins", "email name")
                    .lean<PopulatedLeanCenter>();
};

export const deleteCenterService = async (id: string): Promise<PopulatedLeanCenter | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  
  // TODO: Implement cascading deletes or disassociations for Clusters, SmallGroups, Members, Events, etc.,
  // that were associated with this centerId. This is a critical step for data integrity.
  // For example, before deleting a center, you might want to:
  // 1. Delete all SmallGroups belonging to Clusters within this Center.
  // 2. Delete all Clusters belonging to this Center.
  // 3. Disassociate or delete Members belonging to this Center.
  // 4. Handle Events, etc.
  // This often requires transactions if your DB supports them, or careful sequencing of operations.

  const deletedCenter = await CenterModel.findByIdAndDelete(id).lean<PopulatedLeanCenter>();
  if (!deletedCenter) {
    return null;
  }
  return deletedCenter;
};


// services/centerService.ts
import CenterModel, { ICenter } from "@/models/center";
import UserModel, { IUser } from "@/models/user"; 
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import mongoose, { Types, Document, FilterQuery } from "mongoose";

export interface ICenterCreatePayload extends Omit<Partial<ICenter>, "_id" | "centerAdmins"> {
  name: string;
  centerAdmins?: (Types.ObjectId | string)[]; 
}

export interface ICenterUpdatePayload extends Partial<ICenterCreatePayload> {}

// Update PopulatedLeanCenter type
export type PopulatedLeanCenter = Omit<ICenter, "centerAdmins"> & {
  _id: Types.ObjectId;
  centerAdmins?: (Pick<IUser, "_id" | "email" | "name"> & { _id: Types.ObjectId })[];
};

const createCenter = async (data: ICenterCreatePayload): Promise<ICenter> => {
  await connectToDB();
  if (data.centerAdmins && data.centerAdmins.length > 0) {
    const admins = await UserModel.find({ 
      _id: { $in: data.centerAdmins },
    }).lean<IUser[]>(); // Add generic type parameter
    if (admins.length !== data.centerAdmins.length) {
      const foundAdminIds = admins.map(admin => admin._id.toString());
      const notFoundAdmins = data.centerAdmins.filter(adminId => !foundAdminIds.includes(adminId.toString()));
      throw new Error(`One or more assigned center admins are invalid: ${notFoundAdmins.join(", ")}.`);
    }
  }
  const newCenter = new CenterModel(data);
  await newCenter.save();
  return newCenter; 
};

const getAllCenters = async (filters?: FilterQuery<ICenter>): Promise<PopulatedLeanCenter[]> => {
  await connectToDB();
  return CenterModel.find(filters || {}).populate<{ centerAdmins: PopulatedLeanCenter["centerAdmins"] }>("centerAdmins", "email name").lean<PopulatedLeanCenter[]>();
};

const getCenterById = async (id: string): Promise<PopulatedLeanCenter | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  return CenterModel.findById(id).populate<{ centerAdmins: PopulatedLeanCenter["centerAdmins"] }>("centerAdmins", "email name").lean<PopulatedLeanCenter>();
};

const updateCenter = async (id: string, data: ICenterUpdatePayload): Promise<PopulatedLeanCenter | null> => {
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

const deleteCenter = async (id: string): Promise<PopulatedLeanCenter | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  
  const deletedCenter = await CenterModel.findByIdAndDelete(id).lean<PopulatedLeanCenter>();
  if (!deletedCenter) {
    return null;
  }
  return deletedCenter;
};

export const centerService = {
    createCenter,
    getAllCenters,
    getCenterById,
    updateCenter,
    deleteCenter
};

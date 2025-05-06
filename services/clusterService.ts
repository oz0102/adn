// services/clusterService.ts
import ClusterModel, { ICluster } from "@/models/cluster";
import CenterModel, { ICenter } from "@/models/center";
import MemberModel, { IMember } from "@/models/member"; 
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import mongoose, { Types, LeanDocument, FilterQuery } from "mongoose";

export interface IClusterCreatePayload extends Omit<Partial<ICluster>, "_id" | "centerId" | "leaderId"> {
  name: string;
  centerId: Types.ObjectId | string;
  leaderId?: Types.ObjectId | string;
}

export interface IClusterUpdatePayload extends Partial<Omit<IClusterCreatePayload, "centerId">> {
    centerId?: Types.ObjectId | string; 
}

export type PopulatedLeanCluster = Omit<LeanDocument<ICluster>, "centerId" | "leaderId"> & {
  _id: Types.ObjectId;
  centerId: (Pick<LeanDocument<ICenter>, "_id" | "name"> & { _id: Types.ObjectId }) | null; 
  leaderId?: (Pick<LeanDocument<IMember>, "_id" | "firstName" | "lastName" | "email"> & { _id: Types.ObjectId }) | null;
};

const createCluster = async (data: IClusterCreatePayload): Promise<ICluster> => {
  await connectToDB();
  const centerIdObj = new Types.ObjectId(data.centerId.toString());

  const centerExists = await CenterModel.findById(centerIdObj).lean<ICenter>();
  if (!centerExists) {
    throw new Error("Invalid Center ID: Center does not exist.");
  }

  if (data.leaderId) {
    const leaderIdObj = new Types.ObjectId(data.leaderId.toString());
    const leaderExists = await MemberModel.findById(leaderIdObj).lean<IMember>();
    if (!leaderExists) {
      throw new Error("Invalid Leader ID: Member does not exist.");
    }
    if (leaderExists.centerId?.toString() !== centerIdObj.toString()) {
        throw new Error("Cluster leader must belong to the same center as the cluster.");
    }
  }

  const newCluster = new ClusterModel({
      ...data,
      centerId: centerIdObj,
      leaderId: data.leaderId ? new Types.ObjectId(data.leaderId.toString()) : undefined
  });
  await newCluster.save();
  return newCluster.populate([
      { path: "leaderId", select: "firstName lastName email" }, 
      { path: "centerId", select: "name" }
  ]);
};

const getAllClusters = async (centerId?: string): Promise<PopulatedLeanCluster[]> => {
  await connectToDB();
  const query: FilterQuery<ICluster> = {};
  if (centerId && Types.ObjectId.isValid(centerId)) {
      query.centerId = new Types.ObjectId(centerId);
  } else if (centerId) {
      console.warn(`Invalid centerId format received: ${centerId}`);
      return [];
  }
  return ClusterModel.find(query)
    .populate<{ leaderId: PopulatedLeanCluster["leaderId"] }>({ path: "leaderId", select: "firstName lastName email" })
    .populate<{ centerId: PopulatedLeanCluster["centerId"] }>({ path: "centerId", select: "name" })
    .lean<PopulatedLeanCluster[]>();
};

const getClusterById = async (id: string): Promise<PopulatedLeanCluster | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  return ClusterModel.findById(id)
    .populate<{ leaderId: PopulatedLeanCluster["leaderId"] }>({ path: "leaderId", select: "firstName lastName email" })
    .populate<{ centerId: PopulatedLeanCluster["centerId"] }>({ path: "centerId", select: "name" })
    .lean<PopulatedLeanCluster>();
};

const updateCluster = async (id: string, data: IClusterUpdatePayload): Promise<PopulatedLeanCluster | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;

  const updateData: Partial<ICluster> = { ...data };

  if (data.centerId) {
    const centerIdObj = new Types.ObjectId(data.centerId.toString());
    const centerExists = await CenterModel.findById(centerIdObj).lean<ICenter>();
    if (!centerExists) {
      throw new Error("Invalid new Center ID: Center does not exist.");
    }
    updateData.centerId = centerIdObj;
  }

  if (data.leaderId) {
    const leaderIdObj = new Types.ObjectId(data.leaderId.toString());
    const leaderExists = await MemberModel.findById(leaderIdObj).lean<IMember>();
    if (!leaderExists) {
      throw new Error("Invalid new Leader ID: Member does not exist.");
    }
    
    const targetCenterIdStr = data.centerId?.toString() || (await ClusterModel.findById(id).select("centerId").lean<Pick<ICluster, "centerId">>())?.centerId?.toString();
    if (!targetCenterIdStr) {
        throw new Error("Cluster must have a valid center associated.");
    }
    if (leaderExists.centerId?.toString() !== targetCenterIdStr) {
        throw new Error("Cluster leader must belong to the same center as the cluster.");
    }
    updateData.leaderId = leaderIdObj;
  } else if (data.hasOwnProperty("leaderId") && data.leaderId === null) { 
    updateData.leaderId = undefined; 
  }

  return ClusterModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate<{ leaderId: PopulatedLeanCluster["leaderId"] }>({ path: "leaderId", select: "firstName lastName email" })
    .populate<{ centerId: PopulatedLeanCluster["centerId"] }>({ path: "centerId", select: "name" })
    .lean<PopulatedLeanCluster>();
};

const deleteCluster = async (id: string): Promise<PopulatedLeanCluster | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  const deletedCluster = await ClusterModel.findByIdAndDelete(id).lean<PopulatedLeanCluster>();
  if (!deletedCluster) {
    return null;
  }
  return deletedCluster;
};

export const clusterService = {
    createCluster,
    getAllClusters,
    getClusterById,
    updateCluster,
    deleteCluster
};

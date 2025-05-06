// services/clusterService.ts
import ClusterModel, { ICluster } from "@/models/cluster";
import CenterModel, { ICenter } from "@/models/center";
import MemberModel, { IMember } from "@/models/member"; 
import connectToDB from "@/lib/mongodb";
import mongoose, { Types, LeanDocument, FilterQuery } from "mongoose";

export interface IClusterCreatePayload extends Omit<Partial<ICluster>, "_id" | "centerId" | "leaderId"> {
  name: string;
  centerId: Types.ObjectId | string;
  leaderId?: Types.ObjectId | string;
  // Add other required fields for creation if any
}

export interface IClusterUpdatePayload extends Partial<Omit<IClusterCreatePayload, "centerId">> {
    centerId?: Types.ObjectId | string; // centerId can be optional during update, but if provided, it's validated
}

// Type for populated lean cluster document
export type PopulatedLeanCluster = Omit<LeanDocument<ICluster>, "centerId" | "leaderId"> & {
  _id: Types.ObjectId;
  centerId: (Pick<LeanDocument<ICenter>, "_id" | "name"> & { _id: Types.ObjectId }) | null; // Center is required for a cluster
  leaderId?: (Pick<LeanDocument<IMember>, "_id" | "firstName" | "lastName" | "email"> & { _id: Types.ObjectId }) | null;
};

export const createClusterService = async (data: IClusterCreatePayload): Promise<ICluster> => {
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
  // Repopulate after save to match the expected return type if it includes populated fields by default
  // Or adjust the Promise<ICluster> to Promise<PopulatedLeanCluster> if returning lean & populated
  // For now, returning the Mongoose document, which can be populated by the caller if needed or by default population in schema
  return newCluster.populate([
      { path: "leaderId", select: "firstName lastName email" }, // Adjusted fields
      { path: "centerId", select: "name" }
  ]);
};

export const getAllClustersService = async (centerId?: string): Promise<PopulatedLeanCluster[]> => {
  await connectToDB();
  const query: FilterQuery<ICluster> = {};
  if (centerId && Types.ObjectId.isValid(centerId)) {
      query.centerId = new Types.ObjectId(centerId);
  } else if (centerId) {
      // Handle invalid centerId string if necessary, e.g., return empty array or throw error
      console.warn(`Invalid centerId format received: ${centerId}`);
      return [];
  }
  return ClusterModel.find(query)
    .populate<{ leaderId: PopulatedLeanCluster["leaderId"] }>({ path: "leaderId", select: "firstName lastName email" })
    .populate<{ centerId: PopulatedLeanCluster["centerId"] }>({ path: "centerId", select: "name" })
    .lean<PopulatedLeanCluster[]>();
};

export const getClusterByIdService = async (id: string): Promise<PopulatedLeanCluster | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  return ClusterModel.findById(id)
    .populate<{ leaderId: PopulatedLeanCluster["leaderId"] }>({ path: "leaderId", select: "firstName lastName email" })
    .populate<{ centerId: PopulatedLeanCluster["centerId"] }>({ path: "centerId", select: "name" })
    .lean<PopulatedLeanCluster>();
};

export const updateClusterService = async (id: string, data: IClusterUpdatePayload): Promise<PopulatedLeanCluster | null> => {
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
  } else if (data.hasOwnProperty("leaderId") && data.leaderId === null) { // Explicitly setting leader to null
    updateData.leaderId = undefined; // Or null, depending on schema definition for unsetting
  }

  return ClusterModel.findByIdAndUpdate(id, updateData, { new: true })
    .populate<{ leaderId: PopulatedLeanCluster["leaderId"] }>({ path: "leaderId", select: "firstName lastName email" })
    .populate<{ centerId: PopulatedLeanCluster["centerId"] }>({ path: "centerId", select: "name" })
    .lean<PopulatedLeanCluster>();
};

export const deleteClusterService = async (id: string): Promise<PopulatedLeanCluster | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  // TODO: Implement cascading deletes or disassociations for SmallGroups and Members within this cluster.
  // e.g., await SmallGroupModel.deleteMany({ clusterId: id });
  // e.g., await MemberModel.updateMany({ clusterId: id }, { $unset: { clusterId: "" } });
  const deletedCluster = await ClusterModel.findByIdAndDelete(id).lean<PopulatedLeanCluster>();
  if (!deletedCluster) {
    return null;
  }
  return deletedCluster;
};


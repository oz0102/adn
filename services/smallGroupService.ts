// services/smallGroupService.ts
import SmallGroupModel, { ISmallGroup } from "@/models/smallGroup";
import ClusterModel, { ICluster } from "@/models/cluster";
import CenterModel, { ICenter } from "@/models/center";
import MemberModel, { IMember, IAddress } from "@/models/member";
import { connectToDB } from "@/lib/mongodb"; // Changed to named import
import mongoose, { Types, FilterQuery } from "mongoose"; 

export interface ISmallGroupCreatePayload {
  name: string;
  groupId: string; 
  clusterId: Types.ObjectId | string;
  centerId: Types.ObjectId | string; 
  leaderId: Types.ObjectId | string; 
  location: string; 
  address: IAddress; 
  contactPhone: string; 
  contactEmail: string; 
  description: string; 
  meetingSchedule: {
    day: string;
    time: string;
    frequency: string;
  }; 
  photo?: string;
  notes?: string; 
}

export interface ISmallGroupUpdatePayload extends Partial<Omit<ISmallGroupCreatePayload, "groupId" | "clusterId" | "centerId">> {
    clusterId?: Types.ObjectId | string; 
    centerId?: Types.ObjectId | string;   
}

export type PopulatedLeanSmallGroup = Omit<ISmallGroup, "clusterId" | "centerId" | "leaderId" | "versions" | "$isDefault" | "address" | "meetingSchedule"> & {
  _id: Types.ObjectId;
  clusterId: (Pick<ICluster, "_id" | "name" | "centerId"> & { _id: Types.ObjectId }) | null;
  centerId: (Pick<ICenter, "_id" | "name"> & { _id: Types.ObjectId }) | null;
  leaderId: (Pick<IMember, "_id" | "firstName" | "lastName" | "email"> & { _id: Types.ObjectId }) | null; 
  address: IAddress;
  meetingSchedule: {
    day: string;
    time: string;
    frequency: string;
  };
};

const createSmallGroup = async (data: ISmallGroupCreatePayload): Promise<ISmallGroup> => {
  await connectToDB();
  const clusterIdObj = new Types.ObjectId(data.clusterId.toString());
  const centerIdObj = new Types.ObjectId(data.centerId.toString());
  const leaderIdObj = new Types.ObjectId(data.leaderId.toString());

  const clusterExists = await ClusterModel.findById(clusterIdObj).lean<ICluster>();
  if (!clusterExists) {
    throw new Error("Invalid Cluster ID: Cluster does not exist.");
  }
  if (clusterExists.centerId?.toString() !== centerIdObj.toString()) {
    throw new Error("Cluster's centerId does not match the provided centerId for the small group.");
  }

  const leaderExists = await MemberModel.findById(leaderIdObj).lean<IMember>();
  if (!leaderExists) {
    throw new Error("Invalid Leader ID: Member does not exist.");
  }
  if (leaderExists.centerId?.toString() !== centerIdObj.toString()) {
      throw new Error("Small group leader must belong to the same center as the small group.");
  }

  const newSmallGroup = new SmallGroupModel({
      ...data,
      clusterId: clusterIdObj,
      centerId: centerIdObj,
      leaderId: leaderIdObj,
  });
  await newSmallGroup.save();
  const populatedSmallGroup = await SmallGroupModel.findById(newSmallGroup._id)
    .populate([
        { path: "leaderId", select: "firstName lastName email" }, 
        { path: "clusterId", select: "name centerId" },
        { path: "centerId", select: "name" }
    ])
    .exec();
  return populatedSmallGroup!;
};

const getAllSmallGroups = async (clusterId?: string, centerId?: string): Promise<PopulatedLeanSmallGroup[]> => {
  await connectToDB();
  const query: FilterQuery<ISmallGroup> = {};
  if (clusterId && Types.ObjectId.isValid(clusterId)) {
    query.clusterId = new Types.ObjectId(clusterId);
  } else if (centerId && Types.ObjectId.isValid(centerId)) {
    query.centerId = new Types.ObjectId(centerId);
  } else if (clusterId || centerId) {
      console.warn(`Invalid clusterId or centerId format received. ClusterId: ${clusterId}, CenterId: ${centerId}`);
      return [];
  }

  const smallGroups = await SmallGroupModel.find(query)
    .populate<{ leaderId: PopulatedLeanSmallGroup["leaderId"] }>({ path: "leaderId", select: "firstName lastName email" })
    .populate<{ clusterId: PopulatedLeanSmallGroup["clusterId"] }>({ path: "clusterId", select: "name centerId" })
    .populate<{ centerId: PopulatedLeanSmallGroup["centerId"] }>({ path: "centerId", select: "name" })
    .lean<PopulatedLeanSmallGroup[]>();
  return smallGroups;
};

const getSmallGroupById = async (id: string): Promise<PopulatedLeanSmallGroup | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  const smallGroup = await SmallGroupModel.findById(id)
    .populate<{ leaderId: PopulatedLeanSmallGroup["leaderId"] }>({ path: "leaderId", select: "firstName lastName email" })
    .populate<{ clusterId: PopulatedLeanSmallGroup["clusterId"] }>({ path: "clusterId", select: "name centerId" })
    .populate<{ centerId: PopulatedLeanSmallGroup["centerId"] }>({ path: "centerId", select: "name" })
    .lean<PopulatedLeanSmallGroup | null>();
  return smallGroup;
};

interface LeanSmallGroupWithPopulatedCluster extends Omit<ISmallGroup, "clusterId"> {
    clusterId?: (Pick<ICluster, "_id" | "centerId"> & { _id: Types.ObjectId }) | null;
}

const updateSmallGroup = async (id: string, data: ISmallGroupUpdatePayload): Promise<PopulatedLeanSmallGroup | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;

  const { leaderId: rawLeaderId, clusterId: rawClusterId, centerId: rawCenterId, ...restOfData } = data;
  const updateData: Partial<ISmallGroup> = { ...restOfData }; 

  if (rawClusterId) {
    const clusterIdObj = new Types.ObjectId(rawClusterId.toString());
    const clusterExists = await ClusterModel.findById(clusterIdObj).lean<ICluster>();
    if (!clusterExists) {
      throw new Error("Invalid new Cluster ID: Cluster does not exist.");
    }
    updateData.clusterId = clusterIdObj;
    updateData.centerId = clusterExists.centerId!;
    if (rawCenterId && rawCenterId.toString() !== clusterExists.centerId!.toString()) {
        console.warn("Provided centerId differs from the new cluster's centerId. Overriding with cluster's centerId.");
    }
  } else if (rawCenterId) {
    const existingSmallGroup = await SmallGroupModel.findById(id)
        .populate<{ clusterId: Pick<ICluster, "_id" | "centerId"> }>({ path: "clusterId", select: "_id centerId" })
        .lean<LeanSmallGroupWithPopulatedCluster | null>(); 

    if (!existingSmallGroup?.clusterId || existingSmallGroup.clusterId.centerId?.toString() !== rawCenterId.toString()){
        throw new Error("Cannot change centerId without changing clusterId to a cluster within the new center, or the new centerId does not match the existing cluster's center.");
    }
    updateData.centerId = new Types.ObjectId(rawCenterId.toString());
  }

  if (rawLeaderId) {
    const leaderIdObj = new Types.ObjectId(rawLeaderId.toString());
    const leaderExists = await MemberModel.findById(leaderIdObj).lean<IMember>();
    if (!leaderExists) {
      throw new Error("Invalid new Leader ID: Member does not exist.");
    }
    const targetCenterId = updateData.centerId || (await SmallGroupModel.findById(id).select("centerId").lean<Pick<ISmallGroup, "centerId">>())?.centerId;
    if (!targetCenterId) {
        throw new Error("Small Group must have a valid center associated to validate leader.");
    }
    if (leaderExists.centerId?.toString() !== targetCenterId.toString()) {
        throw new Error("Small group leader must belong to the same center as the small group.");
    }
    updateData.leaderId = leaderIdObj;
  } else if (data.hasOwnProperty("leaderId") && rawLeaderId === null) { 
    updateData.leaderId = undefined; 
  }

  const updatedSmallGroup = await SmallGroupModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
    .populate<{ leaderId: PopulatedLeanSmallGroup["leaderId"] }>({ path: "leaderId", select: "firstName lastName email" })
    .populate<{ clusterId: PopulatedLeanSmallGroup["clusterId"] }>({ path: "clusterId", select: "name centerId" })
    .populate<{ centerId: PopulatedLeanSmallGroup["centerId"] }>({ path: "centerId", select: "name" })
    .lean<PopulatedLeanSmallGroup | null>();
  return updatedSmallGroup;
};

const deleteSmallGroup = async (id: string): Promise<PopulatedLeanSmallGroup | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  const deletedSmallGroup = await SmallGroupModel.findByIdAndDelete(id)
                                .lean<PopulatedLeanSmallGroup | null>();
  return deletedSmallGroup;
};

export const smallGroupService = {
    createSmallGroup,
    getAllSmallGroups,
    getSmallGroupById,
    updateSmallGroup,
    deleteSmallGroup
};

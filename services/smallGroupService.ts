// services/smallGroupService.ts
import SmallGroup, { ISmallGroup } from "@/models/smallGroup";
import Cluster from "@/models/cluster"; // To validate clusterId
import Center from "@/models/center"; // To validate centerId
import Member from "@/models/member"; // To validate leaderId
import { connectToDB } from "@/lib/mongodb";
import mongoose from "mongoose";

/**
 * Creates a new Small Group.
 * Requires appropriate admin privileges (e.g., HQ_ADMIN, CENTER_ADMIN, or CLUSTER_LEADER for the specified clusterId).
 * Permission checks are primarily handled in the API route.
 * @param data - Data for the new small group, must include clusterId and centerId.
 * @returns The created small group document.
 */
export const createSmallGroupService = async (data: Partial<ISmallGroup>): Promise<ISmallGroup> => {
  await connectToDB();
  if (!data.clusterId || !data.centerId) {
    throw new Error("Cluster ID and Center ID are required to create a small group.");
  }
  const clusterExists = await Cluster.findById(data.clusterId);
  if (!clusterExists) {
    throw new Error("Invalid Cluster ID: Cluster does not exist.");
  }
  if (clusterExists.centerId.toString() !== data.centerId.toString()) {
    throw new Error("Cluster's centerId does not match the provided centerId for the small group.");
  }
  if (data.leaderId) {
    const leaderExists = await Member.findById(data.leaderId);
    if (!leaderExists) {
      throw new Error("Invalid Leader ID: Member does not exist.");
    }
    // Optionally, check if the leader belongs to the same centerId/clusterId
    if (leaderExists.centerId.toString() !== data.centerId.toString()) {
        throw new Error("Small group leader must belong to the same center as the small group.");
    }
    if (leaderExists.clusterId && leaderExists.clusterId.toString() !== data.clusterId.toString()) {
        // This check might be too strict if a leader can lead a small group in a different cluster within the same center
        // For now, assuming leader should be part of the same cluster or at least same center.
        // throw new Error("Small group leader must belong to the same cluster as the small group.");
    }
  }

  const newSmallGroup = new SmallGroup(data);
  await newSmallGroup.save();
  return newSmallGroup.populate([
    { path: "leaderId", select: "firstName lastName email memberId" }, 
    { path: "clusterId", select: "name centerId" },
    { path: "centerId", select: "name" }
  ]);
};

/**
 * Retrieves all Small Groups, optionally filtered by clusterId or centerId.
 * Access control is handled in the API route.
 * @param clusterId - Optional ID of the cluster to filter small groups by.
 * @param centerId - Optional ID of the center to filter small groups by (if clusterId is not provided).
 * @returns A list of small group documents.
 */
export const getAllSmallGroupsService = async (clusterId?: string, centerId?: string): Promise<ISmallGroup[]> => {
  await connectToDB();
  const query: any = {};
  if (clusterId) {
    query.clusterId = new mongoose.Types.ObjectId(clusterId);
  } else if (centerId) {
    query.centerId = new mongoose.Types.ObjectId(centerId);
  }
  return SmallGroup.find(query).populate([
    { path: "leaderId", select: "firstName lastName email memberId" }, 
    { path: "clusterId", select: "name centerId" },
    { path: "centerId", select: "name" }
  ]).lean();
};

/**
 * Retrieves a specific Small Group by its ID.
 * Permission checks handled in API route.
 * @param id - The ID of the small group.
 * @returns The small group document or null if not found.
 */
export const getSmallGroupByIdService = async (id: string): Promise<ISmallGroup | null> => {
  await connectToDB();
  return SmallGroup.findById(id).populate([
    { path: "leaderId", select: "firstName lastName email memberId" }, 
    { path: "clusterId", select: "name centerId" },
    { path: "centerId", select: "name" }
  ]).lean();
};

/**
 * Updates an existing Small Group.
 * Permission checks handled in API route.
 * @param id - The ID of the small group to update.
 * @param data - The data to update the small group with.
 * @returns The updated small group document or null if not found.
 */
export const updateSmallGroupService = async (id: string, data: Partial<ISmallGroup>): Promise<ISmallGroup | null> => {
  await connectToDB();
  // Validate clusterId and centerId if they are being changed
  if (data.clusterId) {
    const clusterExists = await Cluster.findById(data.clusterId);
    if (!clusterExists) {
      throw new Error("Invalid new Cluster ID: Cluster does not exist.");
    }
    // If centerId is not in data, ensure the new cluster's centerId is used or validated against existing one
    if (!data.centerId) {
        data.centerId = clusterExists.centerId;
    } else if (data.centerId.toString() !== clusterExists.centerId.toString()) {
        throw new Error("Provided centerId does not match the new cluster's centerId.");
    }
  } else if (data.centerId) {
    // If only centerId is changing, but not clusterId, this implies re-parenting a small group to a new center's cluster
    // This logic needs careful consideration: a small group cannot change center without changing cluster.
    // For now, assume clusterId must be provided if centerId changes, or that centerId cannot change independently of clusterId.
    const existingSmallGroup = await SmallGroup.findById(id).select("clusterId").lean();
    if (existingSmallGroup && existingSmallGroup.clusterId) {
        const parentCluster = await Cluster.findById(existingSmallGroup.clusterId).select("centerId").lean();
        if (parentCluster && parentCluster.centerId.toString() !== data.centerId.toString()) {
            throw new Error("Changing centerId directly without changing clusterId to a cluster in the new center is not allowed.");
        }
    }
  }

  if (data.leaderId) {
    const leaderExists = await Member.findById(data.leaderId);
    if (!leaderExists) {
      throw new Error("Invalid new Leader ID: Member does not exist.");
    }
    const targetCenterId = data.centerId || (await SmallGroup.findById(id).select("centerId").lean())?.centerId;
    if (targetCenterId && leaderExists.centerId.toString() !== targetCenterId.toString()) {
        throw new Error("Small group leader must belong to the same center as the small group.");
    }
  }

  return SmallGroup.findByIdAndUpdate(id, data, { new: true }).populate([
    { path: "leaderId", select: "firstName lastName email memberId" }, 
    { path: "clusterId", select: "name centerId" },
    { path: "centerId", select: "name" }
  ]).lean();
};

/**
 * Deletes a Small Group.
 * Permission checks handled in API route.
 * @param id - The ID of the small group to delete.
 * @returns The deleted small group document or null if not found.
 */
export const deleteSmallGroupService = async (id: string): Promise<ISmallGroup | null> => {
  await connectToDB();
  // TODO: Implement cascading deletes or disassociations for Members within this small group.
  const deletedSmallGroup = await SmallGroup.findByIdAndDelete(id).lean();
  if (!deletedSmallGroup) {
    return null;
  }
  // Example: await Member.updateMany({ smallGroupId: id }, { $unset: { smallGroupId: 1 } });
  return deletedSmallGroup;
};


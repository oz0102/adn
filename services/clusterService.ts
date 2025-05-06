// services/clusterService.ts
import Cluster, { ICluster } from "@/models/cluster";
import Center from "@/models/center"; // To validate centerId
import Member from "@/models/member"; // To validate leaderId
import { connectToDB } from "@/lib/mongodb";
import mongoose from "mongoose";

/**
 * Creates a new Cluster.
 * Requires appropriate admin privileges (e.g., HQ_ADMIN or CENTER_ADMIN for the specified centerId).
 * Permission checks are primarily handled in the API route.
 * @param data - Data for the new cluster, must include centerId.
 * @returns The created cluster document.
 */
export const createClusterService = async (data: Partial<ICluster>): Promise<ICluster> => {
  await connectToDB();
  if (!data.centerId) {
    throw new Error("Center ID is required to create a cluster.");
  }
  const centerExists = await Center.findById(data.centerId);
  if (!centerExists) {
    throw new Error("Invalid Center ID: Center does not exist.");
  }
  if (data.leaderId) {
    const leaderExists = await Member.findById(data.leaderId);
    if (!leaderExists) {
      throw new Error("Invalid Leader ID: Member does not exist.");
    }
    // Optionally, check if the leader belongs to the same centerId
    if (leaderExists.centerId.toString() !== data.centerId.toString()) {
        throw new Error("Cluster leader must belong to the same center as the cluster.");
    }
  }

  const newCluster = new Cluster(data);
  await newCluster.save();
  return newCluster.populate([{ path: "leaderId", select: "firstName lastName email memberId" }, { path: "centerId", select: "name" }]);
};

/**
 * Retrieves all Clusters, optionally filtered by centerId.
 * Access control (who can see which clusters) is handled in the API route.
 * @param centerId - Optional ID of the center to filter clusters by.
 * @returns A list of cluster documents.
 */
export const getAllClustersService = async (centerId?: string): Promise<ICluster[]> => {
  await connectToDB();
  const query = centerId ? { centerId: new mongoose.Types.ObjectId(centerId) } : {};
  return Cluster.find(query).populate([{ path: "leaderId", select: "firstName lastName email memberId" }, { path: "centerId", select: "name" }]).lean();
};

/**
 * Retrieves a specific Cluster by its ID.
 * Permission checks handled in API route.
 * @param id - The ID of the cluster.
 * @returns The cluster document or null if not found.
 */
export const getClusterByIdService = async (id: string): Promise<ICluster | null> => {
  await connectToDB();
  return Cluster.findById(id).populate([{ path: "leaderId", select: "firstName lastName email memberId" }, { path: "centerId", select: "name" }]).lean();
};

/**
 * Updates an existing Cluster.
 * Permission checks handled in API route.
 * @param id - The ID of the cluster to update.
 * @param data - The data to update the cluster with.
 * @returns The updated cluster document or null if not found.
 */
export const updateClusterService = async (id: string, data: Partial<ICluster>): Promise<ICluster | null> => {
  await connectToDB();
  // If centerId is being changed, validate the new centerId
  if (data.centerId) {
    const centerExists = await Center.findById(data.centerId);
    if (!centerExists) {
      throw new Error("Invalid new Center ID: Center does not exist.");
    }
  }
  if (data.leaderId) {
    const leaderExists = await Member.findById(data.leaderId);
    if (!leaderExists) {
      throw new Error("Invalid new Leader ID: Member does not exist.");
    }
    // If centerId is also part of the update, use the new data.centerId, else fetch current cluster's centerId
    const targetCenterId = data.centerId || (await Cluster.findById(id).select("centerId").lean())?.centerId;
    if (targetCenterId && leaderExists.centerId.toString() !== targetCenterId.toString()) {
        throw new Error("Cluster leader must belong to the same center as the cluster.");
    }
  }

  return Cluster.findByIdAndUpdate(id, data, { new: true }).populate([{ path: "leaderId", select: "firstName lastName email memberId" }, { path: "centerId", select: "name" }]).lean();
};

/**
 * Deletes a Cluster.
 * Permission checks handled in API route.
 * @param id - The ID of the cluster to delete.
 * @returns The deleted cluster document or null if not found.
 */
export const deleteClusterService = async (id: string): Promise<ICluster | null> => {
  await connectToDB();
  // TODO: Implement cascading deletes or disassociations for SmallGroups and Members within this cluster.
  const deletedCluster = await Cluster.findByIdAndDelete(id).lean();
  if (!deletedCluster) {
    return null;
  }
  // Example: await SmallGroup.deleteMany({ clusterId: id });
  // Example: await Member.updateMany({ clusterId: id }, { $unset: { clusterId: 1 } });
  return deletedCluster;
};


// services/discipleshipGoalService.ts
import DiscipleshipGoal, { IDiscipleshipGoal } from "@/models/discipleshipGoal";
import Center from "@/models/center";
import Cluster from "@/models/cluster";
import SmallGroup from "@/models/smallGroup";
import Member from "@/models/member";
import { connectToDB } from "@/lib/mongodb";
import mongoose from "mongoose";

interface CreateGoalData extends Omit<Partial<IDiscipleshipGoal>, "level" | "centerId" | "clusterId" | "smallGroupId" | "memberId" | "createdBy"> {
  targetNumber: number;
  startDate: Date;
  endDate: Date;
  level: "HQ" | "CENTER" | "CLUSTER" | "SMALL_GROUP" | "INDIVIDUAL";
  centerId?: string | mongoose.Types.ObjectId;
  clusterId?: string | mongoose.Types.ObjectId;
  smallGroupId?: string | mongoose.Types.ObjectId;
  memberId?: string | mongoose.Types.ObjectId;
  createdBy: string | mongoose.Types.ObjectId;
}

interface UpdateGoalData extends Omit<Partial<IDiscipleshipGoal>, "level" | "centerId" | "clusterId" | "smallGroupId" | "memberId" | "createdBy"> {
  // Level and scope IDs are generally not updatable. Status, targetNumber, dates, progress are.
}

/**
 * Creates a new Discipleship Goal.
 * Permission checks handled in API routes.
 * @param data - Data for the new goal.
 * @returns The created goal document.
 */
export const createDiscipleshipGoalService = async (data: CreateGoalData): Promise<IDiscipleshipGoal> => {
  await connectToDB();

  // Validate hierarchical IDs based on level
  if (data.level === "CENTER" && !data.centerId) {
    throw new Error("Center ID is required for CENTER level goals.");
  }
  if (data.level === "CLUSTER" && (!data.centerId || !data.clusterId)) {
    throw new Error("Center ID and Cluster ID are required for CLUSTER level goals.");
  }
  if (data.level === "SMALL_GROUP" && (!data.centerId || !data.clusterId || !data.smallGroupId)) {
    throw new Error("Center, Cluster, and Small Group IDs are required for SMALL_GROUP level goals.");
  }
  if (data.level === "INDIVIDUAL" && (!data.centerId || !data.memberId)) { // Assuming individual goals are also tied to a center context
    throw new Error("Center ID and Member ID are required for INDIVIDUAL level goals.");
  }

  // Verify existence of referenced entities
  if (data.centerId) {
    const centerExists = await Center.findById(data.centerId);
    if (!centerExists) throw new Error("Invalid Center ID.");
  }
  if (data.clusterId) {
    const clusterExists = await Cluster.findById(data.clusterId);
    if (!clusterExists || (data.centerId && clusterExists.centerId.toString() !== data.centerId.toString())) {
      throw new Error("Invalid Cluster ID or mismatched hierarchy.");
    }
  }
  if (data.smallGroupId) {
    const sgExists = await SmallGroup.findById(data.smallGroupId);
    if (!sgExists || 
        (data.clusterId && sgExists.clusterId.toString() !== data.clusterId.toString()) || 
        (data.centerId && sgExists.centerId.toString() !== data.centerId.toString())) {
      throw new Error("Invalid Small Group ID or mismatched hierarchy.");
    }
  }
  if (data.memberId) {
    const memberExists = await Member.findById(data.memberId);
    if (!memberExists || (data.centerId && memberExists.centerId.toString() !== data.centerId.toString())) {
      throw new Error("Invalid Member ID or member not in specified center.");
    }
  }
  
  // Clear irrelevant IDs based on level
  if (data.level === "HQ") {
      data.centerId = undefined;
      data.clusterId = undefined;
      data.smallGroupId = undefined;
      data.memberId = undefined;
  } else if (data.level === "CENTER") {
      data.clusterId = undefined;
      data.smallGroupId = undefined;
      data.memberId = undefined;
  } else if (data.level === "CLUSTER") {
      data.smallGroupId = undefined;
      data.memberId = undefined;
  } else if (data.level === "SMALL_GROUP") {
      data.memberId = undefined;
  }

  const newGoal = new DiscipleshipGoal(data);
  await newGoal.save();
  return newGoal.populate([
      { path: "centerId", select: "name" },
      { path: "clusterId", select: "name" },
      { path: "smallGroupId", select: "name" },
      { path: "memberId", select: "firstName lastName memberId" },
      { path: "createdBy", select: "email" }
  ]);
};

interface GetGoalsFilters {
  level?: "HQ" | "CENTER" | "CLUSTER" | "SMALL_GROUP" | "INDIVIDUAL";
  centerId?: string | mongoose.Types.ObjectId;
  clusterId?: string | mongoose.Types.ObjectId;
  smallGroupId?: string | mongoose.Types.ObjectId;
  memberId?: string | mongoose.Types.ObjectId;
  status?: string;
  page?: number;
  limit?: number;
}

/**
 * Retrieves Discipleship Goals based on filters.
 * Access control handled in API routes.
 * @param filters - Filtering options.
 * @returns A list of goal documents and pagination info.
 */
export const getAllDiscipleshipGoalsService = async (filters: GetGoalsFilters): Promise<{ goals: IDiscipleshipGoal[], total: number, page: number, limit: number }> => {
  await connectToDB();
  const { level, centerId, clusterId, smallGroupId, memberId, status, page = 1, limit = 20 } = filters;
  const query: any = {};

  if (level) query.level = level;
  if (centerId) query.centerId = new mongoose.Types.ObjectId(centerId.toString());
  if (clusterId) query.clusterId = new mongoose.Types.ObjectId(clusterId.toString());
  if (smallGroupId) query.smallGroupId = new mongoose.Types.ObjectId(smallGroupId.toString());
  if (memberId) query.memberId = new mongoose.Types.ObjectId(memberId.toString());
  if (status) query.status = status;
  
  // If level is HQ, ensure other IDs are not part of the query unless specifically intended for some complex filter
  if (level === "HQ") {
    query.centerId = { $exists: false };
    query.clusterId = { $exists: false };
    query.smallGroupId = { $exists: false };
    query.memberId = { $exists: false };
  }

  const total = await DiscipleshipGoal.countDocuments(query);
  const goals = await DiscipleshipGoal.find(query)
    .populate([
        { path: "centerId", select: "name" },
        { path: "clusterId", select: "name" },
        { path: "smallGroupId", select: "name" },
        { path: "memberId", select: "firstName lastName memberId" },
        { path: "createdBy", select: "email" }
    ])
    .sort({ startDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return { goals, total, page, limit };
};

/**
 * Retrieves a specific Discipleship Goal by its ID.
 * Permission checks handled in API route.
 * @param id - The ID of the goal.
 * @returns The goal document or null if not found.
 */
export const getDiscipleshipGoalByIdService = async (id: string): Promise<IDiscipleshipGoal | null> => {
  await connectToDB();
  return DiscipleshipGoal.findById(id).populate([
      { path: "centerId", select: "name" },
      { path: "clusterId", select: "name" },
      { path: "smallGroupId", select: "name" },
      { path: "memberId", select: "firstName lastName memberId" },
      { path: "createdBy", select: "email" }
  ]).lean();
};

/**
 * Updates an existing Discipleship Goal.
 * Level and scope IDs are not updatable. createdBy is not updatable.
 * Permission checks handled in API route.
 * @param id - The ID of the goal to update.
 * @param data - The data to update the goal with.
 * @returns The updated goal document or null if not found.
 */
export const updateDiscipleshipGoalService = async (id: string, data: UpdateGoalData): Promise<IDiscipleshipGoal | null> => {
  await connectToDB();
  const { ...updatePayload } = data;
  // Add weekly progress update logic if currentCount changes
  // This might be complex: if currentCount is directly updated, how is weeklyProgress affected?
  // Usually, weeklyProgress would be an array of actual progress entries, and currentCount a sum or latest.
  // For now, direct update of fields.
  return DiscipleshipGoal.findByIdAndUpdate(id, updatePayload, { new: true })
    .populate([
        { path: "centerId", select: "name" },
        { path: "clusterId", select: "name" },
        { path: "smallGroupId", select: "name" },
        { path: "memberId", select: "firstName lastName memberId" },
        { path: "createdBy", select: "email" }
    ]).lean();
};

/**
 * Deletes a Discipleship Goal.
 * Permission checks handled in API route.
 * @param id - The ID of the goal to delete.
 * @returns The deleted goal document or null if not found.
 */
export const deleteDiscipleshipGoalService = async (id: string): Promise<IDiscipleshipGoal | null> => {
  await connectToDB();
  return DiscipleshipGoal.findByIdAndDelete(id).lean();
};


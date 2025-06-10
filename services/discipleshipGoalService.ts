// services/discipleshipGoalService.ts
import DiscipleshipGoal, { IDiscipleshipGoal } from "@/models/discipleshipGoal";
import Center from "@/models/center";
import Cluster from "@/models/cluster";
import SmallGroup from "@/models/smallGroup";
import Member from "@/models/member";
import { connectToDB } from "@/lib/mongodb"; // Ensured named import
import mongoose, { Types } from "mongoose";

export interface IDiscipleshipGoalCreationPayload extends Omit<Partial<IDiscipleshipGoal>, "level" | "centerId" | "clusterId" | "smallGroupId" | "memberId" | "createdBy"> {
  title: string;
  category: string;
  targetNumber?: number; // Made optional as not all goals might have a numeric target
  startDate?: Date;
  endDate?: Date;
  level: "GLOBAL" | "CENTER" | "CLUSTER" | "SMALL_GROUP" | "INDIVIDUAL";
  centerId?: string | mongoose.Types.ObjectId;
  clusterId?: string | mongoose.Types.ObjectId;
  smallGroupId?: string | mongoose.Types.ObjectId;
  memberId?: string | mongoose.Types.ObjectId;
  createdBy: string | mongoose.Types.ObjectId;
}

export interface IDiscipleshipGoalUpdatePayload extends Omit<Partial<IDiscipleshipGoalCreationPayload>, "level" | "centerId" | "clusterId" | "smallGroupId" | "memberId" | "createdBy"> {
  // Level and scope IDs are generally not updatable. Status, targetNumber, dates, progress are.
}

const createDiscipleshipGoal = async (data: IDiscipleshipGoalCreationPayload): Promise<IDiscipleshipGoal> => {
  await connectToDB();

  if (data.level === "CENTER" && !data.centerId) {
    throw new Error("Center ID is required for CENTER level goals.");
  }
  if (data.level === "CLUSTER" && (!data.centerId || !data.clusterId)) {
    throw new Error("Center ID and Cluster ID are required for CLUSTER level goals.");
  }
  if (data.level === "SMALL_GROUP" && (!data.centerId || !data.clusterId || !data.smallGroupId)) {
    throw new Error("Center, Cluster, and Small Group IDs are required for SMALL_GROUP level goals.");
  }
  if (data.level === "INDIVIDUAL" && (!data.centerId || !data.memberId)) { 
    throw new Error("Center ID and Member ID are required for INDIVIDUAL level goals.");
  }

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
  
  if (data.level === "GLOBAL") {
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

export interface IDiscipleshipGoalFilters {
  level?: "GLOBAL" | "CENTER" | "CLUSTER" | "SMALL_GROUP" | "INDIVIDUAL";
  centerId?: string | mongoose.Types.ObjectId;
  clusterId?: string | mongoose.Types.ObjectId;
  smallGroupId?: string | mongoose.Types.ObjectId;
  memberId?: string | mongoose.Types.ObjectId;
  status?: string;
  category?: string;
  createdBy?: Types.ObjectId;
  page?: number;
  limit?: number;
}

const getAllDiscipleshipGoals = async (filters: IDiscipleshipGoalFilters, userRoles: any[] = [], currentUserId?: Types.ObjectId): Promise<{ goals: IDiscipleshipGoal[], total: number, page: number, limit: number }> => {
  await connectToDB();
  const { level, centerId, clusterId, smallGroupId, memberId, status, category, createdBy, page = 1, limit = 20 } = filters;
  const query: any = {};

  if (level) query.level = level;
  if (centerId) query.centerId = new mongoose.Types.ObjectId(centerId.toString());
  if (clusterId) query.clusterId = new mongoose.Types.ObjectId(clusterId.toString());
  if (smallGroupId) query.smallGroupId = new mongoose.Types.ObjectId(smallGroupId.toString());
  if (memberId) query.memberId = new mongoose.Types.ObjectId(memberId.toString());
  if (status) query.status = status;
  if (category) query.category = category;
  if (createdBy) query.createdBy = createdBy;
  
  if (level === "GLOBAL") {
    query.centerId = { $exists: false };
    query.clusterId = { $exists: false };
    query.smallGroupId = { $exists: false };
    query.memberId = { $exists: false };
  }

  // Basic role-based scoping (can be expanded)
  // This is a simplified version; actual scoping might be more complex and involve checking userRoles against query parameters.
  const isGlobalAdmin = userRoles.some(role => role.role === "GLOBAL_ADMIN");
  if (!isGlobalAdmin) {
    // Non-GLOBAL admins might be restricted to their scope or entities they created.
    // This part needs careful design based on exact requirements.
    // Example: if not GLOBAL admin and no specific scope filters, only show goals created by them.
    if (!centerId && !clusterId && !smallGroupId && !memberId && currentUserId) {
        query.createdBy = currentUserId;
    }
    // Further restrictions based on userRoles and filters.centerId, filters.clusterId etc. would go here.
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
    .lean() as unknown as IDiscipleshipGoal[];

  return { goals, total, page, limit };
};

const getDiscipleshipGoalById = async (id: string): Promise<IDiscipleshipGoal | null> => {
  await connectToDB();
  return DiscipleshipGoal.findById(id).populate([
      { path: "centerId", select: "name" },
      { path: "clusterId", select: "name" },
      { path: "smallGroupId", select: "name" },
      { path: "memberId", select: "firstName lastName memberId" },
      { path: "createdBy", select: "email" }
  ]).lean() as unknown as IDiscipleshipGoal | null;
};

const updateDiscipleshipGoal = async (id: string, data: IDiscipleshipGoalUpdatePayload): Promise<IDiscipleshipGoal | null> => {
  await connectToDB();
  const { ...updatePayload } = data;
  return DiscipleshipGoal.findByIdAndUpdate(id, updatePayload, { new: true })
    .populate([
        { path: "centerId", select: "name" },
        { path: "clusterId", select: "name" },
        { path: "smallGroupId", select: "name" },
        { path: "memberId", select: "firstName lastName memberId" },
        { path: "createdBy", select: "email" }
    ]).lean() as unknown as IDiscipleshipGoal | null;
};

const deleteDiscipleshipGoal = async (id: string): Promise<IDiscipleshipGoal | null> => {
  await connectToDB();
  return DiscipleshipGoal.findByIdAndDelete(id).lean() as unknown as IDiscipleshipGoal | null;
};

export const discipleshipGoalService = {
    createDiscipleshipGoal,
    getAllDiscipleshipGoals,
    getDiscipleshipGoalById,
    updateDiscipleshipGoal,
    deleteDiscipleshipGoal
};

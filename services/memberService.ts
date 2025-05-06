// services/memberService.ts
import Member, { IMember } from "@/models/member";
import Center from "@/models/center";
import Cluster from "@/models/cluster";
import SmallGroup from "@/models/smallGroup";
import { connectToDB } from "@/lib/mongodb";
import mongoose from "mongoose";

interface MemberCreationData extends Omit<Partial<IMember>, "centerId" | "clusterId" | "smallGroupId"> {
  centerId: string | mongoose.Types.ObjectId;
  clusterId?: string | mongoose.Types.ObjectId;
  smallGroupId?: string | mongoose.Types.ObjectId;
  memberId: string;
  email?: string;
  phoneNumber: string;
}

/**
 * Creates a new Member.
 * Permission checks (e.g., only admins of the target center can create members in it) are handled in API routes.
 * @param data - Data for the new member. Must include centerId.
 * @returns The created member document.
 */
export const createMemberService = async (data: MemberCreationData): Promise<IMember> => {
  await connectToDB();

  if (!data.centerId) {
    throw new Error("Center ID is required to create a member.");
  }
  const centerExists = await Center.findById(data.centerId);
  if (!centerExists) {
    throw new Error("Invalid Center ID: Center does not exist.");
  }

  if (data.clusterId) {
    const clusterExists = await Cluster.findById(data.clusterId);
    if (!clusterExists || clusterExists.centerId.toString() !== data.centerId.toString()) {
      throw new Error("Invalid Cluster ID or cluster does not belong to the specified center.");
    }
  }

  if (data.smallGroupId) {
    const smallGroupExists = await SmallGroup.findById(data.smallGroupId);
    if (!smallGroupExists || 
        (data.clusterId && smallGroupExists.clusterId.toString() !== data.clusterId.toString()) || 
        smallGroupExists.centerId.toString() !== data.centerId.toString()) {
      throw new Error("Invalid Small Group ID or small group does not belong to the specified cluster/center.");
    }
  }
  
  // Check for uniqueness of memberId, email, phoneNumber within the center
  const existingById = await Member.findOne({ memberId: data.memberId, centerId: data.centerId });
  if (existingById) {
    throw new Error(`Member with ID ${data.memberId} already exists in this center.`);
  }
  if (data.email) {
    const existingByEmail = await Member.findOne({ email: data.email, centerId: data.centerId });
    if (existingByEmail) {
      throw new Error(`Member with email ${data.email} already exists in this center.`);
    }
  }
  const existingByPhone = await Member.findOne({ phoneNumber: data.phoneNumber, centerId: data.centerId });
  if (existingByPhone) {
    throw new Error(`Member with phone number ${data.phoneNumber} already exists in this center.`);
  }

  const newMember = new Member(data);
  await newMember.save();
  return newMember.populate([
      { path: "centerId", select: "name" },
      { path: "clusterId", select: "name" },
      { path: "smallGroupId", select: "name" },
  ]);
};

interface MemberQueryFilters {
  centerId?: string | mongoose.Types.ObjectId;
  clusterId?: string | mongoose.Types.ObjectId;
  smallGroupId?: string | mongoose.Types.ObjectId;
  teamId?: string | mongoose.Types.ObjectId;
  spiritualGrowthStage?: string; // e.g., "newConvert", "waterBaptism"
  search?: string; // For name, email, phone
  page?: number;
  limit?: number;
}

/**
 * Retrieves Members based on filters.
 * Access control handled in API routes.
 * @param filters - Filtering options.
 * @returns A list of member documents and pagination info.
 */
export const getAllMembersService = async (filters: MemberQueryFilters): Promise<{ members: IMember[], total: number, page: number, limit: number }> => {
  await connectToDB();
  const { centerId, clusterId, smallGroupId, teamId, spiritualGrowthStage, search, page = 1, limit = 20 } = filters;
  const query: any = {};

  if (centerId) query.centerId = new mongoose.Types.ObjectId(centerId.toString());
  if (clusterId) query.clusterId = new mongoose.Types.ObjectId(clusterId.toString());
  if (smallGroupId) query.smallGroupId = new mongoose.Types.ObjectId(smallGroupId.toString());
  if (teamId) query["teams.teamId"] = new mongoose.Types.ObjectId(teamId.toString());
  if (spiritualGrowthStage) query[`spiritualGrowth.${spiritualGrowthStage}.date`] = { $exists: true, $ne: null };

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    query.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { phoneNumber: searchRegex },
      { memberId: searchRegex },
    ];
  }

  const total = await Member.countDocuments(query);
  const members = await Member.find(query)
    .populate([
        { path: "centerId", select: "name" },
        { path: "clusterId", select: "name" },
        { path: "smallGroupId", select: "name" },
        { path: "teams.teamId", select: "name" }
    ])
    .sort({ lastName: 1, firstName: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return { members, total, page, limit };
};

/**
 * Retrieves a specific Member by their ID.
 * Permission checks handled in API route.
 * @param id - The ID of the member.
 * @returns The member document or null if not found.
 */
export const getMemberByIdService = async (id: string): Promise<IMember | null> => {
  await connectToDB();
  return Member.findById(id).populate([
      { path: "centerId", select: "name" },
      { path: "clusterId", select: "name" },
      { path: "smallGroupId", select: "name" },
      { path: "teams.teamId", select: "name" }
  ]).lean();
};

/**
 * Updates an existing Member.
 * Permission checks handled in API route.
 * @param id - The ID of the member to update.
 * @param data - The data to update the member with.
 * @returns The updated member document or null if not found.
 */
export const updateMemberService = async (id: string, data: Partial<IMember>): Promise<IMember | null> => {
  await connectToDB();
  const member = await Member.findById(id);
  if (!member) return null;

  // If centerId is being changed, this is a complex operation (transfer) and needs careful handling.
  // For now, assume centerId is not changed via this generic update. If it is, new uniqueness checks are needed.
  if (data.centerId && data.centerId.toString() !== member.centerId.toString()) {
    throw new Error("Changing a member\'s centerId directly is not supported via this update. Use a dedicated transfer function.");
  }

  // Uniqueness checks if memberId, email, or phoneNumber are changing within the same center
  const centerIdForUniqueness = member.centerId;
  if (data.memberId && data.memberId !== member.memberId) {
    const existing = await Member.findOne({ memberId: data.memberId, centerId: centerIdForUniqueness, _id: { $ne: id } });
    if (existing) throw new Error(`Member with ID ${data.memberId} already exists in this center.`);
  }
  if (data.email && data.email !== member.email) {
    const existing = await Member.findOne({ email: data.email, centerId: centerIdForUniqueness, _id: { $ne: id } });
    if (existing) throw new Error(`Member with email ${data.email} already exists in this center.`);
  }
  if (data.phoneNumber && data.phoneNumber !== member.phoneNumber) {
    const existing = await Member.findOne({ phoneNumber: data.phoneNumber, centerId: centerIdForUniqueness, _id: { $ne: id } });
    if (existing) throw new Error(`Member with phone ${data.phoneNumber} already exists in this center.`);
  }
  
  // Validate clusterId and smallGroupId if provided
  if (data.clusterId) {
    const clusterExists = await Cluster.findById(data.clusterId);
    if (!clusterExists || clusterExists.centerId.toString() !== centerIdForUniqueness.toString()) {
      throw new Error("Invalid Cluster ID or cluster does not belong to the member\'s center.");
    }
  } else if (data.hasOwnProperty("clusterId") && data.clusterId === null) {
    // Explicitly setting clusterId to null (removing from cluster)
    member.clusterId = undefined;
  }

  if (data.smallGroupId) {
    const smallGroupExists = await SmallGroup.findById(data.smallGroupId);
    const targetClusterId = data.clusterId || member.clusterId;
    if (!smallGroupExists || 
        (targetClusterId && smallGroupExists.clusterId.toString() !== targetClusterId.toString()) || 
        smallGroupExists.centerId.toString() !== centerIdForUniqueness.toString()) {
      throw new Error("Invalid Small Group ID or small group does not belong to the member\'s cluster/center.");
    }
  } else if (data.hasOwnProperty("smallGroupId") && data.smallGroupId === null) {
    member.smallGroupId = undefined;
  }

  // Update the member fields
  Object.assign(member, data);
  await member.save();
  
  return member.populate([
      { path: "centerId", select: "name" },
      { path: "clusterId", select: "name" },
      { path: "smallGroupId", select: "name" },
      { path: "teams.teamId", select: "name" }
  ]);
};

/**
 * Deletes a Member.
 * Permission checks handled in API route.
 * @param id - The ID of the member to delete.
 * @returns The deleted member document or null if not found.
 */
export const deleteMemberService = async (id: string): Promise<IMember | null> => {
  await connectToDB();
  // Consider implications: e.g., if member is a leader of a group/cluster.
  // For now, direct delete. Add pre-delete hooks or checks if needed.
  const deletedMember = await Member.findByIdAndDelete(id).lean();
  if (!deletedMember) {
    return null;
  }
  // TODO: Clean up references, e.g., remove from teams, update leader roles if applicable.
  return deletedMember;
};


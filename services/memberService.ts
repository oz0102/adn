// services/memberService.ts
import Member, { IMember, IAddress, IEducation, ISkill, ISpiritualGrowth, ITraining, ITeamMembership } from "@/models/member";
import Center, { ICenter } from "@/models/center";
import Cluster, { ICluster } from "@/models/cluster";
import SmallGroup, { ISmallGroup } from "@/models/smallGroup";
import { connectToDB } from "@/lib/mongodb";
import mongoose, { Types, FilterQuery } from "mongoose";

interface MemberCreationData extends Omit<Partial<IMember>, "centerId" | "clusterId" | "smallGroupId" | "_id" | "createdAt" | "updatedAt" | "address" | "skills" | "spiritualGrowth" | "training" | "teams"> {
  centerId: string | mongoose.Types.ObjectId;
  clusterId?: string | mongoose.Types.ObjectId;
  smallGroupId?: string | mongoose.Types.ObjectId;
  memberId: string;
  email?: string;
  phoneNumber: string;
  address: IAddress;
  skills: ISkill[];
  spiritualGrowth: ISpiritualGrowth;
  training: ITraining[];
  teams: ITeamMembership[];
}

export type PopulatedLeanMember = Omit<IMember, "centerId" | "clusterId" | "smallGroupId" | "teams" | "versions" | "$isDefault"> & {
    _id: Types.ObjectId;
    centerId: (Pick<ICenter, "_id" | "name"> & { _id: Types.ObjectId }) | null;
    clusterId?: (Pick<ICluster, "_id" | "name"> & { _id: Types.ObjectId }) | null;
    smallGroupId?: (Pick<ISmallGroup, "_id" | "name"> & { _id: Types.ObjectId }) | null;
    teams: (Omit<ITeamMembership, "teamId"> & { teamId: (Pick<any, "_id" | "name"> & { _id: Types.ObjectId }) | null })[]; // Assuming Team model has _id and name
};

export const createMemberService = async (data: MemberCreationData): Promise<PopulatedLeanMember> => {
  await connectToDB();

  if (!data.centerId) {
    throw new Error("Center ID is required to create a member.");
  }
  const centerExists = await Center.findById(data.centerId).lean<ICenter | null>();
  if (!centerExists) {
    throw new Error("Invalid Center ID: Center does not exist.");
  }

  if (data.clusterId) {
    const clusterExists = await Cluster.findById(data.clusterId).lean<ICluster | null>();
    if (!clusterExists || clusterExists.centerId.toString() !== data.centerId.toString()) {
      throw new Error("Invalid Cluster ID or cluster does not belong to the specified center.");
    }
  }

  if (data.smallGroupId) {
    const smallGroupExists = await SmallGroup.findById(data.smallGroupId).lean<ISmallGroup | null>();
    if (!smallGroupExists || 
        (data.clusterId && smallGroupExists.clusterId.toString() !== data.clusterId.toString()) || 
        smallGroupExists.centerId.toString() !== data.centerId.toString()) {
      throw new Error("Invalid Small Group ID or small group does not belong to the specified cluster/center.");
    }
  }
  
  const existingById = await Member.findOne({ memberId: data.memberId, centerId: data.centerId }).lean<IMember | null>();
  if (existingById) {
    throw new Error(`Member with ID ${data.memberId} already exists in this center.`);
  }
  if (data.email) {
    const existingByEmail = await Member.findOne({ email: data.email, centerId: data.centerId }).lean<IMember | null>();
    if (existingByEmail) {
      throw new Error(`Member with email ${data.email} already exists in this center.`);
    }
  }
  const existingByPhone = await Member.findOne({ phoneNumber: data.phoneNumber, centerId: data.centerId }).lean<IMember | null>();
  if (existingByPhone) {
    throw new Error(`Member with phone number ${data.phoneNumber} already exists in this center.`);
  }

  const newMemberDoc = new Member(data);
  await newMemberDoc.save();
  
  const populatedMember = await Member.findById(newMemberDoc._id)
    .populate<{ centerId: PopulatedLeanMember["centerId"] }>({ path: "centerId", select: "name" })
    .populate<{ clusterId?: PopulatedLeanMember["clusterId"] }>({ path: "clusterId", select: "name" })
    .populate<{ smallGroupId?: PopulatedLeanMember["smallGroupId"] }>({ path: "smallGroupId", select: "name" })
    .populate<{ teams: PopulatedLeanMember["teams"] }>( { path: "teams.teamId", select: "name" })
    .lean<PopulatedLeanMember | null>();

  if (!populatedMember) {
      throw new Error("Failed to populate created member.");
  }
  return populatedMember;
};

interface MemberQueryFilters {
  centerId?: string | mongoose.Types.ObjectId;
  clusterId?: string | mongoose.Types.ObjectId;
  smallGroupId?: string | mongoose.Types.ObjectId;
  teamId?: string | mongoose.Types.ObjectId;
  spiritualGrowthStage?: string; 
  search?: string; 
  page?: number;
  limit?: number;
}

export const getAllMembersService = async (filters: MemberQueryFilters): Promise<{ members: PopulatedLeanMember[], total: number, page: number, limit: number }> => {
  await connectToDB();
  const { centerId, clusterId, smallGroupId, teamId, spiritualGrowthStage, search, page = 1, limit = 20 } = filters;
  const query: FilterQuery<IMember> = {};

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
    .populate<{ centerId: PopulatedLeanMember["centerId"] }>({ path: "centerId", select: "name" })
    .populate<{ clusterId?: PopulatedLeanMember["clusterId"] }>({ path: "clusterId", select: "name" })
    .populate<{ smallGroupId?: PopulatedLeanMember["smallGroupId"] }>({ path: "smallGroupId", select: "name" })
    .populate<{ teams: PopulatedLeanMember["teams"] }>( { path: "teams.teamId", select: "name" })
    .sort({ lastName: 1, firstName: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean<PopulatedLeanMember[]>();

  return { members, total, page, limit };
};

export const getMemberByIdService = async (id: string): Promise<PopulatedLeanMember | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  return Member.findById(id)
    .populate<{ centerId: PopulatedLeanMember["centerId"] }>({ path: "centerId", select: "name" })
    .populate<{ clusterId?: PopulatedLeanMember["clusterId"] }>({ path: "clusterId", select: "name" })
    .populate<{ smallGroupId?: PopulatedLeanMember["smallGroupId"] }>({ path: "smallGroupId", select: "name" })
    .populate<{ teams: PopulatedLeanMember["teams"] }>( { path: "teams.teamId", select: "name" })
    .lean<PopulatedLeanMember | null>();
};

export const updateMemberService = async (id: string, data: Partial<Omit<IMember, "_id" | "createdAt" | "updatedAt">>): Promise<PopulatedLeanMember | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;

  const member = await Member.findById(id);
  if (!member) return null;

  if (data.centerId && data.centerId.toString() !== member.centerId.toString()) {
    throw new Error("Changing a member\"s centerId directly is not supported via this update. Use a dedicated transfer function.");
  }

  const centerIdForUniqueness = member.centerId;
  if (data.memberId && data.memberId !== member.memberId) {
    const existing = await Member.findOne({ memberId: data.memberId, centerId: centerIdForUniqueness, _id: { $ne: id } }).lean<IMember | null>();
    if (existing) throw new Error(`Member with ID ${data.memberId} already exists in this center.`);
  }
  if (data.email && data.email !== member.email) {
    const existing = await Member.findOne({ email: data.email, centerId: centerIdForUniqueness, _id: { $ne: id } }).lean<IMember | null>();
    if (existing) throw new Error(`Member with email ${data.email} already exists in this center.`);
  }
  if (data.phoneNumber && data.phoneNumber !== member.phoneNumber) {
    const existing = await Member.findOne({ phoneNumber: data.phoneNumber, centerId: centerIdForUniqueness, _id: { $ne: id } }).lean<IMember | null>();
    if (existing) throw new Error(`Member with phone ${data.phoneNumber} already exists in this center.`);
  }
  
  if (data.clusterId) {
    const clusterExists = await Cluster.findById(data.clusterId).lean<ICluster | null>();
    if (!clusterExists || clusterExists.centerId.toString() !== centerIdForUniqueness.toString()) {
      throw new Error("Invalid Cluster ID or cluster does not belong to the member\"s center.");
    }
  } else if (data.hasOwnProperty("clusterId") && data.clusterId === null) {
    member.clusterId = undefined;
  }

  if (data.smallGroupId) {
    const smallGroupExists = await SmallGroup.findById(data.smallGroupId).lean<ISmallGroup | null>();
    const targetClusterId = data.clusterId || member.clusterId;
    if (!smallGroupExists || 
        (targetClusterId && smallGroupExists.clusterId.toString() !== targetClusterId.toString()) || 
        smallGroupExists.centerId.toString() !== centerIdForUniqueness.toString()) {
      throw new Error("Invalid Small Group ID or small group does not belong to the member\"s cluster/center.");
    }
  } else if (data.hasOwnProperty("smallGroupId") && data.smallGroupId === null) {
    member.smallGroupId = undefined;
  }

  Object.assign(member, data);
  await member.save();
  
  const updatedAndPopulatedMember = await Member.findById(member._id)
    .populate<{ centerId: PopulatedLeanMember["centerId"] }>({ path: "centerId", select: "name" })
    .populate<{ clusterId?: PopulatedLeanMember["clusterId"] }>({ path: "clusterId", select: "name" })
    .populate<{ smallGroupId?: PopulatedLeanMember["smallGroupId"] }>({ path: "smallGroupId", select: "name" })
    .populate<{ teams: PopulatedLeanMember["teams"] }>( { path: "teams.teamId", select: "name" })
    .lean<PopulatedLeanMember | null>();

  return updatedAndPopulatedMember;
};

export const deleteMemberService = async (id: string): Promise<PopulatedLeanMember | null> => {
  await connectToDB();
  if (!Types.ObjectId.isValid(id)) return null;
  const deletedMember = await Member.findByIdAndDelete(id)
    .populate<{ centerId: PopulatedLeanMember["centerId"] }>({ path: "centerId", select: "name" })
    .populate<{ clusterId?: PopulatedLeanMember["clusterId"] }>({ path: "clusterId", select: "name" })
    .populate<{ smallGroupId?: PopulatedLeanMember["smallGroupId"] }>({ path: "smallGroupId", select: "name" })
    .populate<{ teams: PopulatedLeanMember["teams"] }>( { path: "teams.teamId", select: "name" })
    .lean<PopulatedLeanMember | null>();
  if (!deletedMember) {
    return null;
  }
  return deletedMember;
};


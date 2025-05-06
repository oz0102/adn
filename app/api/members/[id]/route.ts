import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  getMemberByIdService,
  updateMemberService,
  deleteMemberService
} from "@/services/memberService";
import { connectToDB } from "@/lib/mongodb";
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import Member from "@/models/member"; // To fetch member details for permission scoping

interface Params {
  params: { id: string };
}

/**
 * Handles GET requests to retrieve a specific Member by ID.
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const memberIdToFetch = params.id;

    await connectToDB();
    const member = await getMemberByIdService(memberIdToFetch);

    if (!member) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    // Permission checks: HQ_ADMIN, or admin of the member's scope, or the member themselves.
    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    let canAccessMemberData = hasHQAdminPermission;

    if (!canAccessMemberData) {
        const memberScope = {
            centerId: member.centerId,
            clusterId: member.clusterId,
            smallGroupId: member.smallGroupId
        };
        const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId: member.centerId });
        const isClusterLeader = member.clusterId ? await checkPermission(userId, "CLUSTER_LEADER", { clusterId: member.clusterId, centerId: member.centerId }) : false;
        const isSmallGroupLeader = member.smallGroupId ? await checkPermission(userId, "SMALL_GROUP_LEADER", { smallGroupId: member.smallGroupId, clusterId: member.clusterId, centerId: member.centerId }) : false;
        const isMemberAdmin = await checkPermission(userId, "MEMBER_ADMIN", memberScope); // Check MEMBER_ADMIN for the member's specific scope
        
        // Check if the requesting user is the member themselves
        // This requires fetching the User document linked to the session user ID and comparing its linked memberId (if any)
        // For now, assuming only admins/leaders can fetch other members. Self-fetch needs more logic if User model links to Member.
        // If session.user.memberId (hypothetical field) === memberIdToFetch, then allow.

        canAccessMemberData = isCenterAdmin || isClusterLeader || isSmallGroupLeader || isMemberAdmin;
    }
    
    if (!canAccessMemberData && session.user.id !== memberIdToFetch) { // Basic self-check if IDs were the same (not robust)
         // More robust self-check: Does the logged-in user correspond to this member profile?
         // This usually involves a link from the User model to the Member model.
         // For this iteration, we'll assume only hierarchical superiors or specific admins can view.
        return NextResponse.json({ message: "Forbidden: Insufficient permissions to view this member" }, { status: 403 });
    }
    
    return NextResponse.json(member, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to retrieve member ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve member", error: error.message }, { status: 500 });
  }
}

/**
 * Handles PUT requests to update a specific Member by ID.
 */
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const memberIdToUpdate = params.id;

    await connectToDB();
    const existingMember = await Member.findById(memberIdToUpdate).select("centerId clusterId smallGroupId").lean();
    if (!existingMember) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    // Permission checks for update
    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    let canUpdateMemberData = hasHQAdminPermission;

    if(!canUpdateMemberData){
        const memberScope = {
            centerId: existingMember.centerId,
            clusterId: existingMember.clusterId,
            smallGroupId: existingMember.smallGroupId
        };
        const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingMember.centerId });
        const isMemberAdminInScope = await checkPermission(userId, "MEMBER_ADMIN", memberScope);
        // Typically, only admins (HQ, Center, or specific Member Admins for the scope) can update.
        // Leaders (Cluster/SG) might have more restricted update rights (e.g., notes, not core profile) - not handled here.
        canUpdateMemberData = isCenterAdmin || isMemberAdminInScope;
    }

    if (!canUpdateMemberData) {
      // Add self-update permission if applicable, e.g. if session.user.id corresponds to memberIdToUpdate
      // For now, restricting to admins.
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to update this member" }, { status: 403 });
    }

    const body = await request.json();
    const updatedMember = await updateMemberService(memberIdToUpdate, body);

    if (!updatedMember) {
      return NextResponse.json({ message: "Member not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedMember, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to update member ${params.id}:`, error);
    if (error.message.includes("already exists")) {
        return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update member", error: error.message }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to delete a specific Member by ID.
 */
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const memberIdToDelete = params.id;

    await connectToDB();
    const existingMember = await Member.findById(memberIdToDelete).select("centerId clusterId smallGroupId").lean();
    if (!existingMember) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    // Permission checks for delete
    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    let canDeleteMember = hasHQAdminPermission;

    if(!canDeleteMember){
        const isCenterAdmin = await checkPermission(userId, "CENTER_ADMIN", { centerId: existingMember.centerId });
        // Generally, only HQ or Center admins can delete members.
        // MEMBER_ADMIN might also be given this right depending on policy.
        const isMemberAdminForCenter = await checkPermission(userId, "MEMBER_ADMIN", { centerId: existingMember.centerId });
        canDeleteMember = isCenterAdmin || isMemberAdminForCenter;
    }

    if (!canDeleteMember) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to delete this member" }, { status: 403 });
    }

    const deletedMember = await deleteMemberService(memberIdToDelete);

    if (!deletedMember) {
      return NextResponse.json({ message: "Member not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Member deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete member ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete member", error: error.message }, { status: 500 });
  }
}


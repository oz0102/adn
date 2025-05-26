import { NextResponse } from "next/server";
import { auth } from "@/auth"; 
import { memberService } from "@/services/memberService";
import { connectToDB } from "@/lib/mongodb"; 
import { checkPermission } from "@/lib/permissions";
import mongoose from "mongoose";
import Member from "@/models/member"; 

interface Params {
  params: { id: string };
}

interface SessionUserWithMemberId {
  id: string;
  memberId?: string; // Assuming memberId might be on the session user
  // Add other user properties if needed from session.user
}

export async function GET(request: Request, { params }: Params) {
  try {
    const session = await auth(); 
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const memberIdToFetch = params.id;

    await connectToDB();
    const member = await memberService.getMemberById(memberIdToFetch);

    if (!member) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    let canAccessMemberData = hasHQAdminPermission;

    if (!canAccessMemberData) {
        const memberCenterId = member.centerId?._id?.toString();
        const memberClusterId = member.clusterId?._id?.toString();
        const memberSmallGroupId = member.smallGroupId?._id?.toString();

        const isCenterAdmin = memberCenterId ? await checkPermission(userId, "CENTER_ADMIN", { centerId: memberCenterId }) : false;
        const isClusterLeader = memberClusterId && memberCenterId ? await checkPermission(userId, "CLUSTER_LEADER", { clusterId: memberClusterId, centerId: memberCenterId }) : false;
        const isSmallGroupLeader = memberSmallGroupId && memberClusterId && memberCenterId ? await checkPermission(userId, "SMALL_GROUP_LEADER", { smallGroupId: memberSmallGroupId, clusterId: memberClusterId, centerId: memberCenterId }) : false;
        const isMemberAdmin = memberCenterId ? await checkPermission(userId, "MEMBER_ADMIN", { centerId: memberCenterId, clusterId: memberClusterId, smallGroupId: memberSmallGroupId }) : false; 
        
        canAccessMemberData = isCenterAdmin || isClusterLeader || isSmallGroupLeader || isMemberAdmin;
    }
    
    const typedUser = session.user as SessionUserWithMemberId;
    const userMemberId = typedUser.memberId; 
    if (!canAccessMemberData && userMemberId && userMemberId === memberIdToFetch) {
        canAccessMemberData = true;
    }

    if (!canAccessMemberData) { 
        return NextResponse.json({ message: "Forbidden: Insufficient permissions to view this member" }, { status: 403 });
    }
    
    return NextResponse.json(member, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to retrieve member ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to retrieve member", error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth(); 
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const memberIdToUpdate = params.id;

    await connectToDB();
    const existingMember = await Member.findById(memberIdToUpdate).select("centerId clusterId smallGroupId createdBy").lean();
    if (!existingMember) {
      return NextResponse.json({ message: "Member not found" }, { status: 404 });
    }

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    let canUpdateMemberData = hasHQAdminPermission;
    const existingMemberCenterId = existingMember.centerId?.toString();

    if(!canUpdateMemberData){
        const isCenterAdmin = existingMemberCenterId ? await checkPermission(userId, "CENTER_ADMIN", { centerId: existingMemberCenterId }) : false;
        const isMemberAdminInScope = existingMemberCenterId ? await checkPermission(userId, "MEMBER_ADMIN", { centerId: existingMemberCenterId, clusterId: existingMember.clusterId?.toString(), smallGroupId: existingMember.smallGroupId?.toString() }) : false;
        canUpdateMemberData = isCenterAdmin || isMemberAdminInScope;
    }

    const typedUser = session.user as SessionUserWithMemberId;
    const userMemberId = typedUser.memberId;
    if (!canUpdateMemberData && userMemberId && userMemberId === memberIdToUpdate) {
        canUpdateMemberData = true;
    }

    if (!canUpdateMemberData) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to update this member" }, { status: 403 });
    }

    const body = await request.json();
    
    if (!hasHQAdminPermission && !(userMemberId && userMemberId === memberIdToUpdate)) {
        delete body.role; // Deprecated, use assignedRoles
        delete body.permissions; // Deprecated, use assignedRoles
        delete body.assignedRoles; // Only HQ_ADMIN or specific role admins should change roles
        delete body.centerId; 
        delete body.clusterId; // Cluster/SG assignment might be handled by specific functions or roles
        delete body.smallGroupId;
        delete body.memberId; // Member ID should generally not be updatable
    }
    
    // Ensure lastUpdatedBy is set
    body.lastUpdatedBy = userId;

    const updatedMember = await memberService.updateMember(memberIdToUpdate, body);

    if (!updatedMember) {
      return NextResponse.json({ message: "Member not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedMember, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to update member ${params.id}:`, error);
    if (errorMessage.includes("already exists")) { // Check on errorMessage
        return NextResponse.json({ message: errorMessage }, { status: 409 });
    }
    return NextResponse.json({ message: "Failed to update member", error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth(); 
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
    const existingMemberCenterId = existingMember.centerId?.toString();

    const hasHQAdminPermission = await checkPermission(userId, "HQ_ADMIN");
    let canDeleteMember = hasHQAdminPermission;

    if(!canDeleteMember){
        const isCenterAdmin = existingMemberCenterId ? await checkPermission(userId, "CENTER_ADMIN", { centerId: existingMemberCenterId }) : false;
        // MEMBER_ADMIN might be too broad for delete, typically CENTER_ADMIN or HQ_ADMIN
        canDeleteMember = isCenterAdmin;
    }

    if (!canDeleteMember) {
      return NextResponse.json({ message: "Forbidden: Insufficient permissions to delete this member" }, { status: 403 });
    }

    const deletedMember = await memberService.deleteMember(memberIdToDelete);

    if (!deletedMember) {
      return NextResponse.json({ message: "Member not found or delete failed" }, { status: 404 });
    }
    return NextResponse.json({ message: "Member deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`Failed to delete member ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete member", error: errorMessage }, { status: 500 });
  }
}


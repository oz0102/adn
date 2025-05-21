import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth-config";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ hasPermission: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get("centerId");
    const clusterId = searchParams.get("clusterId");
    const smallGroupId = searchParams.get("smallGroupId");

    await connectToDB();
    const user = await User.findById(session.user.id).select("assignedRoles").lean();
    
    if (!user || !user.assignedRoles) {
      return NextResponse.json({ hasPermission: false }, { status: 403 });
    }

    // Check for HQ_ADMIN (has access to everything)
    const isHQAdmin = user.assignedRoles.some(ar => 
      ar.role === "HQ_ADMIN" && !ar.centerId && !ar.clusterId && !ar.smallGroupId
    );
    
    if (isHQAdmin) {
      return NextResponse.json({ hasPermission: true });
    }

    // Check for CENTER_ADMIN if centerId is provided
    if (centerId) {
      const isCenterAdmin = user.assignedRoles.some(ar => 
        ar.role === "CENTER_ADMIN" && ar.centerId && ar.centerId.toString() === centerId
      );
      
      if (isCenterAdmin) {
        return NextResponse.json({ hasPermission: true });
      }
    }

    // Check for CLUSTER_LEADER if clusterId is provided
    if (clusterId) {
      const isClusterLeader = user.assignedRoles.some(ar => 
        ar.role === "CLUSTER_LEADER" && ar.clusterId && ar.clusterId.toString() === clusterId
      );
      
      if (isClusterLeader) {
        return NextResponse.json({ hasPermission: true });
      }
    }

    // Check for SMALL_GROUP_LEADER if smallGroupId is provided
    if (smallGroupId) {
      const isSmallGroupLeader = user.assignedRoles.some(ar => 
        ar.role === "SMALL_GROUP_LEADER" && ar.smallGroupId && ar.smallGroupId.toString() === smallGroupId
      );
      
      if (isSmallGroupLeader) {
        return NextResponse.json({ hasPermission: true });
      }
    }

    // No matching permission found
    return NextResponse.json({ hasPermission: false }, { status: 403 });
  } catch (error) {
    console.error("Error checking permission:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

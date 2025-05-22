import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth"; // Updated import to use auth from @/auth
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(request: NextRequest) {
  try {
    const session = await auth(); // Use auth() instead of getServerSession
    if (!session || !session.user) {
      return NextResponse.json({ hasPermission: false }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get("centerId");
    const clusterId = searchParams.get("clusterId");
    const smallGroupId = searchParams.get("smallGroupId");
    const role = searchParams.get("role");
    const roles = searchParams.get("roles");

    await connectToDB();
    const user = await User.findById(session.user.id).select("assignedRoles").lean();
    
    if (!user || !user.assignedRoles) {
      return NextResponse.json({ hasPermission: false }, { status: 403 });
    }

    // Check for specific role
    if (role) {
      if (role === "HQ_ADMIN") {
        const isHQAdmin = user.assignedRoles.some(ar => 
          ar.role === "HQ_ADMIN" && !ar.centerId && !ar.clusterId && !ar.smallGroupId
        );
        return NextResponse.json({ hasPermission: isHQAdmin });
      }
    }

    // Check for multiple roles (comma-separated)
    if (roles) {
      const roleList = roles.split(',');
      const hasAnyRole = roleList.some(r => {
        if (r === "HQ_ADMIN") {
          return user.assignedRoles.some(ar => 
            ar.role === "HQ_ADMIN" && !ar.centerId && !ar.clusterId && !ar.smallGroupId
          );
        }
        if (r === "CENTER_ADMIN") {
          return user.assignedRoles.some(ar => ar.role === "CENTER_ADMIN");
        }
        if (r === "CLUSTER_LEADER") {
          return user.assignedRoles.some(ar => ar.role === "CLUSTER_LEADER");
        }
        if (r === "SMALL_GROUP_LEADER") {
          return user.assignedRoles.some(ar => ar.role === "SMALL_GROUP_LEADER");
        }
        return false;
      });
      
      return NextResponse.json({ hasPermission: hasAnyRole });
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

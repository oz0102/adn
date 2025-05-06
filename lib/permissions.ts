import User, { IUser } from "@/models/user";
import { connectToDB } from "@/lib/mongodb";
import mongoose from "mongoose";

/**
 * Checks if a user has a specific role, optionally within a given scope.
 *
 * @param userId The ID of the user.
 * @param requiredRole The role to check for (e.g., "HQ_ADMIN", "CENTER_ADMIN").
 * @param scope (Optional) An object defining the scope, e.g., { centerId: "..." }.
 * @returns True if the user has the role within the scope, false otherwise.
 */
export const checkPermission = async (
  userId: string | mongoose.Types.ObjectId,
  requiredRole: string,
  scope?: {
    centerId?: string | mongoose.Types.ObjectId;
    clusterId?: string | mongoose.Types.ObjectId;
    smallGroupId?: string | mongoose.Types.ObjectId;
  }
): Promise<boolean> => {
  await connectToDB();
  const user = await User.findById(userId).select("assignedRoles").lean();
  if (!user || !user.assignedRoles) {
    return false;
  }

  return user.assignedRoles.some(ar => {
    if (ar.role !== requiredRole) {
      return false;
    }

    // Global roles like HQ_ADMIN should not have specific scope IDs in their role assignment
    if (requiredRole === "HQ_ADMIN") {
      return !ar.centerId && !ar.clusterId && !ar.smallGroupId;
    }

    // Scoped roles require matching scope IDs
    if (requiredRole === "CENTER_ADMIN") {
      if (!scope?.centerId || !ar.centerId) return false;
      return ar.centerId.toString() === scope.centerId.toString();
    }

    if (requiredRole === "CLUSTER_LEADER") {
      if (!scope?.clusterId || !ar.clusterId) return false;
      // Optionally, also check if ar.centerId matches scope.centerId if cluster is always within a center scope for the role
      return ar.clusterId.toString() === scope.clusterId.toString();
    }

    if (requiredRole === "SMALL_GROUP_LEADER") {
      if (!scope?.smallGroupId || !ar.smallGroupId) return false;
      return ar.smallGroupId.toString() === scope.smallGroupId.toString();
    }
    
    // MEMBER_ADMIN might be scoped to a center, cluster, or small group
    if (requiredRole === "MEMBER_ADMIN") {
        if (scope?.centerId && ar.centerId && ar.centerId.toString() === scope.centerId.toString() && !ar.clusterId && !ar.smallGroupId) return true;
        if (scope?.clusterId && ar.clusterId && ar.clusterId.toString() === scope.clusterId.toString() && !ar.smallGroupId) return true;
        if (scope?.smallGroupId && ar.smallGroupId && ar.smallGroupId.toString() === scope.smallGroupId.toString()) return true;
        return false;
    }

    // REGULAR_MEMBER role might not need specific scope checks here, or could be tied to a center
    if (requiredRole === "REGULAR_MEMBER") {
        // A regular member is typically part of a center. Their permissions are usually view-only for their own data.
        // This function is more for administrative roles. For REGULAR_MEMBER, access control is usually at data level.
        return true; // Or based on specific logic for what a REGULAR_MEMBER permission means here
    }


    // Fallback for unhandled roles or scopes
    return false;
  });
};


// services/centerService.ts
import Center, { ICenter } from "@/models/center";
import User, { IUser } from "@/models/user"; // For validating centerAdmins and user type
import { connectToDB } from "@/lib/mongodb"; // Adjusted path based on project structure (lib/mongodb.ts likely)

// Authorization checks will primarily be handled by middleware or in API route handlers
// using session data and the updated User model with assignedRoles.

/**
 * Creates a new Center.
 * Requires HQ_ADMIN privileges (checked in API route).
 * @param data - Data for the new center.
 * @returns The created center document.
 */
export const createCenterService = async (data: Partial<ICenter>): Promise<ICenter> => {
  await connectToDB();
  // Validate if centerAdmins exist if provided
  if (data.centerAdmins && data.centerAdmins.length > 0) {
    const admins = await User.find({ 
      _id: { $in: data.centerAdmins },
      // Optionally, check if these users can be center admins
      // "assignedRoles.role": "CENTER_ADMIN" 
    });
    if (admins.length !== data.centerAdmins.length) {
      throw new Error("One or more assigned center admins are invalid.");
    }
  }
  const newCenter = new Center(data);
  await newCenter.save();
  return newCenter;
};

/**
 * Retrieves all Centers.
 * Requires HQ_ADMIN privileges for a full list.
 * CENTER_ADMIN might see their assigned centers (logic to be built in API route based on user role).
 * @returns A list of center documents.
 */
export const getAllCentersService = async (): Promise<ICenter[]> => {
  await connectToDB();
  return Center.find({}).populate("centerAdmins", "email name").lean();
};

/**
 * Retrieves a specific Center by its ID.
 * Authorization (HQ_ADMIN or assigned CENTER_ADMIN) checked in API route.
 * @param id - The ID of the center.
 * @returns The center document or null if not found.
 */
export const getCenterByIdService = async (id: string): Promise<ICenter | null> => {
  await connectToDB();
  return Center.findById(id).populate("centerAdmins", "email name").lean();
};

/**
 * Updates an existing Center.
 * Authorization (HQ_ADMIN or assigned CENTER_ADMIN) checked in API route.
 * @param id - The ID of the center to update.
 * @param data - The data to update the center with.
 * @returns The updated center document or null if not found.
 */
export const updateCenterService = async (id: string, data: Partial<ICenter>): Promise<ICenter | null> => {
  await connectToDB();
    // Validate if centerAdmins exist if provided
  if (data.centerAdmins && data.centerAdmins.length > 0) {
    const admins = await User.find({ _id: { $in: data.centerAdmins } });
    if (admins.length !== data.centerAdmins.length) {
      throw new Error("One or more assigned center admins are invalid during update.");
    }
  }
  return Center.findByIdAndUpdate(id, data, { new: true }).populate("centerAdmins", "email name").lean();
};

/**
 * Deletes a Center.
 * Requires HQ_ADMIN privileges (checked in API route).
 * @param id - The ID of the center to delete.
 * @returns The deleted center document or null if not found.
 */
export const deleteCenterService = async (id: string): Promise<ICenter | null> => {
  await connectToDB();
  // Add logic here to handle disassociation or deletion of related entities (Clusters, SmallGroups, Members)
  // This can be complex and might involve transactions or specific cleanup routines.
  // For now, it's a direct deletion.
  const deletedCenter = await Center.findByIdAndDelete(id).lean();
  if (!deletedCenter) {
    return null;
  }
  // TODO: Implement cascading deletes or disassociations for Clusters, SmallGroups, Members, Events, etc.,
  // that were associated with this centerId.
  return deletedCenter;
};


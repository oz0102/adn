// This file is deprecated and will be removed
// Please use the new auth structure in /auth directory
import { auth, signIn, signOut } from "@/auth";

export { auth, signIn, signOut };

// This export is maintained for backward compatibility
// but should be updated in consuming components
export const authConfig = {};

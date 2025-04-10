/**
 * Client-side authentication hooks
 * Safe to use in client components - no MongoDB imports
 */

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { LoginRequest } from "@/lib/shared/types/user";

/**
 * Hook for accessing the current user session
 * @returns Current session and loading state
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;
  
  return {
    user: session?.user,
    isLoading,
    isAuthenticated
  };
}

/**
 * Hook for authentication actions (login, logout)
 * @returns Authentication actions
 */
export function useAuthActions() {
  const router = useRouter();
  
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      const result = await nextAuthSignIn("credentials", {
        redirect: false,
        email: credentials.email,
        password: credentials.password
      });
      
      if (result?.error) {
        return {
          success: false,
          error: result.error
        };
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "An unexpected error occurred"
      };
    }
  }, []);
  
  const logout = useCallback(async (redirectTo?: string) => {
    await nextAuthSignOut({
      redirect: !!redirectTo,
      callbackUrl: redirectTo
    });
    
    if (!redirectTo) {
      router.push("/login");
    }
  }, [router]);
  
  return {
    login,
    logout
  };
}

/**
 * Hook for checking user permissions
 * @returns Permission checking functions
 */
export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = useCallback((permission: string) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);
  
  const hasRole = useCallback((role: string) => {
    if (!user || !user.role) return false;
    return user.role === role;
  }, [user]);
  
  return {
    hasPermission,
    hasRole
  };
}

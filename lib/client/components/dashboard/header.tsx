// components/dashboard/header.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Settings, User, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/lib/client/components/ui/dropdown-menu"
import { Button } from "@/lib/client/components/ui/button"
import { Avatar, AvatarFallback } from "@/lib/client/components/ui/avatar"
import { useNotificationStore } from "@/lib/store"

import { Session } from "next-auth"; // Import Session type

// Define assignedRole type based on authConfig (can be imported if centralized)
interface AssignedRole {
  role: string;
  centerId?: string;
  clusterId?: string;
  smallGroupId?: string;
}

// Helper function to get display role
const getDisplayRole = (assignedRoles: AssignedRole[] | undefined): string => {
  if (!assignedRoles || assignedRoles.length === 0) {
    return "User";
  }

  const roles = assignedRoles.map(r => r.role);

  if (roles.includes("GLOBAL_ADMIN")) {
    return "Global Admin";
  }
  if (roles.includes("CENTER_ADMIN")) {
    return "Center Admin";
  }
  if (roles.includes("CLUSTER_LEADER")) {
    return "Cluster Leader";
  }
  if (roles.includes("SMALL_GROUP_LEADER")) {
    return "Small Group Leader";
  }
  // Fallback to the first role name if not one of the above, or a generic term
  const firstRoleName = assignedRoles[0].role;
  // Capitalize first letter and replace underscores with spaces for better readability
  return firstRoleName ? firstRoleName.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : "User";
};


export function Header() {
  const { data: session } = useSession()
  const { unreadCount } = useNotificationStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)
    await signOut({ callbackUrl: "/login" })
    setIsLoading(false)
  }

  // Explicitly type session.user.assignedRoles for clarity if needed,
  // though it should come from the Session type update in authConfig
  const userAssignedRoles = session?.user?.assignedRoles as AssignedRole[] | undefined;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button if needed */}
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/notifications">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 text-xs flex items-center justify-center rounded-full bg-red-500 text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {session?.user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {getDisplayRole(userAssignedRoles)}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                disabled={isLoading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoading ? "Signing out..." : "Sign out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

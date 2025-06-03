// components/dashboard/sidebar.tsx
"use client"

// Removed unused import
// import { useState } from "react"
import { usePathname, useParams } from "next/navigation" // Added useParams
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAuthStore, useSidebarStore } from "@/lib/store"
import { 
  Users, 
  ChevronDown, 
  Grid, 
  UserCheck, 
  Calendar, 
  Layers, 
  Bell,
  BarChart3,
  Settings,
  UserPlus,
  Target,
  FileText,
  Home, // Added Home
  Building // Added Building
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavItemProps {
  href: string
  icon: React.ReactNode
  title: string
  isActive: boolean
  isCollapsed?: boolean
}

function NavItem({ href, icon, title, isActive, isCollapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
        isActive ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50" : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
        isCollapsed && "justify-center"
      )}
    >
      {icon}
      {!isCollapsed && <span>{title}</span>}
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { isOpen, toggle } = useSidebarStore()

  console.log("Sidebar user.assignedRoles:", JSON.stringify(user?.assignedRoles, null, 2));

  const defaultHqNavItems = [
    { href: "/dashboard", icon: <Grid className="h-5 w-5" />, title: "Dashboard" },
    { href: "/members", icon: <Users className="h-5 w-5" />, title: "Members" },
    { href: "/clusters", icon: <Layers className="h-5 w-5" />, title: "Clusters" },
    { href: "/small-groups", icon: <UserCheck className="h-5 w-5" />, title: "Small Groups" },
    { href: "/events", icon: <Calendar className="h-5 w-5" />, title: "Events" },
    { href: "/attendance", icon: <UserCheck className="h-5 w-5" />, title: "Attendance" },
    { href: "/follow-ups", icon: <UserPlus className="h-5 w-5" />, title: "Follow-ups" },
    { href: "/teams", icon: <Users className="h-5 w-5" />, title: "Teams" },
    { href: "/flyers", icon: <FileText className="h-5 w-5" />, title: "Flyers" },
    { href: "/discipleship-goals", icon: <Target className="h-5 w-5" />, title: "Goals" },
    { href: "/notifications", icon: <Bell className="h-5 w-5" />, title: "Notifications" },
    { href: "/reports", icon: <BarChart3 className="h-5 w-5" />, title: "Reports" },
  ];

  const getCenterNavItems = (centerId: string) => [
    { href: `/dashboard/centers/${centerId}/dashboard`, icon: <Home className="h-5 w-5" />, title: "Center Dashboard" },
    { href: `/dashboard/centers/${centerId}/members`, icon: <Users className="h-5 w-5" />, title: "Center Members" },
    { href: `/dashboard/centers/${centerId}/clusters`, icon: <Building className="h-5 w-5" />, title: "Center Clusters" }, // Example
    { href: `/dashboard/centers/${centerId}/events`, icon: <Calendar className="h-5 w-5" />, title: "Center Events" }, // Example
    // Add other center-specific links here
    // { href: `/dashboard/centers/${centerId}/settings`, icon: <Settings className="h-5 w-5" />, title: "Center Settings" },
  ];

  let navItemsToShow = [];
  let centerIdFromPath: string | null = null;

  if (pathname.startsWith("/dashboard/centers/")) {
    const parts = pathname.split('/');
    if (parts.length > 3 && parts[1] === 'dashboard' && parts[2] === 'centers') {
      centerIdFromPath = parts[3];
      console.log("Determined centerId from path:", centerIdFromPath);

      const isHqAdminViewingCenter = user?.assignedRoles?.some(r => r.role === 'HQ_ADMIN');
      const isCenterAdminForThisCenter = user?.assignedRoles?.some(r => r.role === 'CENTER_ADMIN' && r.centerId === centerIdFromPath);

      if (isHqAdminViewingCenter || isCenterAdminForThisCenter) {
        navItemsToShow = getCenterNavItems(centerIdFromPath);
        console.log("Showing Center nav items for centerId:", centerIdFromPath);
        // Optionally, add a "Back to HQ Dashboard" link if user is also HQ_ADMIN or if it's a Center Admin
        if (isCenterAdminForThisCenter) {
            navItemsToShow.unshift({ href: "/dashboard", icon: <Grid className="h-5 w-5" />, title: "HQ Dashboard" });
        }
      } else {
        // User is on a center path but not authorized for this specific center's menu
        console.log("User not authorized for this center's menu, showing HQ nav items.");
        navItemsToShow = defaultHqNavItems;
      }
    } else {
      // Path is like /dashboard/centers/ but malformed, show default
      navItemsToShow = defaultHqNavItems;
      console.log("Malformed center path, showing HQ nav items.");
    }
  } else {
    navItemsToShow = defaultHqNavItems;
    console.log("Not a center path, showing HQ nav items.");
  }

  const isHqAdmin = user?.assignedRoles?.some(r => r.role === 'HQ_ADMIN');

  return (
    <aside className={cn(
      "flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
        {isOpen ? (
          <h1 className="text-lg font-semibold">ADN ADMIN</h1>
        ) : (
          <span className="mx-auto font-bold text-xl">CM</span>
        )}
        <Button variant="ghost" size="sm" onClick={toggle}>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            !isOpen && "rotate-90"
          )} />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {navItemsToShow.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
              isCollapsed={!isOpen}
            />
          ))}
          {isHqAdmin && ( // Settings link only for HQ_ADMIN
            <NavItem
              href="/settings"
              icon={<Settings className="h-5 w-5" />}
              title="Settings"
              isActive={pathname.startsWith("/settings")}
              isCollapsed={!isOpen}
            />
          )}
        </div>
      </nav>
    </aside>
  )
}

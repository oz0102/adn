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
  Building, // Added Building
  Clipboard // Added for Attendees
} from "lucide-react"
import { Button } from "@/lib/client/components/ui/button"

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
    { href: "/dashboard/attendees", icon: <Clipboard className="h-5 w-5" />, title: "Attendees" },
  ];

  const getCenterNavItems = (centerId: string) => [
    { href: `/centers/${centerId}/dashboard`, icon: <Home className="h-5 w-5" />, title: "Center Dashboard" },
    // Example: Adjust other links as they are implemented for the new path structure
    { href: `/centers/${centerId}/dashboard/members`, icon: <Users className="h-5 w-5" />, title: "Members" }, // Placeholder for actual members page for center
    { href: `/centers/${centerId}/dashboard/clusters`, icon: <Building className="h-5 w-5" />, title: "Clusters" },
    { href: `/centers/${centerId}/dashboard/events`, icon: <Calendar className="h-5 w-5" />, title: "Events" },
    { href: `/centers/${centerId}/dashboard/attendees`, icon: <Clipboard className="h-5 w-5" />, title: "Attendees" },
    // { href: `/centers/${centerId}/dashboard/settings`, icon: <Settings className="h-5 w-5" />, title: "Settings" },
  ];

  const getClusterNavItems = (clusterId: string) => [
    { href: `/clusters/${clusterId}/dashboard`, icon: <Home className="h-5 w-5" />, title: "Cluster Dashboard" },
    { href: `/clusters/${clusterId}/dashboard/members`, icon: <Users className="h-5 w-5" />, title: "Members" },
    { href: `/clusters/${clusterId}/dashboard/small-groups`, icon: <UserCheck className="h-5 w-5" />, title: "Small Groups" },
    { href: `/clusters/${clusterId}/dashboard/events`, icon: <Calendar className="h-5 w-5" />, title: "Events" },
    // Add other cluster-specific links here
  ];

  let navItemsToShow = [];
  const params = useParams(); // Use useParams to get route parameters

  if (pathname.startsWith("/centers/") && params.centerId) {
    const centerIdFromPath = params.centerId as string;
    console.log("Determined centerId from path (new structure):", centerIdFromPath);

    const isGlobalAdminViewingCenter = user?.assignedRoles?.some(r => r.role === 'GLOBAL_ADMIN');
    const isCenterAdminForThisCenter = user?.assignedRoles?.some(r => r.role === 'CENTER_ADMIN' && r.centerId === centerIdFromPath);

    if (isGlobalAdminViewingCenter || isCenterAdminForThisCenter) {
      navItemsToShow = getCenterNavItems(centerIdFromPath);
      if (isGlobalAdminViewingCenter || isCenterAdminForThisCenter) {
           navItemsToShow.unshift({ href: "/dashboard", icon: <Grid className="h-5 w-5" />, title: "Global Dashboard" });
      }
    } else {
      console.log("User not authorized for this center's menu, showing Global nav items.");
      navItemsToShow = defaultHqNavItems;
    }
  } else if (pathname.startsWith("/clusters/") && params.clusterId) {
    const clusterIdFromPath = params.clusterId as string;
    console.log("Determined clusterId from path:", clusterIdFromPath);

    const isGlobalAdminViewingCluster = user?.assignedRoles?.some(r => r.role === 'GLOBAL_ADMIN');
    // For CLUSTER_LEADER, the checkPermission utility should verify against the user's assignedRoles.
    // This might involve fetching cluster details if centerId is needed and not directly in assignedRole for cluster.
    // For simplicity here, we assume direct clusterId match or GLOBAL_ADMIN.
    // A more robust check might be:
    // const isClusterLeaderForThis = await checkPermission(user, "CLUSTER_LEADER", { clusterId: clusterIdFromPath, centerId: clusterData.centerId /* fetched */ });
    const isClusterLeaderForThis = user?.assignedRoles?.some(r => r.role === 'CLUSTER_LEADER' && r.clusterId === clusterIdFromPath);
    // Also, a CENTER_ADMIN of the parent center should be able to see this cluster's dashboard.
    // This requires fetching cluster details to find its parent centerId if not available directly.
    // This part is simplified for now and can be enhanced if cluster data is readily available here or checkPermission handles it.
    // const parentCenterId = getParentCenterForCluster(clusterIdFromPath); // Placeholder
    // const isCenterAdminForParent = parentCenterId && user?.assignedRoles?.some(r => r.role === 'CENTER_ADMIN' && r.centerId === parentCenterId);

    if (isGlobalAdminViewingCluster || isClusterLeaderForThis /* || isCenterAdminForParent */) {
      navItemsToShow = getClusterNavItems(clusterIdFromPath);
      navItemsToShow.unshift({ href: "/dashboard", icon: <Grid className="h-5 w-5" />, title: "Global Dashboard" });
      // Potentially add "Back to Center Dashboard" if applicable and easy to determine parent center
    } else {
      console.log("User not authorized for this cluster's menu, showing Global nav items.");
      navItemsToShow = defaultHqNavItems;
    }
  } else { // For global dashboard pages or other non-center/non-cluster specific paths
    navItemsToShow = defaultHqNavItems;
    console.log("Not a center-specific or cluster-specific path, showing Global nav items.");
  }

  const isGlobalAdmin = user?.assignedRoles?.some(r => r.role === 'GLOBAL_ADMIN');

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
          {isGlobalAdmin && ( // Settings link only for GLOBAL_ADMIN
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

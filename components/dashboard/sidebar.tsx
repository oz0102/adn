// components/dashboard/sidebar.tsx
"use client"

// Removed unused import
// import { useState } from "react"
import { usePathname } from "next/navigation"
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
  FileText
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
  // Removed unused state variable
  // const [openSection] = useState<string | null>("dashboard")

  const isAdmin = user?.role === "Admin" || user?.role === "Pastor"

  // Removed unused toggleSection function

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
          <NavItem
            href="/dashboard"
            icon={<Grid className="h-5 w-5" />}
            title="Dashboard"
            isActive={pathname === "/dashboard"}
            isCollapsed={!isOpen}
          />
          <NavItem
            href="/members"
            icon={<Users className="h-5 w-5" />}
            title="Members"
            isActive={pathname.startsWith("/members")}
            isCollapsed={!isOpen}
          />
          <NavItem
            href="/clusters"
            icon={<Layers className="h-5 w-5" />}
            title="Clusters"
            isActive={pathname.startsWith("/clusters")}
            isCollapsed={!isOpen}
          />
          <NavItem
            href="/small-groups"
            icon={<UserCheck className="h-5 w-5" />}
            title="Small Groups"
            isActive={pathname.startsWith("/small-groups")}
            isCollapsed={!isOpen}
          />
          <NavItem
            href="/events"
            icon={<Calendar className="h-5 w-5" />}
            title="Events"
            isActive={pathname.startsWith("/events")}
            isCollapsed={!isOpen}
          />
          <NavItem
            href="/attendance"
            icon={<UserCheck className="h-5 w-5" />}
            title="Attendance"
            isActive={pathname.startsWith("/attendance")}
            isCollapsed={!isOpen}
          />
          <NavItem
            href="/follow-ups"
            icon={<UserPlus className="h-5 w-5" />}
            title="Follow-ups"
            isActive={pathname.startsWith("/follow-ups")}
            isCollapsed={!isOpen}
          />
          <NavItem
            href="/teams"
            icon={<Users className="h-5 w-5" />}
            title="Teams"
            isActive={pathname.startsWith("/teams")}
            isCollapsed={!isOpen}
          />
          <NavItem
            href="/flyers"
            icon={<FileText className="h-5 w-5" />}
            title="Flyers"
            isActive={pathname.startsWith("/flyers")}
            isCollapsed={!isOpen}
          />
          <NavItem
            href="/discipleship-goals"
            icon={<Target className="h-5 w-5" />}
            title="Goals"
            isActive={pathname.startsWith("/discipleship-goals")}
            isCollapsed={!isOpen}
          />
          <NavItem
            href="/notifications"
            icon={<Bell className="h-5 w-5" />}
            title="Notifications"
            isActive={pathname.startsWith("/notifications")}
            isCollapsed={!isOpen}
          />
          <NavItem
            href="/reports"
            icon={<BarChart3 className="h-5 w-5" />}
            title="Reports"
            isActive={pathname.startsWith("/reports")}
            isCollapsed={!isOpen}
          />
          {isAdmin && (
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

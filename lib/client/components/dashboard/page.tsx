// app/(dashboard)/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/client/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/lib/client/components/ui/tabs"
import { Clock, Users, Star, UserCheck, Calendar as CalendarIcon } from "lucide-react"
import { DashboardChart } from "./dashboard-chart"
import { RecentActivity } from "./recent-activity"
import { UpcomingEvents } from "./upcoming-events"
import { useToast } from "@/lib/client/hooks/use-toast"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newMembers: 0,
    upcomingEvents: 0,
    pendingFollowUps: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real implementation, fetch actual data from your API
        // This is just placeholder data for now
        setStats({
          totalMembers: 245,
          newMembers: 12,
          upcomingEvents: 3,
          pendingFollowUps: 8,
        })
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : stats.totalMembers}</div>
            <p className="text-xs text-gray-500">Active church members</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Members</CardTitle>
            <Star className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : stats.newMembers}</div>
            <p className="text-xs text-gray-500">Added this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarIcon className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : stats.upcomingEvents}</div>
            <p className="text-xs text-gray-500">Within next 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
            <UserCheck className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : stats.pendingFollowUps}</div>
            <p className="text-xs text-gray-500">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="events">Upcoming Events</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <DashboardChart />
        </TabsContent>
        <TabsContent value="activity">
          <RecentActivity />
        </TabsContent>
        <TabsContent value="events">
          <UpcomingEvents />
        </TabsContent>
      </Tabs>
    </div>
  )
}

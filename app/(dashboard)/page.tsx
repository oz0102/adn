"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Star, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

// Dashboard components
import { DashboardChart } from "@/components/dashboard/dashboard-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingEvents } from "@/components/dashboard/upcoming-events"

export default function DashboardPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMembers: 0,
    newMembers: 0,
    attendanceRate: 0,
    clusters: 0,
    smallGroups: 0,
    followUps: 0
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock stats data
        setStats({
          totalMembers: 235,
          newMembers: 12,
          attendanceRate: 78,
          clusters: 4,
          smallGroups: 16,
          followUps: 8
        })
        
        setIsLoading(false)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
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

      {/* Key metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
            <UserPlus className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : stats.newMembers}</div>
            <p className="text-xs text-gray-500">Added this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : `${stats.attendanceRate}%`}</div>
            <p className="text-xs text-gray-500">Average for last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clusters</CardTitle>
            <Layers className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : stats.clusters}</div>
            <p className="text-xs text-gray-500">Active clusters</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Small Groups</CardTitle>
            <Users className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : stats.smallGroups}</div>
            <p className="text-xs text-gray-500">Active small groups</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
            <UserCheck className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? "..." : stats.followUps}</div>
            <p className="text-xs text-gray-500">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/members/new">
            <UserPlus className="mr-2 h-4 w-4" /> Add Member
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/events/new">
            <Calendar className="mr-2 h-4 w-4" /> Create Event
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/follow-ups/new">
            <UserCheck className="mr-2 h-4 w-4" /> New Follow-up
          </Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/attendance/new">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Record Attendance
          </Link>
        </Button>
      </div>

      {/* Main content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Upcoming Events</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <DashboardChart />
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Birthdays</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading birthdays...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Star className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <p className="text-sm text-gray-500">April 15 (2 days from now)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Star className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Michael Thompson</p>
                        <p className="text-sm text-gray-500">April 18 (5 days from now)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Star className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Rebecca Martinez</p>
                        <p className="text-sm text-gray-500">April 22 (9 days from now)</p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/members?view=birthdays">View all birthdays</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Follow-up Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading follow-ups...</p>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Pending</p>
                        <p className="text-sm text-gray-500">3</p>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: '38%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">In Progress</p>
                        <p className="text-sm text-gray-500">4</p>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: '50%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-sm text-gray-500">12</p>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Failed</p>
                        <p className="text-sm text-gray-500">1</p>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 rounded-full" style={{ width: '13%' }}></div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/follow-ups">Manage follow-ups</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="events">
          <UpcomingEvents />
        </TabsContent>
        
        <TabsContent value="activity">
          <RecentActivity />
        </TabsContent>
      </Tabs>
    </div>
  )
}
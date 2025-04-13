// app/(dashboard)/reports/page.tsx
"use client"

import { useState } from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart3,
  ChevronRight,
  UserCheck,
  Users,
  BarChart,
  PieChart,
  LineChart,
  FileDown,
  Calendar,
  Download,
  Plus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  MembershipReport,
  AttendanceReport,
  ClusterReport,
  SpiritualGrowthReport
} from "@/components/reports"

export default function ReportsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("membership")
  
  const handleExport = (reportType: string) => {
    toast({
      title: "Report Export Started",
      description: `Your ${reportType} report is being prepared for download.`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="bg-blue-50 dark:bg-blue-900/20 pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>Membership</span>
            </CardTitle>
            <CardDescription>
              Church membership data
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">245</div>
            <p className="text-sm text-gray-500">Total members</p>
          </CardContent>
          <CardFooter className="border-t pt-3 pb-3">
            <Button variant="ghost" size="sm" className="w-full" asChild onClick={() => setActiveTab("membership")}>
              <div className="flex justify-between items-center w-full">
                <span>View Report</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-green-50 dark:bg-green-900/20 pb-2">
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <span>Attendance</span>
            </CardTitle>
            <CardDescription>
              Service attendance data
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">78%</div>
            <p className="text-sm text-gray-500">Average attendance</p>
          </CardContent>
          <CardFooter className="border-t pt-3 pb-3">
            <Button variant="ghost" size="sm" className="w-full" asChild onClick={() => setActiveTab("attendance")}>
              <div className="flex justify-between items-center w-full">
                <span>View Report</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-purple-50 dark:bg-purple-900/20 pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-purple-500" />
              <span>Clusters</span>
            </CardTitle>
            <CardDescription>
              Cluster performance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">5</div>
            <p className="text-sm text-gray-500">Active clusters</p>
          </CardContent>
          <CardFooter className="border-t pt-3 pb-3">
            <Button variant="ghost" size="sm" className="w-full" asChild onClick={() => setActiveTab("clusters")}>
              <div className="flex justify-between items-center w-full">
                <span>View Report</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-amber-50 dark:bg-amber-900/20 pb-2">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-amber-500" />
              <span>Spiritual Growth</span>
            </CardTitle>
            <CardDescription>
              Spiritual growth metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">132</div>
            <p className="text-sm text-gray-500">Growth milestones</p>
          </CardContent>
          <CardFooter className="border-t pt-3 pb-3">
            <Button variant="ghost" size="sm" className="w-full" asChild onClick={() => setActiveTab("growth")}>
              <div className="flex justify-between items-center w-full">
                <span>View Report</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="membership" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Membership
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="clusters" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" /> Clusters
            </TabsTrigger>
            <TabsTrigger value="growth" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Spiritual Growth
            </TabsTrigger>
          </TabsList>
          
          <Button variant="outline" onClick={() => handleExport(activeTab)}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
        
        <TabsContent value="membership" className="mt-6">
          <MembershipReport />
        </TabsContent>
        
        <TabsContent value="attendance" className="mt-6">
          <AttendanceReport />
        </TabsContent>
        
        <TabsContent value="clusters" className="mt-6">
          <ClusterReport />
        </TabsContent>
        
        <TabsContent value="growth" className="mt-6">
          <SpiritualGrowthReport />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-bold">Scheduled Reports</h2>
        <Card>
          <CardHeader>
            <CardTitle>Automated Report Delivery</CardTitle>
            <CardDescription>
              Configure automated reports to be delivered via email on a scheduled basis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-lg">Weekly Attendance Report</h3>
                      <p className="text-sm text-gray-500">Sends every Monday at 8:00 AM</p>
                    </div>
                  </div>
                  <Button variant="ghost">Edit</Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold text-lg">Monthly Growth Report</h3>
                      <p className="text-sm text-gray-500">Sends on the 1st of each month</p>
                    </div>
                  </div>
                  <Button variant="ghost">Edit</Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-purple-500" />
                    <div>
                      <h3 className="font-semibold text-lg">Quarterly Membership Report</h3>
                      <p className="text-sm text-gray-500">Sends at the beginning of each quarter</p>
                    </div>
                  </div>
                  <Button variant="ghost">Edit</Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Scheduled Report
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
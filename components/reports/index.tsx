// // components/reports/index.tsx
// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Plus } from "lucide-react"

// export interface ReportProps {
//   id: string
//   title: string
//   description: string
// }

// export function ReportsList() {
//   const [reports, setReports] = useState<ReportProps[]>([])
//   const [isLoading, setIsLoading] = useState(false)

//   return (
//     <div className="space-y-4">
//       {reports.length === 0 ? (
//         <Card>
//           <CardContent className="pt-6 text-center">
//             <p className="text-muted-foreground">No reports found</p>
//             <Button className="mt-4" size="sm">
//               <Plus className="mr-2 h-4 w-4" /> Create Report
//             </Button>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {/* Reports will be displayed here */}
//         </div>
//       )}
//     </div>
//   )
// }

// export function ReportCard({ report }: { report: ReportProps }) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>{report.title}</CardTitle>
//         <CardDescription>{report.description}</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Button variant="outline" size="sm">View Report</Button>
//       </CardContent>
//     </Card>
//   )
// }

// export function ScheduledReportsList() {
//   const [scheduledReports, setScheduledReports] = useState([])
  
//   return (
//     <div className="space-y-4">
//       {scheduledReports.length === 0 ? (
//         <Card>
//           <CardContent className="pt-6 text-center">
//             <p className="text-muted-foreground">No scheduled reports found</p>
//             <Button className="mt-4" size="sm">
//               <Plus className="mr-2 h-4 w-4" /> Schedule Report
//             </Button>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//           {/* Scheduled reports will be displayed here */}
//         </div>
//       )}
//     </div>
//   )
// }



// components/reports/index.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// Removed unused imports
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CalendarDays, Users, UserCheck, Calendar, Award, Download } from "lucide-react"
// Removed unused imports
// import { ChevronRight, Plus } from "lucide-react"

// Membership Report Component
export function MembershipReport() {
  const [timeRange, setTimeRange] = useState("6months")
  
  // Mock data for membership growth over time
  const membershipData = [
    { month: "Jan", members: 215, newMembers: 5 },
    { month: "Feb", members: 225, newMembers: 10 },
    { month: "Mar", members: 230, newMembers: 5 },
    { month: "Apr", members: 235, newMembers: 5 },
    { month: "May", members: 240, newMembers: 5 },
    { month: "Jun", members: 245, newMembers: 5 },
  ]

  // Mock data for member demographics
  const demographicData = [
    { name: "Male", value: 110, color: "#3b82f6" },
    { name: "Female", value: 135, color: "#ec4899" },
  ]

  const ageDistributionData = [
    { age: "0-17", count: 40 },
    { age: "18-25", count: 65 },
    { age: "26-35", count: 75 },
    { age: "36-50", count: 45 },
    { age: "51+", count: 20 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Membership Growth & Demographics</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Membership Growth</CardTitle>
            <CardDescription>Total members over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={membershipData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="members" stroke="#3b82f6" activeDot={{ r: 8 }} name="Total Members" />
                  <Line type="monotone" dataKey="newMembers" stroke="#10b981" name="New Members" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Member breakdown by gender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {demographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Member breakdown by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageDistributionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="age" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                  <Legend />
                  <Bar dataKey="count" name="Members" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">+12</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">92%</div>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Last 6 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Member Age</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">32</div>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Years</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Attendance Report Component
export function AttendanceReport() {
  const [timeRange, setTimeRange] = useState("3months")
  const [eventType, setEventType] = useState("all")
  
  // Mock data for attendance trends
  const attendanceData = [
    { week: "Week 1", attendance: 195, percentage: 78 },
    { week: "Week 2", attendance: 180, percentage: 72 },
    { week: "Week 3", attendance: 210, percentage: 84 },
    { week: "Week 4", attendance: 185, percentage: 74 },
    { week: "Week 5", attendance: 205, percentage: 82 },
    { week: "Week 6", attendance: 215, percentage: 86 },
    { week: "Week 7", attendance: 190, percentage: 76 },
    { week: "Week 8", attendance: 200, percentage: 80 },
  ]

  // Mock data for event type breakdown
  const eventTypeData = [
    { name: "Sunday Service", attendance: 80, color: "#3b82f6" },
    { name: "Midweek Service", attendance: 45, color: "#10b981" },
    { name: "Cluster Meeting", attendance: 35, color: "#f59e0b" },
    { name: "Small Group", attendance: 25, color: "#8b5cf6" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Attendance Metrics</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last month</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              <SelectItem value="sunday">Sunday Service</SelectItem>
              <SelectItem value="midweek">Midweek Service</SelectItem>
              <SelectItem value="cluster">Cluster Meeting</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Weekly attendance numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} unit="%" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="attendance" stroke="#3b82f6" name="Attendance" />
                  <Line yAxisId="right" type="monotone" dataKey="percentage" stroke="#f59e0b" name="Percentage (%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Type Breakdown</CardTitle>
            <CardDescription>Average attendance by event type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eventTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="attendance"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {eventTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} attendees`, 'Average']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Consistency</CardTitle>
          <CardDescription>Tracking member attendance patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { category: "Every week", count: 145 },
                { category: "2-3 times/month", count: 65 },
                { category: "Once/month", count: 20 },
                { category: "Occasionally", count: 10 },
                { category: "New/First-time", count: 5 }
              ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                <Legend />
                <Bar dataKey="count" name="Members" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">78%</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">of total membership</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peak Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">215</div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Last Sunday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">First-time Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">8</div>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Cluster Report Component
export function ClusterReport() {
  const [timeRange, setTimeRange] = useState("3months")
  
  // Mock data for cluster performance
  const clusterData = [
    { name: "North Cluster", members: 65, attendance: 48, smallGroups: 4 },
    { name: "South Cluster", members: 45, attendance: 35, smallGroups: 3 },
    { name: "East Cluster", members: 55, attendance: 40, smallGroups: 4 },
    { name: "West Cluster", members: 50, attendance: 42, smallGroups: 3 },
    { name: "Central Cluster", members: 30, attendance: 25, smallGroups: 2 }
  ]
  
  // Mock data for cluster growth
  const growthData = [
    { month: "Jan", north: 62, south: 42, east: 52, west: 45, central: 28 },
    { month: "Feb", north: 63, south: 43, east: 53, west: 46, central: 28 },
    { month: "Mar", north: 64, south: 44, east: 53, west: 48, central: 29 },
    { month: "Apr", north: 64, south: 44, east: 54, west: 48, central: 29 },
    { month: "May", north: 65, south: 45, east: 55, west: 49, central: 30 },
    { month: "Jun", north: 65, south: 45, east: 55, west: 50, central: 30 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Cluster Performance</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cluster Comparison</CardTitle>
          <CardDescription>Metrics across all clusters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clusterData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="members" name="Total Members" fill="#3b82f6" />
                <Bar dataKey="attendance" name="Average Attendance" fill="#10b981" />
                <Bar dataKey="smallGroups" name="Small Groups" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cluster Growth</CardTitle>
          <CardDescription>Membership trends by cluster</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="north" stroke="#3b82f6" name="North Cluster" />
                <Line type="monotone" dataKey="south" stroke="#10b981" name="South Cluster" />
                <Line type="monotone" dataKey="east" stroke="#f59e0b" name="East Cluster" />
                <Line type="monotone" dataKey="west" stroke="#8b5cf6" name="West Cluster" />
                <Line type="monotone" dataKey="central" stroke="#ec4899" name="Central Cluster" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate by Cluster</CardTitle>
            <CardDescription>Average attendance as percentage of membership</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clusterData.map(cluster => ({
                  name: cluster.name,
                  rate: Math.round(cluster.attendance / cluster.members * 100)
                }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} unit="%" />
                  <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                  <Legend />
                  <Bar dataKey="rate" name="Attendance Rate" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Small Group Distribution</CardTitle>
            <CardDescription>Number of small groups per cluster</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clusterData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="smallGroups"
                    nameKey="name"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {clusterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} groups`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Spiritual Growth Report Component
export function SpiritualGrowthReport() {
  const [timeRange, setTimeRange] = useState("1year")

  // Mock data for spiritual growth stages
  const growthStageData = [
    { stage: "New Convert", count: 45 },
    { stage: "Water Baptism", count: 180 },
    { stage: "Holy Ghost Baptism", count: 150 },
    { stage: "Worker", count: 75 },
    { stage: "Minister", count: 25 },
    { stage: "Ordained Minister", count: 12 }
  ];

  // Mock data for spiritual growth trends
  const growthTrendsData = [
    { quarter: "Q1", newConvert: 10, waterBaptism: 15, holyGhostBaptism: 8, worker: 5 },
    { quarter: "Q2", newConvert: 12, waterBaptism: 18, holyGhostBaptism: 10, worker: 7 },
    { quarter: "Q3", newConvert: 14, waterBaptism: 20, holyGhostBaptism: 12, worker: 8 },
    { quarter: "Q4", newConvert: 9, waterBaptism: 16, holyGhostBaptism: 9, worker: 6 }
  ];
  
  // Mock data for discipleship training
  const trainingData = [
    { category: "Foundations", completed: 85, inProgress: 30 },
    { category: "Bible Study", completed: 65, inProgress: 25 },
    { category: "Leadership", completed: 40, inProgress: 15 },
    { category: "Evangelism", completed: 55, inProgress: 20 },
    { category: "Mentorship", completed: 35, inProgress: 18 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Spiritual Growth Metrics</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
              <SelectItem value="3years">Last 3 years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Growth Stages Distribution</CardTitle>
            <CardDescription>Members at each spiritual growth stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthStageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                  <Legend />
                  <Bar dataKey="count" name="Members" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>Quarterly progression by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="newConvert" stroke="#3b82f6" name="New Convert" />
                  <Line type="monotone" dataKey="waterBaptism" stroke="#10b981" name="Water Baptism" />
                  <Line type="monotone" dataKey="holyGhostBaptism" stroke="#f59e0b" name="Holy Ghost Baptism" />
                  <Line type="monotone" dataKey="worker" stroke="#8b5cf6" name="Worker" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discipleship Training</CardTitle>
          <CardDescription>Training program completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip formatter={(value) => [`${value} members`, 'Count']} />
                <Legend />
                <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" />
                <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Baptized Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">73%</div>
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">of total membership</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Growth Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">132</div>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Training Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">68%</div>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Average rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Export other components from the original file
export interface ReportProps {
  id: string
  title: string
  description: string
}

export function ReportsList() {
  // Using array destructuring to only get the first element (the state value)
  const [reports] = useState<ReportProps[]>([])
  // Removed unused state variables
  // const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="space-y-4">
      {reports.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No reports found</p>
            <Button className="mt-4" size="sm">
              Create Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Reports will be displayed here */}
        </div>
      )}
    </div>
  )
}

export function ReportCard({ report }: { report: ReportProps }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{report.title}</CardTitle>
        <CardDescription>{report.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm">View Report</Button>
      </CardContent>
    </Card>
  )
}

export function ScheduledReportsList() {
  // Using array destructuring to only get the first element (the state value)
  const [scheduledReports] = useState([])
  
  return (
    <div className="space-y-4">
      {scheduledReports.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No scheduled reports found</p>
            <Button className="mt-4" size="sm">
              Schedule Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Scheduled reports will be displayed here */}
        </div>
      )}
    </div>
  )
}
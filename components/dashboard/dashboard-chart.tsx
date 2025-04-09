// components/dashboard/dashboard-chart.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"

const data = [
  { month: "Jan", members: 50, attendance: 40 },
  { month: "Feb", members: 60, attendance: 45 },
  { month: "Mar", members: 75, attendance: 55 },
  { month: "Apr", members: 90, attendance: 65 },
  { month: "May", members: 110, attendance: 80 },
  { month: "Jun", members: 125, attendance: 90 },
  { month: "Jul", members: 140, attendance: 100 },
  { month: "Aug", members: 155, attendance: 110 },
  { month: "Sep", members: 170, attendance: 120 },
  { month: "Oct", members: 185, attendance: 130 },
  { month: "Nov", members: 200, attendance: 150 },
  { month: "Dec", members: 235, attendance: 180 },
]

export function DashboardChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership & Attendance Growth</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="members" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="attendance" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
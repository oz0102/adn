// components/discipleship-goals/goal-chart.tsx
"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DiscipleshipGoal {
  _id: string
  year: number
  targets: {
    newConverts: number
    waterBaptism: number
    holyGhostBaptism: number
    discipleshipTraining: number
    leadership: number
    churchAttendance: number
  }
  current: {
    newConverts: number
    waterBaptism: number
    holyGhostBaptism: number
    discipleshipTraining: number
    leadership: number
    churchAttendance: number
  }
  progress: {
    newConverts: number
    waterBaptism: number
    holyGhostBaptism: number
    discipleshipTraining: number
    leadership: number
    churchAttendance: number
  }
}

interface DiscipleshipGoalChartProps {
  data: DiscipleshipGoal[]
  type: 'targets' | 'progress'
}

export function DiscipleshipGoalChart({ data, type }: DiscipleshipGoalChartProps) {
  // Convert data to format expected by recharts
  const chartData = data.map(goal => ({
    year: goal.year,
    ...((type === 'targets') ? goal.targets : 
       (type === 'progress') ? {
        newConverts: goal.progress.newConverts,
        waterBaptism: goal.progress.waterBaptism,
        holyGhostBaptism: goal.progress.holyGhostBaptism,
        discipleshipTraining: goal.progress.discipleshipTraining,
        leadership: goal.progress.leadership,
        churchAttendance: goal.progress.churchAttendance
      } : goal.current)
  }))

  // Colors for the bars
  const colors = {
    newConverts: '#3b82f6', // blue
    waterBaptism: '#6366f1', // indigo
    holyGhostBaptism: '#ef4444', // red
    discipleshipTraining: '#22c55e', // green
    leadership: '#a855f7', // purple
    churchAttendance: '#f59e0b' // amber
  }

  // Don't include church attendance for better scaling if type is targets
  const keys = type === 'targets' ? 
    ['newConverts', 'waterBaptism', 'holyGhostBaptism', 'discipleshipTraining', 'leadership'] :
    ['newConverts', 'waterBaptism', 'holyGhostBaptism', 'discipleshipTraining', 'leadership']

  // Labels for the legend
  const labels = {
    newConverts: 'New Converts',
    waterBaptism: 'Water Baptism',
    holyGhostBaptism: 'Holy Ghost Baptism',
    discipleshipTraining: 'Discipleship Training',
    leadership: 'Leadership',
    churchAttendance: 'Church Attendance'
  }

  const formatYAxis = (value: number): string => {
    if (type === 'progress') {
      return `${value}%`
    }
    return value.toString()
  }

  const formatTooltip = (value: number, name: string) => {
    if (type === 'progress') {
      return [`${value}%`, labels[name as keyof typeof labels]]
    }
    return [value, labels[name as keyof typeof labels]]
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis 
            tickFormatter={formatYAxis}
            domain={type === 'progress' ? [0, 100] as [number, number] : 'auto'} 
          />
          <Tooltip 
            formatter={formatTooltip}
          />
          <Legend />
          {keys.map(key => (
            <Bar 
              key={key} 
              dataKey={key} 
              fill={colors[key as keyof typeof colors]} 
              name={labels[key as keyof typeof labels]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

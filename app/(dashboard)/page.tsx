// app/(dashboard)/page.tsx
"use client"

import React from 'react';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { UpcomingEventsCard } from '@/components/dashboard/upcoming-events-card';
import { ChartCard } from '@/components/ui/chart-card';
import { DataCard } from '@/components/ui/data-card';
import { Users, UserCheck, Calendar, Clock } from 'lucide-react';

export default function DashboardPage() {
  // Sample chart data for attendance trends
  const attendanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sunday Service',
        data: [65, 72, 68, 75, 82, 78],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Midweek Service',
        data: [42, 45, 40, 48, 53, 50],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
      }
    ],
  };

  // Sample chart data for member growth
  const memberGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Members',
        data: [8, 12, 10, 14, 16, 12],
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      }
    ],
  };

  // Sample chart data for member demographics
  const demographicsData = {
    labels: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
    datasets: [
      {
        label: 'Age Distribution',
        data: [15, 25, 30, 20, 7, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      }
    ],
  };

  // Sample data for spiritual growth
  const spiritualGrowthData = {
    labels: ['New Convert', 'Water Baptism', 'Holy Ghost Baptism', 'Worker', 'Minister'],
    datasets: [
      {
        label: 'Members',
        data: [120, 95, 80, 45, 20],
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 1,
      }
    ],
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Stats Cards */}
      <DashboardStats className="mt-6" />
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed - Takes 1/3 of the width on large screens */}
        <div className="lg:col-span-1">
          <ActivityFeed className="h-full" />
        </div>
        
        {/* Upcoming Events - Takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <UpcomingEventsCard className="h-full" />
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard 
          title="Attendance Trends" 
          type="line" 
          data={attendanceData} 
        />
        <ChartCard 
          title="Member Growth" 
          type="bar" 
          data={memberGrowthData} 
        />
        <ChartCard 
          title="Age Demographics" 
          type="doughnut" 
          data={demographicsData} 
        />
        <ChartCard 
          title="Spiritual Growth Stages" 
          type="bar" 
          data={spiritualGrowthData} 
        />
      </div>
      
      {/* Additional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard 
          title="Birthdays This Month" 
          icon={<Calendar className="h-4 w-4" />}
          action={{
            label: "View All",
            onClick: () => console.log("View all birthdays")
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">April 15</p>
                </div>
              </div>
              <button className="text-sm text-primary">Send Wishes</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Jane Smith</p>
                  <p className="text-sm text-muted-foreground">April 22</p>
                </div>
              </div>
              <button className="text-sm text-primary">Send Wishes</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Michael Johnson</p>
                  <p className="text-sm text-muted-foreground">April 28</p>
                </div>
              </div>
              <button className="text-sm text-primary">Send Wishes</button>
            </div>
          </div>
        </DataCard>
        
        <DataCard 
          title="Pending Follow-ups" 
          icon={<UserCheck className="h-4 w-4" />}
          action={{
            label: "View All",
            onClick: () => console.log("View all follow-ups")
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Sarah Williams</p>
                  <p className="text-sm text-muted-foreground">New Attendee - First Visit</p>
                </div>
              </div>
              <button className="text-sm text-primary">Follow Up</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Robert Brown</p>
                  <p className="text-sm text-muted-foreground">Member - Missed 3 Services</p>
                </div>
              </div>
              <button className="text-sm text-primary">Follow Up</button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Emily Davis</p>
                  <p className="text-sm text-muted-foreground">New Convert - Baptism Interest</p>
                </div>
              </div>
              <button className="text-sm text-primary">Follow Up</button>
            </div>
          </div>
        </DataCard>
      </div>
    </div>
  );
}


// components/dashboard/dashboard-stats.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { StatsCard } from '@/components/ui/stats-card';
import { Users, Calendar, UserCheck, Clock } from 'lucide-react';

interface DashboardStatsProps {
  className?: string;
}

export function DashboardStats({ className }: DashboardStatsProps) {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newMembers: 0,
    upcomingEvents: 0,
    pendingFollowUps: 0,
    attendanceRate: 0,
  });

  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    // For now, we'll use placeholder data
    setStats({
      totalMembers: 256,
      newMembers: 12,
      upcomingEvents: 5,
      pendingFollowUps: 8,
      attendanceRate: 78,
    });
  }, []);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <StatsCard
        title="Total Members"
        value={stats.totalMembers.toString()}
        icon={<Users className="h-4 w-4" />}
        description="Active church members"
        change={4.5}
        changeType="increase"
      />
      <StatsCard
        title="New Members"
        value={stats.newMembers.toString()}
        icon={<UserCheck className="h-4 w-4" />}
        description="This month"
        change={2.1}
        changeType="increase"
      />
      <StatsCard
        title="Upcoming Events"
        value={stats.upcomingEvents.toString()}
        icon={<Calendar className="h-4 w-4" />}
        description="Next 7 days"
      />
      <StatsCard
        title="Attendance Rate"
        value={`${stats.attendanceRate}%`}
        icon={<Clock className="h-4 w-4" />}
        description="Last Sunday"
        change={1.2}
        changeType="decrease"
      />
    </div>
  );
}

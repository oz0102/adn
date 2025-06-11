"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'; // Import Link
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { UpcomingEventsCard } from '@/components/dashboard/upcoming-events-card';
import { ChartCard } from '@/lib/client/components/ui/chart-card';
import { DataCard } from '@/lib/client/components/ui/data-card';
import { Users, UserCheck, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api-client'; // Assuming apiClient is set up
import { useToast } from '@/lib/client/components/ui/use-toast';
import { IMember } from '@/models/member'; // For Member type
import { IFollowUp } from '@/models/followUp'; // For FollowUp type
// import { IAttendance } from '@/models/attendance'; // If you have an attendance model and API

// Helper function to get month name
const getMonthName = (monthIndex: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

export default function DashboardPage() {
  const { toast } = useToast();
  const [memberGrowthData, setMemberGrowthData] = useState<any>({ labels: [], datasets: [] });
  const [demographicsData, setDemographicsData] = useState<any>({ labels: [], datasets: [] });
  // For attendance and spiritual growth, we'll keep sample data for now if APIs are complex
  const [attendanceData] = useState({ /* ... keep sample or fetch ... */
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Sunday Service', data: [65, 72, 68, 75, 82, 78], borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.5)' },
      { label: 'Midweek Service', data: [42, 45, 40, 48, 53, 50], borderColor: 'rgb(16, 185, 129)', backgroundColor: 'rgba(16, 185, 129, 0.5)' }
    ],
  });
  const [spiritualGrowthData] = useState({ /* ... keep sample or fetch ... */
    labels: ['New Convert', 'Water Baptism', 'Holy Ghost Baptism', 'Worker', 'Minister'],
    datasets: [{ label: 'Members', data: [120, 95, 80, 45, 20], backgroundColor: 'rgba(147, 51, 234, 0.5)', borderColor: 'rgb(147, 51, 234)', borderWidth: 1, }]
  });

  const [birthdaysThisMonth, setBirthdaysThisMonth] = useState<IMember[]>([]);
  const [pendingFollowUps, setPendingFollowUps] = useState<IFollowUp[]>([]); // Using IFollowUp from model

  const fetchMemberDataForCharts = useCallback(async () => {
    try {
      // Fetch all members (consider pagination if dataset is huge, but for charting we might need all)
      const response = await apiClient.get<{ members: IMember[] }>('/members?limit=10000'); // Adjust limit as needed
      const members = response.members || [];

      // Process Member Growth Data (e.g., last 6 months)
      const growthCounts: { [key: string]: number } = {};
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Track last 6 months including current
      sixMonthsAgo.setDate(1); // Start from the beginning of the month

      members.forEach(member => {
        const joinedDate = new Date(member.createdAt); // Assuming 'createdAt' is the join date
        if (joinedDate >= sixMonthsAgo) {
          const monthYear = `${getMonthName(joinedDate.getMonth())} ${joinedDate.getFullYear()}`;
          growthCounts[monthYear] = (growthCounts[monthYear] || 0) + 1;
        }
      });

      const growthLabels = Object.keys(growthCounts);
      const growthValues = Object.values(growthCounts);
      setMemberGrowthData({
        labels: growthLabels,
        datasets: [{ label: 'New Members', data: growthValues, backgroundColor: 'rgba(99, 102, 241, 0.5)', borderColor: 'rgb(99, 102, 241)', borderWidth: 1 }],
      });

      // Process Demographics Data (Age)
      const ageCounts: { [key: string]: number } = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55-64': 0, '65+': 0, 'Unknown': 0 };
      members.forEach(member => {
        if (member.dateOfBirth) {
          const birthDate = new Date(member.dateOfBirth);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          // Basic age calculation, can be refined
          if (age >= 18 && age <= 24) ageCounts['18-24']++;
          else if (age >= 25 && age <= 34) ageCounts['25-34']++;
          else if (age >= 35 && age <= 44) ageCounts['35-44']++;
          else if (age >= 45 && age <= 54) ageCounts['45-54']++;
          else if (age >= 55 && age <= 64) ageCounts['55-64']++;
          else if (age >= 65) ageCounts['65+']++;
          else ageCounts['Unknown']++;
        } else {
          ageCounts['Unknown']++;
        }
      });
      setDemographicsData({
        labels: Object.keys(ageCounts),
        datasets: [{ label: 'Age Distribution', data: Object.values(ageCounts),
          backgroundColor: ['rgba(255, 99, 132, 0.5)','rgba(54, 162, 235, 0.5)','rgba(255, 206, 86, 0.5)','rgba(75, 192, 192, 0.5)','rgba(153, 102, 255, 0.5)','rgba(255, 159, 64, 0.5)', 'rgba(200, 200, 200, 0.5)'],
          borderColor: ['rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)','rgba(153, 102, 255, 1)','rgba(255, 159, 64, 1)', 'rgba(200, 200, 200, 1)'],
          borderWidth: 1 }],
      });

    } catch (err) {
      console.error("Failed to fetch member data for charts:", err);
      toast({ title: "Error", description: "Could not load chart data for members.", variant: "destructive" });
    }
  }, [toast]);

  const fetchBirthdays = useCallback(async () => {
    try {
      const response = await apiClient.get<{ members: IMember[] }>('/members?birthMonth=current&limit=5'); // Assuming API supports this
      setBirthdaysThisMonth(response.members || []);
    } catch (err) {
      console.error("Failed to fetch birthdays:", err);
      toast({ title: "Error", description: "Could not load birthday information.", variant: "destructive" });
    }
  }, [toast]);

  const fetchPendingFollowUps = useCallback(async () => {
    try {
      // Assuming IFollowUp is the correct type from your models after population
      const response = await apiClient.get<{ followUps: IFollowUp[] }>('/follow-ups?status=Pending&limit=5&populate=personId,attendeeId');
      setPendingFollowUps(response.followUps || []);
    } catch (err) {
      console.error("Failed to fetch pending follow-ups:", err);
      toast({ title: "Error", description: "Could not load pending follow-ups.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchMemberDataForCharts();
    fetchBirthdays();
    fetchPendingFollowUps();
    // TODO: Fetch data for Attendance Trends and Spiritual Growth Stages
  }, [fetchMemberDataForCharts, fetchBirthdays, fetchPendingFollowUps]);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Global Dashboard</h1>
      
      <DashboardStats className="mt-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1"><ActivityFeed className="h-full" /></div>
        <div className="lg:col-span-2"><UpcomingEventsCard className="h-full" /></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Attendance Trends" type="line" data={attendanceData} />
        <ChartCard title="Member Growth (Last 6 Months)" type="bar" data={memberGrowthData} />
        <ChartCard title="Age Demographics" type="doughnut" data={demographicsData} />
        <ChartCard title="Spiritual Growth Stages" type="bar" data={spiritualGrowthData} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard 
          title="Birthdays This Month" 
          icon={<Calendar className="h-4 w-4" />}
          action={{ label: "View All Members", href: "/dashboard/members" }} // Link to members page
        >
          <div className="space-y-3">
            {birthdaysThisMonth.length > 0 ? birthdaysThisMonth.map(member => (
              <div key={member._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2 rounded-full"><Users className="h-4 w-4" /></div>
                  <div>
                    <p className="font-medium">{member.firstName} {member.lastName}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
                {/* <button className="text-sm text-primary">Send Wishes</button> // Action per item can be complex */}
              </div>
            )) : <p className="text-sm text-muted-foreground">No birthdays this month.</p>}
          </div>
        </DataCard>
        
        <DataCard 
          title="Pending Follow-ups" 
          icon={<UserCheck className="h-4 w-4" />}
          action={{ label: "View All Follow-ups", href: "/dashboard/follow-ups?status=Pending" }}
        >
          <div className="space-y-3">
            {pendingFollowUps.length > 0 ? pendingFollowUps.map(followUp => {
              let personName = "N/A";
              if (followUp.personId) personName = `${(followUp.personId as any).firstName} ${(followUp.personId as any).lastName}`;
              else if (followUp.attendeeId) personName = `${(followUp.attendeeId as any).firstName} ${(followUp.attendeeId as any).lastName}`;
              else if (followUp.newAttendee) personName = `${followUp.newAttendee.firstName} ${followUp.newAttendee.lastName}`;

              return (
                <div key={followUp._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full"><UserCheck className="h-4 w-4" /></div>
                    <div>
                      <p className="font-medium">{personName}</p>
                      <p className="text-sm text-muted-foreground">{followUp.personType} - {followUp.notes?.substring(0,30) || "Needs attention"}{followUp.notes && followUp.notes.length > 30 ? "..." : ""}</p>
                    </div>
                  </div>
                  <Button variant="link" size="sm" asChild>
                    <Link href={`/dashboard/follow-ups/${followUp._id}`}>View</Link>
                  </Button>
                </div>
              );
            }) : <p className="text-sm text-muted-foreground">No pending follow-ups.</p>}
          </div>
        </DataCard>
      </div>
    </div>
  );
}

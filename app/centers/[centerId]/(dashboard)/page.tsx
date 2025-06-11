"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // useRouter for navigation
import { DashboardStats } from '@/lib/client/components/dashboard/dashboard-stats'; // Assuming this can be adapted or is already flexible
import { ActivityFeed } from '@/lib/client/components/dashboard/activity-feed'; // Assuming this can be adapted
import { UpcomingEventsCard } from '@/lib/client/components/dashboard/upcoming-events-card'; // Assuming this can be adapted
import { ChartCard } from '@/lib/client/components/ui/chart-card';
import { DataCard } from '@/lib/client/components/ui/data-card';
import { Users, UserCheck, Calendar, AlertTriangleIcon } from 'lucide-react';
import { apiClient } from '@/lib/client/api/api-client';
import { useToast } from '@/lib/client/components/ui/use-toast';
import { useAuthStore } from '@/lib/store';
import { checkPermission } from '@/lib/permissions';
import { ICenter } from '@/models/center'; // For Center type
import { IMember } from '@/models/member';
import { IFollowUp } from '@/models/followUp';
import Link from 'next/link';

// Helper function to get month name
const getMonthName = (monthIndex: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

export default function CenterDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const centerId = params.centerId as string;
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [center, setCenter] = useState<ICenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [canViewDashboard, setCanViewDashboard] = useState(false);

  // Stats and Chart Data (scoped to centerId)
  const [memberGrowthData, setMemberGrowthData] = useState<any>({ labels: [], datasets: [] });
  const [demographicsData, setDemographicsData] = useState<any>({ labels: [], datasets: [] });
  const [attendanceData, setAttendanceData] = useState<any>({ labels: [], datasets: [] }); // Placeholder
  const [spiritualGrowthData, setSpiritualGrowthData] = useState<any>({ labels: [], datasets: [] }); // Placeholder

  const [birthdaysThisMonth, setBirthdaysThisMonth] = useState<IMember[]>([]);
  const [pendingFollowUps, setPendingFollowUps] = useState<IFollowUp[]>([]);


  // Fetch Center Details
  const fetchCenterDetails = useCallback(async () => {
    if (!centerId) return;
    try {
      const data = await apiClient.get<{ center: ICenter }>(`/centers/${centerId}`);
      setCenter(data.center);
    } catch (err: any) {
      setError(err.message || "Failed to load center details.");
      toast({ title: "Error", description: "Failed to load center details.", variant: "destructive" });
    }
  }, [centerId, toast]);

  // Check permissions
 useEffect(() => {
    const checkPermissionsAndFetch = async () => {
      if (user && centerId) {
        const hasPermission =
          await checkPermission(user, "GLOBAL_ADMIN") ||
          await checkPermission(user, "CENTER_ADMIN", { centerId });

        setCanViewDashboard(hasPermission);
        if (hasPermission) {
          setIsLoading(true);
          await fetchCenterDetails();
          // Chain other data fetching here after center details and permissions are confirmed
          await fetchMemberDataForCharts();
          await fetchBirthdays();
          await fetchPendingFollowUps();
          // TODO: Fetch data for Attendance Trends and Spiritual Growth Stages (scoped)
          setIsLoading(false);
        } else {
          setError("You do not have permission to view this center's dashboard.");
          setIsLoading(false);
        }
      }
    };
    checkPermissionsAndFetch();
  }, [user, centerId, fetchCenterDetails]); // Added fetchCenterDetails to dependencies

  const fetchMemberDataForCharts = useCallback(async () => {
    if (!centerId) return;
    try {
      const response = await apiClient.get<{ members: IMember[] }>(`/members?centerId=${centerId}&limit=10000`);
      const members = response.members || [];

      const growthCounts: { [key: string]: number } = {};
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);

      members.forEach(member => {
        const joinedDate = new Date(member.createdAt);
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

      const ageCounts: { [key: string]: number } = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55-64': 0, '65+': 0, 'Unknown': 0 };
      members.forEach(member => {
        if (member.dateOfBirth) {
          const birthDate = new Date(member.dateOfBirth);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          if (age >= 18 && age <= 24) ageCounts['18-24']++;
          else if (age >= 25 && age <= 34) ageCounts['25-34']++;
          else if (age >= 35 && age <= 44) ageCounts['35-44']++;
          else if (age >= 45 && age <= 54) ageCounts['45-54']++;
          else if (age >= 55 && age <= 64) ageCounts['55-64']++;
          else if (age >= 65) ageCounts['65+']++;
          else ageCounts['Unknown']++;
        } else ageCounts['Unknown']++;
      });
      setDemographicsData({
        labels: Object.keys(ageCounts),
        datasets: [{ label: 'Age Distribution', data: Object.values(ageCounts),
          backgroundColor: ['rgba(255, 99, 132, 0.5)','rgba(54, 162, 235, 0.5)','rgba(255, 206, 86, 0.5)','rgba(75, 192, 192, 0.5)','rgba(153, 102, 255, 0.5)','rgba(255, 159, 64, 0.5)', 'rgba(200, 200, 200, 0.5)'],
          borderColor: ['rgba(255, 99, 132, 1)','rgba(54, 162, 235, 1)','rgba(255, 206, 86, 1)','rgba(75, 192, 192, 1)','rgba(153, 102, 255, 1)','rgba(255, 159, 64, 1)', 'rgba(200, 200, 200, 1)'],
          borderWidth: 1 }],
      });
    } catch (err) { toast({ title: "Error", description: "Could not load chart data for members.", variant: "destructive" }); }
  }, [centerId, toast]);

  const fetchBirthdays = useCallback(async () => {
    if (!centerId) return;
    try {
      const response = await apiClient.get<{ members: IMember[] }>(`/members?centerId=${centerId}&birthMonth=current&limit=5`);
      setBirthdaysThisMonth(response.members || []);
    } catch (err) { toast({ title: "Error", description: "Could not load birthday information.", variant: "destructive" }); }
  }, [centerId, toast]);

  const fetchPendingFollowUps = useCallback(async () => {
    if (!centerId) return;
    try {
      const response = await apiClient.get<{ followUps: IFollowUp[] }>(`/follow-ups?centerId=${centerId}&status=Pending&limit=5&populate=personId,attendeeId`);
      setPendingFollowUps(response.followUps || []);
    } catch (err) { toast({ title: "Error", description: "Could not load pending follow-ups.", variant: "destructive" }); }
  }, [centerId, toast]);

  // Initial data fetch moved to the permission check effect.

  if (isLoading) {
    return <div className="container mx-auto py-6 text-center"><p>Loading dashboard...</p></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
         <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Global Dashboard
        </Button>
      </div>
    );
  }

  if (!canViewDashboard) {
      return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view this center's dashboard.</p>
         <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Global Dashboard
        </Button>
      </div>
    );
  }


  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard for {center?.name || 'Center'}</h1>

      <DashboardStats className="mt-6" centerId={centerId} /> {/* Pass centerId to DashboardStats */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1"><ActivityFeed className="h-full" centerId={centerId} /></div> {/* Pass centerId */}
        <div className="lg:col-span-2"><UpcomingEventsCard className="h-full" centerId={centerId} /></div> {/* Pass centerId */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Attendance Trends (Center)" type="line" data={attendanceData} />
        <ChartCard title="Member Growth (Center, Last 6 Months)" type="bar" data={memberGrowthData} />
        <ChartCard title="Age Demographics (Center)" type="doughnut" data={demographicsData} />
        <ChartCard title="Spiritual Growth Stages (Center)" type="bar" data={spiritualGrowthData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard
          title="Birthdays This Month (Center)"
          icon={<Calendar className="h-4 w-4" />}
          action={{ label: "View All Members", href: `/centers/${centerId}/dashboard/members` }}
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
              </div>
            )) : <p className="text-sm text-muted-foreground">No birthdays this month in this center.</p>}
          </div>
        </DataCard>

        <DataCard
          title="Pending Follow-ups (Center)"
          icon={<UserCheck className="h-4 w-4" />}
          action={{ label: "View All Follow-ups", href: `/dashboard/follow-ups?centerId=${centerId}&status=Pending` }}
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
                   <Button variant="link" size="sm" asChild><Link href={`/dashboard/follow-ups/${followUp._id}`}>View</Link></Button>
                </div>);
            }) : <p className="text-sm text-muted-foreground">No pending follow-ups in this center.</p>}
          </div>
        </DataCard>
      </div>
    </div>
  );
}

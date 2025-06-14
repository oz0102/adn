"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardStats } from '@/lib/client/components/dashboard/dashboard-stats';
import { ActivityFeed } from '@/lib/client/components/dashboard/activity-feed';
import { UpcomingEventsCard } from '@/lib/client/components/dashboard/upcoming-events-card';
import { ChartCard } from '@/lib/client/components/ui/chart-card';
import { DataCard } from '@/lib/client/components/ui/data-card';
import { Users, UserCheck, Calendar, AlertTriangleIcon, HomeIcon, ArrowLeft } from 'lucide-react';
import { apiClient } from '@/lib/client/api/api-client';
import { useToast } from '@/lib/client/components/ui/use-toast';
import { useAuthStore } from '@/lib/store';
import { checkPermission } from '@/lib/permissions';
import { ICluster } from '@/models/cluster';
import { IMember } from '@/models/member';
import { ISmallGroup } from '@/models/smallGroup';
import Link from 'next/link';
import { Button } from '@/lib/client/components/ui/button';

// Helper function to get month name (if needed for charts)
const getMonthName = (monthIndex: number) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

export default function ClusterDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const clusterId = params.clusterId as string;
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [cluster, setCluster] = useState<ICluster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canViewDashboard, setCanViewDashboard] = useState(false);

  // Stats and Chart Data (scoped to clusterId)
  const [memberCountInCluster, setMemberCountInCluster] = useState(0);
  const [smallGroupCountInCluster, setSmallGroupCountInCluster] = useState(0);
  // Add more specific stats as needed

  // Example Chart Data (placeholders, to be replaced with actual fetching logic)
  const [memberGrowthData, setMemberGrowthData] = useState<any>({ labels: [], datasets: [] });
  const [smallGroupActivityData, setSmallGroupActivityData] = useState<any>({ labels: [], datasets: [] });


  const fetchClusterDetails = useCallback(async () => {
    if (!clusterId) return;
    try {
      const response = await apiClient.get<{ cluster: ICluster }>(`/clusters/${clusterId}`);
      setCluster(response.cluster);
    } catch (err: any) {
      setError(err.message || "Failed to load cluster details.");
      toast({ title: "Error", description: "Failed to load cluster details.", variant: "destructive" });
    }
  }, [clusterId, toast]);

  useEffect(() => {
    const checkPermissionsAndFetchInitialData = async () => {
      if (user && clusterId) {
        // A CLUSTER_LEADER needs their centerId to be passed for scoped check if cluster itself doesn't contain it directly for this check
        // For simplicity, we assume checkPermission can derive it or GLOBAL_ADMIN bypasses.
        // If your checkPermission for CLUSTER_LEADER needs centerId, you might need to fetch cluster first, then check.
        // Or, the assignedRole for CLUSTER_LEADER should include parentCenterId.

        // Simplified permission check for this example:
        // In a real scenario, CLUSTER_LEADER check would also need centerId if cluster object doesn't have it directly for permission check
        // For now, assuming Global Admin or direct Cluster Leader role for this clusterId is sufficient.
        // The `checkPermission` for CLUSTER_LEADER should ideally handle finding the cluster's center.
        const hasPermission =
          await checkPermission(user, "GLOBAL_ADMIN") ||
          await checkPermission(user, "CLUSTER_LEADER", { clusterId }) ||
          (cluster?.centerId && await checkPermission(user, "CENTER_ADMIN", { centerId: (cluster.centerId as any)?._id || cluster.centerId.toString() }));

        setCanViewDashboard(hasPermission);

        if (hasPermission) {
          setIsLoading(true);
          await fetchClusterDetails(); // Fetch cluster name first
          // Fetch other scoped data after cluster details are available (especially if centerId is needed from cluster)
          // For example:
          // await fetchClusterStats();
          // await fetchScopedChartData();
          setIsLoading(false); // Move this after all initial fetches for this dashboard
        } else {
          setError("You do not have permission to view this cluster's dashboard.");
          setIsLoading(false);
        }
      }
    };
    checkPermissionsAndFetchInitialData();
  }, [user, clusterId, fetchClusterDetails, cluster?.centerId]); // Added cluster?.centerId

  // Placeholder for fetching actual stats - replace with API calls
  useEffect(() => {
    if (canViewDashboard && clusterId) {
      // Fetch total members in this cluster
      apiClient.get<{ members: IMember[], pagination: any }>(`/members?clusterId=${clusterId}&limit=1`)
        .then(res => setMemberCountInCluster(res.pagination.total || 0))
        .catch(() => toast({ title: "Error", description: "Failed to load member count.", variant: "destructive" }));

      // Fetch total small groups in this cluster
      apiClient.get<{ smallGroups: ISmallGroup[], paginationInfo: any }>(`/small-groups?clusterId=${clusterId}&limit=1`)
        .then(res => setSmallGroupCountInCluster(res.paginationInfo.total || 0))
        .catch(() => toast({ title: "Error", description: "Failed to load small group count.", variant: "destructive" }));

      // Mock chart data for now
      setMemberGrowthData({
        labels: ['Jan', 'Feb', 'Mar'], datasets: [{ label: 'New Members in Cluster', data: [2, 3, 5], backgroundColor: 'rgba(75, 192, 192, 0.5)' }]
      });
      setSmallGroupActivityData({
        labels: ['Active', 'Inactive'], datasets: [{ label: 'Small Group Status', data: [smallGroupCountInCluster - 1, 1], backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'] }]
      });

    }
  }, [canViewDashboard, clusterId, toast, smallGroupCountInCluster]);


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
        <p className="text-muted-foreground">You do not have permission to view this cluster's dashboard.</p>
         <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Global Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cluster Dashboard: {cluster?.name || clusterId}</h1>
        {/* Add relevant action button, e.g., Link to manage cluster details or add small group */}
        <Button variant="outline" asChild>
            <Link href={`/dashboard/clusters/${clusterId}`}>View Cluster Details</Link>
        </Button>
      </div>

      {/* Use DashboardStats with clusterId prop if adapted, or custom StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <DataCard title="Total Members" value={memberCountInCluster.toString()} icon={<Users />} description="Members in this cluster" />
        <DataCard title="Small Groups" value={smallGroupCountInCluster.toString()} icon={<HomeIcon />} description="Small groups in this cluster" />
        {/* Add more relevant stats for a cluster */}
        <DataCard title="Avg. Attendance" value="N/A" icon={<Calendar />} description="Cluster meeting attendance" />
        <DataCard title="Pending Follow-ups" value="N/A" icon={<UserCheck />} description="Follow-ups in this cluster" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ActivityFeed and UpcomingEventsCard would need to be adapted to accept clusterId and fetch scoped data */}
        <div className="lg:col-span-1"><ActivityFeed className="h-full" clusterId={clusterId} /></div>
        <div className="lg:col-span-2"><UpcomingEventsCard className="h-full" clusterId={clusterId} /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Member Growth (Cluster)" type="bar" data={memberGrowthData} />
        <ChartCard title="Small Group Activity (Cluster)" type="doughnut" data={smallGroupActivityData} />
      </div>

      {/* Further DataCards or lists relevant to cluster */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard
          title="Small Groups List"
          icon={<HomeIcon className="h-4 w-4" />}
          action={{ label: "View All Small Groups", href: `/dashboard/clusters/${clusterId}/dashboard/small-groups` }}
        >
          {/* Placeholder for a list of small groups */}
          <p className="text-sm text-muted-foreground">List of small groups in this cluster...</p>
        </DataCard>
        <DataCard
          title="Cluster Events"
          icon={<Calendar className="h-4 w-4" />}
          action={{ label: "View All Events", href: `/dashboard/clusters/${clusterId}/dashboard/events` }}
        >
          <p className="text-sm text-muted-foreground">Upcoming events specific to this cluster...</p>
        </DataCard>
      </div>
    </div>
  );
}

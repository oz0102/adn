"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from '@/components/ui/chart-card';
import { DataCard } from '@/components/ui/data-card';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Layers, // Cluster icon
  Network, // Small Group icon
  MapPin, 
  ArrowLeft,
  ChevronRight,
  Home // For breadcrumb to Center
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

// Frontend Cluster interface
interface Cluster {
  _id: string;
  clusterId: string;
  name: string;
  location?: string;
  leaderId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  centerId?: {
    _id: string;
    name: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  meetingSchedule?: {
    day: string;
    time: string;
    frequency: string;
  };
  memberCount?: number;
  smallGroupCount?: number;
}

// Frontend SmallGroup interface
interface SmallGroup {
  _id: string;
  groupId: string;
  name: string;
  leaderId?: {
    firstName: string;
    lastName: string;
  };
  memberCount?: number;
}

// Frontend Event interface
interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
}

export default function ClusterDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const clusterId = params.id as string;
  const centerNameFromQuery = searchParams.get("centerName");

  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  // Sample chart data for member growth within the cluster
  const memberGrowthData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Members in Cluster",
        data: [5, 7, 6, 8, 9, 7],
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 1,
      },
    ],
  };

  // Sample chart data for small group performance
  const smallGroupPerformanceData = {
    labels: ["SG Alpha", "SG Beta", "SG Gamma", "SG Delta"],
    datasets: [
      {
        label: "Attendance Rate (%)",
        data: [85, 92, 78, 88],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Sample data for spiritual growth within the cluster
  const spiritualGrowthData = {
    labels: ["New Convert", "Water Baptism", "Holy Ghost Baptism", "Worker"],
    datasets: [
      {
        label: "Members",
        data: [40, 30, 25, 15],
        backgroundColor: "rgba(147, 51, 234, 0.5)",
        borderColor: "rgb(147, 51, 234)",
        borderWidth: 1,
      },
    ],
  };

  // Check permission via API instead of direct model access
  const checkPermission = useCallback(async () => {
    if (!user || !clusterId) return;
    
    try {
      const response = await fetch(`/api/auth/check-permission?clusterId=${clusterId}`);
      if (!response.ok) {
        setHasPermission(false);
        return;
      }
      
      const data = await response.json();
      setHasPermission(data.hasPermission);
    } catch (error) {
      console.error("Error checking permission:", error);
      setHasPermission(false);
    }
  }, [clusterId, user]);

  const fetchClusterData = useCallback(async () => {
    if (!user || !clusterId) return;
    try {
      setIsLoading(true);

      // Fetch cluster details
      const clusterResponse = await fetch(`/api/clusters/${clusterId}`);
      if (!clusterResponse.ok) {
        if (clusterResponse.status === 403) throw new Error("Permission denied to view this cluster.");
        if (clusterResponse.status === 404) throw new Error("Cluster not found.");
        throw new Error(`Failed to fetch cluster details. Status: ${clusterResponse.status}`);
      }
      const clusterData = await clusterResponse.json();
      setCluster(clusterData.cluster);

      // Fetch small groups for this cluster
      const sgResponse = await fetch(`/api/small-groups?clusterId=${clusterId}&limit=5`);
      if (sgResponse.ok) {
        const sgData = await sgResponse.json();
        setSmallGroups(sgData.smallGroups || []);
      }

      // Fetch upcoming events for this cluster (Assuming API supports clusterId filter)
      const eventsResponse = await fetch(`/api/events?clusterId=${clusterId}&limit=3&upcoming=true`);
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.events || []);
      }

    } catch (error: any) {
      console.error("Error fetching cluster data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load cluster data. Please try again.",
        variant: "destructive",
      });
      setCluster(null);
    } finally {
      setIsLoading(false);
    }
  }, [clusterId, toast, user]);

  useEffect(() => {
    if (user) {
      checkPermission();
      fetchClusterData();
    }
  }, [user, checkPermission, fetchClusterData]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading cluster dashboard...</p></div>;
  }

  if (!cluster) {
    return (
      <div className="text-center py-10">
        <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Cluster Not Found</h3>
        <p className="text-gray-500 mb-4">
          The cluster you are looking for does not exist or you may not have permission to view it.
        </p>
        <Button onClick={() => router.push("/dashboard/clusters")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clusters
        </Button>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="text-center py-10">
        <Layers className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Permission Denied</h3>
        <p className="text-gray-500 mb-4">You do not have permission to view this cluster's dashboard.</p>
        <Button onClick={() => router.push("/dashboard/clusters")}>Back to Clusters</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" size="sm" onClick={() => router.push(cluster.centerId?._id ? `/dashboard/centers/${cluster.centerId._id}` : `/dashboard/clusters?centerId=${cluster.centerId?._id || ""}&centerName=${encodeURIComponent(cluster.centerId?.name || centerNameFromQuery || "")}`)}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Badge variant="secondary">{cluster.clusterId}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-8 w-8 text-green-600" />
            {cluster.name} Dashboard
          </h1>
          {cluster.centerId && (
            <Link href={`/dashboard/centers/${cluster.centerId._id}`} className="flex items-center gap-1 text-sm text-blue-500 hover:underline mt-1">
              <Home className="h-4 w-4" />
              <span>{cluster.centerId.name}</span>
            </Link>
          )}
          {cluster.location && (
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{cluster.location}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/clusters/${cluster._id}?centerName=${encodeURIComponent(cluster.centerId?.name || centerNameFromQuery || "")}`}>
              Cluster Details
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/clusters/${cluster._id}/edit`}>
              Manage Cluster
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <h3 className="text-2xl font-bold mt-1">{cluster.memberCount || 0}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Small Groups</p>
                <h3 className="text-2xl font-bold mt-1">{cluster.smallGroupCount || smallGroups.length}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Network className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming Events</p>
                <h3 className="text-2xl font-bold mt-1">{events.length}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Follow-ups</p>
                <h3 className="text-2xl font-bold mt-1">8</h3> 
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <UserCheck className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed - Takes 1/3 of the width on large screens */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest activities in {cluster.name}</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full mt-0.5">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">New member added to SG Alpha</p>
                    <p className="text-sm text-muted-foreground">Jane Doe was added by Leader Mark</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full mt-0.5">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Small Group meeting scheduled</p>
                    <p className="text-sm text-muted-foreground">SG Beta meeting on June 10th</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full mt-0.5">
                    <Network className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">New small group created</p>
                    <p className="text-sm text-muted-foreground">SG Delta was created by Cluster Leader</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" size="sm">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Upcoming Events - Takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Events relevant to {cluster.name}</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/events?clusterId=${cluster._id}`}>
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map(event => (
                    <div key={event._id} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="bg-blue-100 p-3 rounded-md text-center min-w-[60px]">
                        <p className="text-sm font-bold text-blue-600">
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="text-xl font-bold text-blue-800">
                          {new Date(event.date).getDate()}
                        </p>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                        {event.description && (
                          <p className="text-sm mt-1 line-clamp-2">{event.description}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/events/${event._id}`}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Upcoming Events</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    There are no upcoming events scheduled for this cluster.
                  </p>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/events/new?clusterId=${cluster._id}`}>
                      Schedule Event
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Small Groups Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Small Groups</CardTitle>
            <CardDescription>Small Groups in {cluster.name}</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/small-groups?clusterId=${cluster._id}`}>
              View All Small Groups
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {smallGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {smallGroups.map(sg => (
                <Card key={sg._id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit mb-1">{sg.groupId}</Badge>
                    <CardTitle className="text-lg">{sg.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {sg.leaderId && (
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {getInitials(sg.leaderId.firstName, sg.leaderId.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Leader: {sg.leaderId.firstName} {sg.leaderId.lastName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{sg.memberCount || 0} members</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/dashboard/small-groups/${sg._id}`}>
                        <span>View Small Group</span>
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Network className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-1">No Small Groups Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                There are no small groups in this cluster yet.
              </p>
              <Button size="sm" asChild>
                <Link href={`/dashboard/small-groups/new?clusterId=${cluster._id}`}>
                  Create Small Group
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard 
          title="Member Growth (Cluster)" 
          type="bar" 
          data={memberGrowthData} 
        />
        <ChartCard 
          title="Small Group Performance" 
          type="doughnut" 
          data={smallGroupPerformanceData} 
        />
        <ChartCard 
          title="Spiritual Growth Stages (Cluster)" 
          type="bar" 
          data={spiritualGrowthData} 
        />
        {/* Add another relevant chart if needed */}
      </div>
      
      {/* Additional Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard 
          title="Birthdays This Month (Cluster)" 
          icon={<Calendar className="h-4 w-4" />}
          action={{
            label: "View All",
            onClick: () => console.log("View all cluster birthdays")
          }}
        >
          {/* Placeholder content */}
          <p className="text-sm text-muted-foreground">No birthdays this month.</p>
        </DataCard>
        
        <DataCard 
          title="Pending Follow-ups (Cluster)" 
          icon={<UserCheck className="h-4 w-4" />}
          action={{
            label: "View All",
            onClick: () => console.log("View all cluster follow-ups")
          }}
        >
          {/* Placeholder content */}
          <p className="text-sm text-muted-foreground">No pending follow-ups.</p>
        </DataCard>
      </div>
    </div>
  );
}

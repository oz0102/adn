"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/lib/client/components/ui/card";
import { Button } from "@/lib/client/components/ui/button";
import { Badge } from "@/lib/client/components/ui/badge";
import { ChartCard } from '@/lib/client/components/ui/chart-card';
import { DataCard } from '@/lib/client/components/ui/data-card';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Layers, 
  Network, 
  MapPin, 
  ArrowLeft,
  ChevronRight,
  Home 
} from 'lucide-react';
import { useToast } from "@/lib/client/hooks/use-toast";
import { useAuthStore } from "@/lib/store";
import { useSession } from "next-auth/react";

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
  const router = useRouter();
  const params = useParams();
  const clusterId = params.clusterId as string;
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { status } = useSession();

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
      const response = await fetch(`/api/auth/check-permission?role=CLUSTER_ADMIN&clusterId=${clusterId}`);
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
  }, [user, clusterId]);

  const fetchClusterData = useCallback(async () => {
    if (!user || !clusterId) return;
    try {
      setIsLoading(true);

      // Fetch cluster data
      const clusterResponse = await fetch(`/api/clusters/${clusterId}`);
      if (!clusterResponse.ok) {
        throw new Error('Failed to fetch cluster data');
      }
      
      const clusterData = await clusterResponse.json();
      setCluster(clusterData.cluster);

      // Fetch small groups for this cluster
      const smallGroupsResponse = await fetch(`/api/small-groups?clusterId=${clusterId}`);
      if (!smallGroupsResponse.ok) {
        throw new Error('Failed to fetch small groups');
      }
      
      const smallGroupsData = await smallGroupsResponse.json();
      setSmallGroups(smallGroupsData.smallGroups || []);

      // Fetch events for this cluster
      const eventsResponse = await fetch(`/api/events?clusterId=${clusterId}`);
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const eventsData = await eventsResponse.json();
      setEvents(eventsData.events || []);

    } catch (error: Error) {
      console.error("Error fetching cluster data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load cluster data. Please try again.",
        variant: "destructive",
      });
      
      // Use sample data for demonstration if API fails
      setCluster({
        _id: clusterId,
        clusterId: "CL001",
        name: "North Cluster",
        location: "North District",
        leaderId: {
          _id: "sample-leader-id",
          firstName: "Jane",
          lastName: "Smith"
        },
        centerId: {
          _id: "sample-center-id",
          name: "Main Center"
        },
        contactEmail: "north@example.com",
        contactPhone: "+1234567890",
        description: "North district cluster",
        meetingSchedule: {
          day: "Saturday",
          time: "10:00 AM",
          frequency: "Weekly"
        },
        memberCount: 45,
        smallGroupCount: 4
      });
      
      setSmallGroups([
        {
          _id: "sg-1",
          groupId: "SG001",
          name: "Alpha Group",
          leaderId: {
            firstName: "Michael",
            lastName: "Brown"
          },
          memberCount: 12
        },
        {
          _id: "sg-2",
          groupId: "SG002",
          name: "Beta Group",
          leaderId: {
            firstName: "Sarah",
            lastName: "Johnson"
          },
          memberCount: 10
        },
        {
          _id: "sg-3",
          groupId: "SG003",
          name: "Gamma Group",
          leaderId: {
            firstName: "David",
            lastName: "Wilson"
          },
          memberCount: 15
        },
        {
          _id: "sg-4",
          groupId: "SG004",
          name: "Delta Group",
          leaderId: {
            firstName: "Emily",
            lastName: "Davis"
          },
          memberCount: 8
        }
      ]);
      
      setEvents([
        {
          _id: "event-1",
          title: "Cluster Meeting",
          date: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          location: "North Community Hall",
          description: "Monthly cluster leadership meeting"
        },
        {
          _id: "event-2",
          title: "Outreach Program",
          date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: "North Park",
          description: "Community outreach and evangelism"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, user, clusterId]);

  useEffect(() => {
    // Only proceed if authentication is complete
    if (status === "loading") return;
    
    if (isAuthenticated && user) {
      checkPermission();
      fetchClusterData();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, isAuthenticated, user, checkPermission, fetchClusterData, router]);

  if (status === "loading" || isLoading) {
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
        <Button onClick={() => router.push("/clusters")}>
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
        <p className="text-gray-500 mb-4">You do not have permission to view this cluster&apos;s dashboard.</p>
        <Button onClick={() => router.push("/clusters")}>Back to Clusters</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{cluster.clusterId}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-8 w-8 text-green-600" />
            {cluster.name} Dashboard
          </h1>
          {cluster.centerId && (
            <Link href={`/centers/${cluster.centerId._id}`} className="flex items-center gap-1 text-sm text-blue-500 hover:underline mt-1">
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
            <Link href={`/clusters/${cluster._id}`}>
              Cluster Details
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/clusters/${cluster._id}/edit`}>
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
                <Link href={`/clusters/${cluster._id}/events`}>
                  View All
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event._id} className="flex items-start gap-4 p-3 rounded-lg border">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()} at {event.location}</p>
                        {event.description && (
                          <p className="text-sm mt-1">{event.description}</p>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/events/${event._id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No upcoming events scheduled</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Small Groups List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Small Groups in {cluster.name}</CardTitle>
            <CardDescription>Total: {smallGroups.length} small groups</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/groups/new?clusterId=${cluster._id}`}>
              Add Small Group
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {smallGroups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {smallGroups.map((group) => (
                <Card key={group._id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <Users className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{group.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">{group.groupId}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {group.leaderId && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                        <span className="i-lucide-user-circle h-4 w-4"></span>
                        Leader: {group.leaderId.firstName} {group.leaderId.lastName}
                      </p>
                    )}
                    {group.memberCount !== undefined && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="i-lucide-users h-4 w-4"></span>
                        {group.memberCount} Members
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/groups/${group._id}`}>
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/groups/${group._id}/dashboard`}>
                        Dashboard
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Small Groups Found</h3>
              <p className="text-gray-500 mb-4">This cluster doesn&apos;t have any small groups yet.</p>
              <Button asChild>
                <Link href={`/groups/new?clusterId=${cluster._id}`}>
                  Create First Small Group
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard 
          title="Member Growth" 
          description="New members per month"
          type="bar"
          data={memberGrowthData}
        />
        
        <ChartCard 
          title="Small Group Performance" 
          description="Attendance rate by small group"
          type="bar"
          data={smallGroupPerformanceData}
        />
        
        <ChartCard 
          title="Spiritual Growth" 
          description="Member spiritual journey stages"
          type="bar"
          data={spiritualGrowthData}
        />
      </div>
      
      {/* Additional Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard
          title="Cluster Information"
          description="Key details about this cluster"
          items={[
            { 
              title: "Meeting Schedule", 
              description: cluster.meetingSchedule ? 
                `${cluster.meetingSchedule.day}s at ${cluster.meetingSchedule.time} (${cluster.meetingSchedule.frequency})` : 
                "Not specified", 
              icon: "calendar" 
            },
            { 
              title: "Contact Email", 
              description: cluster.contactEmail || "Not specified", 
              icon: "mail" 
            },
            { 
              title: "Contact Phone", 
              description: cluster.contactPhone || "Not specified", 
              icon: "phone" 
            },
            { 
              title: "Location", 
              description: cluster.location || "Not specified", 
              icon: "map-pin" 
            },
          ]}
        />
        
        <DataCard
          title="Recent Follow-ups"
          description="Latest follow-up activities"
          items={[
            { title: "New Convert Follow-up", description: "James Wilson - 3 days ago", icon: "user-check" },
            { title: "First-time Visitor", description: "Sarah Johnson - 1 week ago", icon: "user-check" },
            { title: "Absentee Follow-up", description: "Michael Brown - 2 weeks ago", icon: "user-check" },
            { title: "Prayer Request", description: "Emily Davis - 2 weeks ago", icon: "user-check" },
          ]}
        />
      </div>
    </div>
  );
}

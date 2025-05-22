"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from "next/navigation";
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
  Building, 
  Network, 
  MapPin, 
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useSession } from "next-auth/react";

// Frontend Center interface
interface Center {
  _id: string;
  centerId: string;
  name: string;
  location?: string;
  leadPastor?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  clusterCount?: number;
  memberCount?: number;
}

// Frontend Cluster interface
interface Cluster {
  _id: string;
  clusterId: string;
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

export default function CenterDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { status } = useSession();

  const [center, setCenter] = useState<Center | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

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

  // Sample chart data for cluster performance
  const clusterPerformanceData = {
    labels: ['Cluster A', 'Cluster B', 'Cluster C', 'Cluster D', 'Cluster E'],
    datasets: [
      {
        label: 'Member Growth',
        data: [15, 25, 30, 20, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
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

  // Check permission via API instead of direct model access
  const checkPermission = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/auth/check-permission?role=HQ_ADMIN`);
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
  }, [user]);

  const fetchCenterData = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      
      // Fetch a sample center for demonstration
      const centerData = {
        center: {
          _id: "sample-center-id",
          centerId: "CTR001",
          name: "Main Center",
          location: "Downtown",
          leadPastor: {
            _id: "sample-pastor-id",
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com"
          },
          contactEmail: "info@maincenter.org",
          contactPhone: "+1234567890",
          description: "Our main worship center",
          clusterCount: 5,
          memberCount: 250
        }
      };
      
      setCenter(centerData.center);

      // Sample clusters data
      const clustersData = {
        clusters: [
          {
            _id: "cluster-1",
            clusterId: "CL001",
            name: "North Cluster",
            leaderId: {
              firstName: "Jane",
              lastName: "Smith"
            },
            memberCount: 45
          },
          {
            _id: "cluster-2",
            clusterId: "CL002",
            name: "South Cluster",
            leaderId: {
              firstName: "Mike",
              lastName: "Johnson"
            },
            memberCount: 38
          },
          {
            _id: "cluster-3",
            clusterId: "CL003",
            name: "East Cluster",
            leaderId: {
              firstName: "Sarah",
              lastName: "Williams"
            },
            memberCount: 42
          }
        ]
      };
      
      setClusters(clustersData.clusters);

      // Sample events data
      const eventsData = {
        events: [
          {
            _id: "event-1",
            title: "Sunday Service",
            date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Main Auditorium",
            description: "Weekly worship service"
          },
          {
            _id: "event-2",
            title: "Youth Conference",
            date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Youth Hall",
            description: "Annual youth gathering"
          }
        ]
      };
      
      setEvents(eventsData.events);

    } catch (error: any) {
      console.error("Error fetching center data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load center data. Please try again.",
        variant: "destructive",
      });
      setCenter(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    // Only proceed if authentication is complete
    if (status === "loading") return;
    
    if (isAuthenticated && user) {
      checkPermission();
      fetchCenterData();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, isAuthenticated, user, checkPermission, fetchCenterData, router]);

  if (status === "loading" || isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading center dashboard...</p></div>;
  }

  if (!center) {
    return (
      <div className="text-center py-10">
        <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Center Not Found</h3>
        <p className="text-gray-500 mb-4">
          The center you are looking for does not exist or you may not have permission to view it.
        </p>
        <Button onClick={() => router.push("/dashboard/centers")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Centers
        </Button>
      </div>
    );
  }
  
  if (!hasPermission) {
    return (
      <div className="text-center py-10">
        <Building className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Permission Denied</h3>
        <p className="text-gray-500 mb-4">You do not have permission to view this center's dashboard.</p>
        <Button onClick={() => router.push("/dashboard/centers")}>Back to Centers</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/centers")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Badge variant="secondary">{center.centerId}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-8 w-8 text-blue-600" />
            {center.name} Dashboard
          </h1>
          {center.location && (
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{center.location}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/centers/${center._id}`}>
              Center Details
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/centers/${center._id}/edit`}>
              Manage Center
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
                <h3 className="text-2xl font-bold mt-1">{center.memberCount || 0}</h3>
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
                <p className="text-sm font-medium text-muted-foreground">Clusters</p>
                <h3 className="text-2xl font-bold mt-1">{center.clusterCount || clusters.length}</h3>
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
                <h3 className="text-2xl font-bold mt-1">12</h3>
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
              <CardDescription>Latest activities in {center.name}</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full mt-0.5">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">New member added to Cluster A</p>
                    <p className="text-sm text-muted-foreground">John Doe was added by Pastor James</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full mt-0.5">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">New event scheduled</p>
                    <p className="text-sm text-muted-foreground">Youth Conference on June 15th</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full mt-0.5">
                    <Network className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">New cluster created</p>
                    <p className="text-sm text-muted-foreground">Cluster E was created by Admin</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                    <UserCheck className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Follow-up completed</p>
                    <p className="text-sm text-muted-foreground">Sarah Williams follow-up by Pastor James</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
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
                <CardDescription>Events scheduled at {center.name}</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/events?centerId=${center._id}`}>
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
                    There are no upcoming events scheduled for this center.
                  </p>
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/events/new?centerId=${center._id}`}>
                      Schedule Event
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Clusters Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Clusters</CardTitle>
            <CardDescription>Clusters in {center.name}</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/clusters?centerId=${center._id}`}>
              View All Clusters
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {clusters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clusters.map(cluster => (
                <Card key={cluster._id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Badge variant="outline" className="w-fit mb-1">{cluster.clusterId}</Badge>
                    <CardTitle className="text-lg">{cluster.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {cluster.leaderId && (
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {getInitials(cluster.leaderId.firstName, cluster.leaderId.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">Leader: {cluster.leaderId.firstName} {cluster.leaderId.lastName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{cluster.memberCount || 0} members</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-3">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/dashboard/clusters/${cluster._id}`}>
                        <span>View Cluster</span>
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
              <h3 className="text-lg font-medium mb-1">No Clusters Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                There are no clusters in this center yet.
              </p>
              <Button size="sm" asChild>
                <Link href={`/dashboard/clusters/new?centerId=${center._id}`}>
                  Create Cluster
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
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
          title="Cluster Performance" 
          type="doughnut" 
          data={clusterPerformanceData} 
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
          </div>
        </DataCard>
      </div>
    </div>
  );
}

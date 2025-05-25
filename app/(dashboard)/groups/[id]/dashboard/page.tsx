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
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Network, 
  MapPin, 
  ArrowLeft,
  ChevronRight,
  Home 
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useSession } from "next-auth/react";

// Frontend Group interface
interface Group {
  _id: string;
  groupId: string;
  name: string;
  location?: string;
  leaderId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  clusterId?: {
    _id: string;
    name: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  meetingSchedules?: Array<{
    day: string;
    time: string;
    frequency: string;
  }>;
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

export default function GroupDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { status } = useSession();

  const [group, setGroup] = useState<Group | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  // Check permission via API instead of direct model access
  const checkPermission = useCallback(async () => {
    if (!user || !groupId) return;
    
    try {
      const response = await fetch(`/api/auth/check-permission?role=GROUP_ADMIN&groupId=${groupId}`);
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
  }, [user, groupId]);

  const fetchGroupData = useCallback(async () => {
    if (!user || !groupId) return;
    try {
      setIsLoading(true);

      // Fetch group data
      const groupResponse = await fetch(`/api/groups/${groupId}`);
      if (!groupResponse.ok) {
        throw new Error('Failed to fetch group data');
      }
      
      const groupData = await groupResponse.json();
      setGroup(groupData.group);

      // Fetch events for this group
      const eventsResponse = await fetch(`/api/events?groupId=${groupId}`);
      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const eventsData = await eventsResponse.json();
      setEvents(eventsData.events || []);

    } catch (error: any) {
      console.error("Error fetching group data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load group data. Please try again.",
        variant: "destructive",
      });
      
      // Use sample data for demonstration if API fails
      setGroup({
        _id: groupId,
        groupId: "SG001",
        name: "Sample Small Group",
        location: "Local Community Center",
        leaderId: {
          _id: "sample-leader-id",
          firstName: "Michael",
          lastName: "Brown"
        },
        clusterId: {
          _id: "sample-cluster-id",
          name: "North Cluster"
        },
        contactEmail: "group@example.com",
        contactPhone: "+1234567890",
        description: "Sample small group description",
        meetingSchedules: [
          {
            day: "Wednesday",
            time: "7:00 PM",
            frequency: "Weekly"
          }
        ],
        memberCount: 12
      });
      
      setEvents([
        {
          _id: "event-1",
          title: "Bible Study",
          date: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Community Center Room 3",
          description: "Weekly Bible study session"
        },
        {
          _id: "event-2",
          title: "Prayer Meeting",
          date: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Michael's Home",
          description: "Monthly prayer gathering"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, user, groupId]);

  useEffect(() => {
    // Only proceed if authentication is complete
    if (status === "loading") return;
    
    if (isAuthenticated && user) {
      checkPermission();
      fetchGroupData();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, isAuthenticated, user, checkPermission, fetchGroupData, router]);

  if (status === "loading" || isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading small group dashboard...</p></div>;
  }

  if (!group) {
    return (
      <div className="text-center py-10">
        <Network className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Small Group Not Found</h3>
        <p className="text-gray-500 mb-4">
          The small group you are looking for does not exist or you may not have permission to view it.
        </p>
        <Button onClick={() => router.push("/groups")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Small Groups
        </Button>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="text-center py-10">
        <Network className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Permission Denied</h3>
        <p className="text-gray-500 mb-4">You do not have permission to view this small group's dashboard.</p>
        <Button onClick={() => router.push("/groups")}>Back to Small Groups</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/groups")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Badge variant="secondary">{group.groupId}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Network className="h-8 w-8 text-purple-600" />
            {group.name} Dashboard
          </h1>
          {group.clusterId && (
            <Link href={`/clusters/${group.clusterId._id}`} className="flex items-center gap-1 text-sm text-blue-500 hover:underline mt-1">
              <Home className="h-4 w-4" />
              <span>{group.clusterId.name}</span>
            </Link>
          )}
          {group.location && (
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span>{group.location}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/groups/${group._id}`}>
              Group Details
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/groups/${group._id}/edit`}>
              Manage Group
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <h3 className="text-2xl font-bold mt-1">{group.memberCount || 0}</h3>
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
                <h3 className="text-2xl font-bold mt-1">5</h3> 
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
              <CardDescription>Latest activities in {group.name}</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full mt-0.5">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">New member added</p>
                    <p className="text-sm text-muted-foreground">James Wilson was added by Group Leader</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full mt-0.5">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Bible Study scheduled</p>
                    <p className="text-sm text-muted-foreground">Weekly Bible study on Wednesday</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                    <UserCheck className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Follow-up completed</p>
                    <p className="text-sm text-muted-foreground">Sarah Johnson follow-up by Group Leader</p>
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
                <CardDescription>Events for {group.name}</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/groups/${group._id}/events`}>
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
      
      {/* Members List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>Members in {group.name}</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/groups/${group._id}/members`}>
              View All Members
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sample members for demonstration */}
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(`Member ${index}`, `Last ${index}`)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">Member {index}</CardTitle>
                      <p className="text-sm text-muted-foreground">Joined {index} month{index !== 1 ? 's' : ''} ago</p>
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="pt-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/members/member-${index}`}>
                      View Profile
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Additional Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Meeting Schedule</CardTitle>
            <CardDescription>Regular meeting times for {group.name}</CardDescription>
          </CardHeader>
          <CardContent>
            {group.meetingSchedules && group.meetingSchedules.length > 0 ? (
              <div className="space-y-4">
                {group.meetingSchedules.map((schedule, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{schedule.day}s at {schedule.time}</p>
                      <p className="text-sm text-muted-foreground">{schedule.frequency}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No regular meeting schedule set</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Follow-ups</CardTitle>
            <CardDescription>Latest follow-up activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                  <UserCheck className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">New Convert Follow-up</p>
                  <p className="text-sm text-muted-foreground">James Wilson - 3 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                  <UserCheck className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">First-time Visitor</p>
                  <p className="text-sm text-muted-foreground">Sarah Johnson - 1 week ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                  <UserCheck className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Absentee Follow-up</p>
                  <p className="text-sm text-muted-foreground">Michael Brown - 2 weeks ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

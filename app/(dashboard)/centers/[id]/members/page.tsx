"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Building, 
  ArrowLeft
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { useSession } from "next-auth/react";

// Frontend Member interface
interface Member {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  centerId?: string;
  clusterId?: string;
  groupId?: string;
  joinDate?: string;
  status?: string;
  profileImage?: string;
}

export default function CenterMembersPage() {
  const router = useRouter();
  const params = useParams();
  const centerId = params.id as string;
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { status } = useSession();

  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);
  const [centerName, setCenterName] = useState("Center");

  // Check permission via API instead of direct model access
  const checkPermission = useCallback(async () => {
    if (!user || !centerId) return;
    
    try {
      const response = await fetch(`/api/auth/check-permission?role=CENTER_ADMIN&centerId=${centerId}`);
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
  }, [user, centerId]);

  const fetchCenterData = useCallback(async () => {
    if (!user || !centerId) return;
    try {
      setIsLoading(true);
      
      // Fetch center name
      const centerResponse = await fetch(`/api/centers/${centerId}`);
      if (centerResponse.ok) {
        const centerData = await centerResponse.json();
        setCenterName(centerData.center?.name || "Center");
      }

      // Fetch members for this center
      const membersResponse = await fetch(`/api/members?centerId=${centerId}`);
      if (!membersResponse.ok) {
        throw new Error('Failed to fetch members');
      }
      
      const membersData = await membersResponse.json();
      setMembers(membersData.members || []);

    } catch (error: Error) {
      console.error("Error fetching center members:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load center members. Please try again.",
        variant: "destructive",
      });
      
      // Use sample data for demonstration if API fails
      setMembers([
        {
          _id: "member-1",
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "+1234567890",
          centerId: centerId,
          joinDate: "2023-01-15",
          status: "active"
        },
        {
          _id: "member-2",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phone: "+1987654321",
          centerId: centerId,
          clusterId: "cluster-1",
          joinDate: "2023-02-20",
          status: "active"
        },
        {
          _id: "member-3",
          firstName: "Michael",
          lastName: "Johnson",
          email: "michael.johnson@example.com",
          phone: "+1122334455",
          centerId: centerId,
          clusterId: "cluster-2",
          groupId: "group-1",
          joinDate: "2023-03-10",
          status: "active"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, user, centerId]);

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
    return <div className="flex justify-center items-center h-screen"><p>Loading center members...</p></div>;
  }

  if (!hasPermission) {
    return (
      <div className="text-center py-10">
        <Building className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Permission Denied</h3>
        <p className="text-gray-500 mb-4">You do not have permission to view this center's members.</p>
        <Button onClick={() => router.push("/centers")}>Back to Centers</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/centers/${centerId}/dashboard`)}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            {centerName} Members
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all members in this center
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/centers/${centerId}/members/add`}>
              Add New Member
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>All Members</CardTitle>
          <CardDescription>Total: {members.length} members</CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-10">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Members Found</h3>
              <p className="text-gray-500 mb-4">This center doesn&apos;t have any members yet.</p>
              <Button asChild>
                <Link href={`/centers/${centerId}/members/add`}>
                  Add First Member
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Card key={member._id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {member.profileImage ? (
                          <Image src={member.profileImage} alt={`${member.firstName} ${member.lastName}`} width={40} height={40} className="rounded-full" />
                        ) : (
                          <AvatarFallback>{getInitials(member.firstName, member.lastName)}</AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{member.firstName} {member.lastName}</CardTitle>
                        {member.status && (
                          <Badge variant={member.status === "active" ? "success" : "secondary"} className="mt-1">
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    {member.email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                        <span className="i-lucide-mail h-4 w-4"></span>
                        {member.email}
                      </p>
                    )}
                    {member.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                        <span className="i-lucide-phone h-4 w-4"></span>
                        {member.phone}
                      </p>
                    )}
                    {member.joinDate && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="i-lucide-calendar h-4 w-4"></span>
                        Joined: {new Date(member.joinDate).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/members/${member._id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// app/(dashboard)/small-groups/[id]/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  UserCircle, 
  Edit, 
  ArrowLeft,
  Calendar,
  Users2, // Icon for members
  Plus
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"

interface SmallGroup {
  _id: string
  groupId: string 
  name: string
  clusterId?: { 
    _id: string
    name: string
    centerId?: { 
        _id: string
        name: string
    }
  }
  location?: string
  leaderId?: {
    _id: string
    firstName: string
    lastName: string
    email?: string
  }
  assistantLeaderId?: { 
    _id: string
    firstName: string
    lastName: string
  }
  contactEmail?: string
  contactPhone?: string
  description?: string
  meetingSchedule?: {
    day: string
    time: string
    frequency: string
  }
  memberCount?: number // This might be derived from actual members list
}

interface Member {
    _id: string;
    userId: {
        _id: string;
        firstName: string;
        lastName: string;
        email?: string;
    };
    roleInGroup?: string; // e.g. Member, Assistant Leader, Co-leader
    // Add other relevant member fields from your Member model
}

export default function SmallGroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryParams = useSearchParams();
  const { toast } = useToast()
  const { user } = useAuthStore()
  const smallGroupIdFromParams = params.id as string
  const clusterNameFromQuery = queryParams.get("clusterName");
  const centerNameFromQuery = queryParams.get("centerName");

  const [smallGroup, setSmallGroup] = useState<SmallGroup | null>(null)
  const [members, setMembers] = useState<Member[]>([]) 
  const [isLoading, setIsLoading] = useState(true)

  const canEditSmallGroup = user && smallGroup ? checkPermission(user, ["GLOBAL_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER"], smallGroup.clusterId?.centerId?._id, smallGroup.clusterId?._id, smallGroup._id) : false;
  const canAddMember = user && smallGroup ? checkPermission(user, ["GLOBAL_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER"], smallGroup.clusterId?.centerId?._id, smallGroup.clusterId?._id, smallGroup._id) : false;

  const fetchSmallGroupDetails = useCallback(async () => {
    if (!user || !smallGroupIdFromParams) return;
    try {
      setIsLoading(true)
      
      // Fetch small group details
      const sgResponse = await fetch(`/api/small-groups/${smallGroupIdFromParams}`)
      if (!sgResponse.ok) {
        if (sgResponse.status === 403) throw new Error("Permission denied to view this small group.")
        if (sgResponse.status === 404) throw new Error("Small group not found.")
        throw new Error(`Failed to fetch small group details. Status: ${sgResponse.status}`)
      }
      const sgData = await sgResponse.json()
      setSmallGroup(sgData.smallGroup)

      // Fetch members for this small group
      const membersResponse = await fetch(`/api/members?smallGroupId=${smallGroupIdFromParams}&limit=100`)
      if (!membersResponse.ok) {
        console.warn(`Failed to fetch members for small group ${smallGroupIdFromParams}. Status: ${membersResponse.status}`);
      } else {
        const membersData = await membersResponse.json()
        setMembers(membersData.members || [])
      }

    } catch (error: Error) {
      console.error("Error fetching small group details:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load small group details. Please try again.",
        variant: "destructive",
      })
      setSmallGroup(null)
    } finally {
      setIsLoading(false)
    }
  }, [smallGroupIdFromParams, toast, user])

  useEffect(() => {
    if(user) {
        fetchSmallGroupDetails()
    }
  }, [user, fetchSmallGroupDetails])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading small group details...</p></div>
  }

  if (!smallGroup) {
    return (
        <div className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Small Group Not Found</h3>
            <p className="text-gray-500 mb-4">
            The small group you are looking for does not exist or you may not have permission to view it.
            </p>
            <Button onClick={() => router.push(smallGroup?.clusterId?._id ? `/dashboard/clusters/${smallGroup.clusterId._id}?centerName=${encodeURIComponent(smallGroup.clusterId?.centerId?.name || centerNameFromQuery || "")}` : "/dashboard/small-groups")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
        </div>
    );
  }
  
  if (user && !checkPermission(user, ["GLOBAL_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER"], smallGroup.clusterId?.centerId?._id, smallGroup.clusterId?._id, smallGroup._id)) {
      return (
        <div className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Permission Denied</h3>
            <p className="text-gray-500 mb-4">You do not have permission to view this small group.</p>
            <Button onClick={() => router.push(smallGroup.clusterId?._id ? `/dashboard/clusters/${smallGroup.clusterId._id}?centerName=${encodeURIComponent(smallGroup.clusterId?.centerId?.name || centerNameFromQuery || "")}` : "/dashboard/small-groups")}>Back</Button>
        </div>
      );
  }

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push(smallGroup.clusterId?._id ? `/dashboard/clusters/${smallGroup.clusterId._id}?centerName=${encodeURIComponent(smallGroup.clusterId?.centerId?.name || centerNameFromQuery || "")}&clusterName=${encodeURIComponent(smallGroup.clusterId.name || clusterNameFromQuery || "")}` : "/dashboard/small-groups")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {smallGroup.clusterId?.name || clusterNameFromQuery || "Small Groups"}
        </Button>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
            <Users className="h-12 w-12 text-purple-600" />
            <div>
                <Badge variant="secondary" className="mb-1">{smallGroup.groupId}</Badge>
                <h1 className="text-3xl font-bold tracking-tight">{smallGroup.name}</h1>
                {smallGroup.clusterId && <Link href={`/dashboard/clusters/${smallGroup.clusterId._id}?centerName=${encodeURIComponent(smallGroup.clusterId?.centerId?.name || centerNameFromQuery || "")}`} className="text-sm text-blue-500 hover:underline">Part of {smallGroup.clusterId.name}</Link>}
            </div>
        </div>
        {canEditSmallGroup && (
          <Button asChild>
            <Link href={`/dashboard/small-groups/${smallGroup._id}/edit?clusterId=${smallGroup.clusterId?._id || ""}&clusterName=${encodeURIComponent(smallGroup.clusterId?.name || clusterNameFromQuery || "")}&centerId=${smallGroup.clusterId?.centerId?._id || ""}&centerName=${encodeURIComponent(smallGroup.clusterId?.centerId?.name || centerNameFromQuery || "")}`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Small Group
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Small Group Overview</CardTitle>
          {smallGroup.description && <CardDescription>{smallGroup.description}</CardDescription>}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-medium">Details & Schedule</h4>
            {smallGroup.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span>{smallGroup.location}</span>
              </div>
            )}
            {smallGroup.meetingSchedule && (
                 <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>{smallGroup.meetingSchedule.day} at {smallGroup.meetingSchedule.time} ({smallGroup.meetingSchedule.frequency})</span>
                </div>
            )}
            {smallGroup.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-500" />
                <a href={`mailto:${smallGroup.contactEmail}`} className="text-blue-600 hover:underline">{smallGroup.contactEmail}</a>
              </div>
            )}
            {smallGroup.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <span>{smallGroup.contactPhone}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Leadership & Stats</h4>
            {smallGroup.leaderId && (
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-gray-500" />
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(smallGroup.leaderId.firstName, smallGroup.leaderId.lastName)}</AvatarFallback>
                    </Avatar>
                    <span>{smallGroup.leaderId.firstName} {smallGroup.leaderId.lastName} (Leader)</span>
                </div>
              </div>
            )}
            {smallGroup.assistantLeaderId && (
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-gray-500 opacity-70" />
                 <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 opacity-70">
                        <AvatarFallback>{getInitials(smallGroup.assistantLeaderId.firstName, smallGroup.assistantLeaderId.lastName)}</AvatarFallback>
                    </Avatar>
                    <span className="opacity-70">{smallGroup.assistantLeaderId.firstName} {smallGroup.assistantLeaderId.lastName} (Assistant)</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users2 className="h-5 w-5 text-gray-500" />
              <span>{members.length > 0 ? members.length : (smallGroup.memberCount || 0)} Members</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members in {smallGroup.name}</CardTitle>
           {canAddMember && (
            <Button asChild size="sm">
                <Link href={`/dashboard/members/new?smallGroupId=${smallGroup._id}&smallGroupName=${encodeURIComponent(smallGroup.name)}&clusterId=${smallGroup.clusterId?._id || ""}&clusterName=${encodeURIComponent(smallGroup.clusterId?.name || clusterNameFromQuery || "")}`}>
                    <Plus className="mr-2 h-4 w-4" /> Add Member
                </Link>
            </Button>
           )}
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <ul className="space-y-2">
              {members.map(member => (
                <li key={member._id} className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <span className="font-medium">{member.userId.firstName} {member.userId.lastName}</span>
                    {member.roleInGroup && <span className="text-sm text-gray-500 ml-2">({member.roleInGroup})</span>}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/members/${member._id}?smallGroupName=${encodeURIComponent(smallGroup.name)}&clusterName=${encodeURIComponent(smallGroup.clusterId?.name || clusterNameFromQuery || "")}`}>
                        View
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No members found in this small group yet.</p>
          )}
        </CardContent>
      </Card>

    </div>
  )
}


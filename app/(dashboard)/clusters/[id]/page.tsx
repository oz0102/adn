// app/(dashboard)/clusters/[id]/page.tsx
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
  Layers, // Icon for Cluster
  MapPin, 
  Users as UsersIcon, // Renamed to avoid conflict with Members component if any
  UserCheck, // Icon for Small Groups count
  Mail, 
  Phone, 
  UserCircle, 
  Edit, 
  Plus,
  ArrowLeft,
  Calendar
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"

// Frontend Cluster interface
interface Cluster {
  _id: string
  clusterId: string 
  name: string
  centerId?: { 
    _id: string
    name: string
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
  memberCount?: number
  smallGroupCount?: number
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

// Frontend Member interface (for members directly in cluster, if applicable)
interface Member {
    _id: string;
    firstName: string;
    lastName: string;
    roleInCluster?: string; 
}

export default function ClusterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryParams = useSearchParams();
  const { toast } = useToast()
  const { user } = useAuthStore()
  const clusterIdFromParams = params.id as string
  const centerNameFromQuery = queryParams.get("centerName");

  const [cluster, setCluster] = useState<Cluster | null>(null)
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([]) 
  const [members, setMembers] = useState<Member[]>([]) 
  const [isLoading, setIsLoading] = useState(true)

  const canEditCluster = user && cluster ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER"], cluster.centerId?._id, cluster._id) : false;
  const canCreateSmallGroup = user && cluster ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER"], cluster.centerId?._id, cluster._id) : false;
  const canAddMemberToCluster = user && cluster ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER"], cluster.centerId?._id, cluster._id) : false;

  const fetchClusterDetails = useCallback(async () => {
    if (!user || !clusterIdFromParams) return;
    try {
      setIsLoading(true)
      
      // Fetch cluster details
      const clusterResponse = await fetch(`/api/clusters/${clusterIdFromParams}`)
      if (!clusterResponse.ok) {
        if (clusterResponse.status === 403) throw new Error("Permission denied to view this cluster.")
        if (clusterResponse.status === 404) throw new Error("Cluster not found.")
        throw new Error(`Failed to fetch cluster details. Status: ${clusterResponse.status}`)
      }
      const clusterData = await clusterResponse.json()
      setCluster(clusterData.cluster)

      // Fetch small groups for this cluster
      const sgResponse = await fetch(`/api/small-groups?clusterId=${clusterIdFromParams}&limit=100`)
      if (!sgResponse.ok) {
         console.warn(`Failed to fetch small groups for cluster ${clusterIdFromParams}. Status: ${sgResponse.status}`);
      } else {
        const sgData = await sgResponse.json()
        setSmallGroups(sgData.smallGroups || [])
      }

      // Fetch members for this cluster (if your API supports direct members of a cluster)
      // If members are only in small groups, this might not be needed or should sum up SG members.
      // const membersResponse = await fetch(`/api/members?clusterId=${clusterIdFromParams}&limit=100`)
      // if (!membersResponse.ok) {
      //    console.warn(`Failed to fetch members for cluster ${clusterIdFromParams}. Status: ${membersResponse.status}`);
      // } else {
      //   const membersData = await membersResponse.json()
      //   setMembers(membersData.members || [])
      // }

    } catch (error: any) {
      console.error("Error fetching cluster details:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load cluster details. Please try again.",
        variant: "destructive",
      })
      setCluster(null)
    } finally {
      setIsLoading(false)
    }
  }, [clusterIdFromParams, toast, user])

  useEffect(() => {
    if(user) {
        fetchClusterDetails()
    }
  }, [user, fetchClusterDetails])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading cluster details...</p></div>
  }

  if (!cluster) {
    return (
        <div className="text-center py-10">
            <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Cluster Not Found</h3>
            <p className="text-gray-500 mb-4">
            The cluster you are looking for does not exist or you may not have permission to view it.
            </p>
            <Button onClick={() => router.push(cluster?.centerId?._id ? `/dashboard/centers/${cluster.centerId._id}` : "/dashboard/clusters")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
        </div>
    );
  }
  
  if (user && !checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER"], cluster.centerId?._id, cluster._id)) {
      return (
        <div className="text-center py-10">
            <Layers className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Permission Denied</h3>
            <p className="text-gray-500 mb-4">You do not have permission to view this cluster.</p>
            <Button onClick={() => router.push(cluster.centerId?._id ? `/dashboard/centers/${cluster.centerId._id}` : "/dashboard/clusters")}>Back</Button>
        </div>
      );
  }

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push(cluster.centerId?._id ? `/dashboard/centers/${cluster.centerId._id}` : `/dashboard/clusters?centerId=${cluster.centerId?._id || ""}&centerName=${encodeURIComponent(cluster.centerId?.name || centerNameFromQuery || "")}`)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {cluster.centerId?.name || centerNameFromQuery || "Clusters"}
        </Button>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
            <Layers className="h-12 w-12 text-green-600" />
            <div>
                <Badge variant="secondary" className="mb-1">{cluster.clusterId}</Badge>
                <h1 className="text-3xl font-bold tracking-tight">{cluster.name}</h1>
                {cluster.centerId && <Link href={`/dashboard/centers/${cluster.centerId._id}`} className="text-sm text-blue-500 hover:underline">Part of {cluster.centerId.name}</Link>}
            </div>
        </div>
        {canEditCluster && (
          <Button asChild>
            <Link href={`/dashboard/clusters/${cluster._id}/edit`}> 
              <Edit className="mr-2 h-4 w-4" /> Edit Cluster
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cluster Overview</CardTitle>
          {cluster.description && <CardDescription>{cluster.description}</CardDescription>}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-medium">Details & Schedule</h4>
            {cluster.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span>{cluster.location}</span>
              </div>
            )}
            {cluster.meetingSchedule && (
                 <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>{cluster.meetingSchedule.day} at {cluster.meetingSchedule.time} ({cluster.meetingSchedule.frequency})</span>
                </div>
            )}
            {cluster.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-500" />
                <a href={`mailto:${cluster.contactEmail}`} className="text-blue-600 hover:underline">{cluster.contactEmail}</a>
              </div>
            )}
            {cluster.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <span>{cluster.contactPhone}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Leadership & Stats</h4>
            {cluster.leaderId && (
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-gray-500" />
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(cluster.leaderId.firstName, cluster.leaderId.lastName)}</AvatarFallback>
                    </Avatar>
                    <span>{cluster.leaderId.firstName} {cluster.leaderId.lastName} (Leader)</span>
                </div>
              </div>
            )}
            {cluster.assistantLeaderId && (
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-gray-500 opacity-70" />
                 <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 opacity-70">
                        <AvatarFallback>{getInitials(cluster.assistantLeaderId.firstName, cluster.assistantLeaderId.lastName)}</AvatarFallback>
                    </Avatar>
                    <span className="opacity-70">{cluster.assistantLeaderId.firstName} {cluster.assistantLeaderId.lastName} (Assistant)</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-gray-500" />
              <span>{smallGroups.length > 0 ? smallGroups.length : (cluster.smallGroupCount || 0)} Small Groups</span>
            </div>
            <div className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-gray-500" />
              {/* If members are fetched directly for cluster, use members.length. Otherwise, use cluster.memberCount or sum from SGs */}
              <span>{members.length > 0 ? members.length : (cluster.memberCount || 0)} Members (Overall in Cluster)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Small Groups in {cluster.name}</CardTitle>
          {canCreateSmallGroup && (
            <Button asChild size="sm">
                <Link href={`/dashboard/small-groups/new?clusterId=${cluster._id}&clusterName=${encodeURIComponent(cluster.name)}&centerId=${cluster.centerId?._id || ""}&centerName=${encodeURIComponent(cluster.centerId?.name || centerNameFromQuery || "")}`}>
                    <Plus className="mr-2 h-4 w-4" /> Add Small Group
                </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {smallGroups.length > 0 ? (
            <ul className="space-y-2">
              {smallGroups.map(sg => (
                <li key={sg._id} className="flex justify-between items-center p-2 border rounded-md">
                  <div>
                    <Link href={`/dashboard/small-groups/${sg._id}?clusterName=${encodeURIComponent(cluster.name)}&centerName=${encodeURIComponent(cluster.centerId?.name || centerNameFromQuery || "")}`} className="font-medium hover:underline">{sg.name}</Link>
                    {sg.leaderId && <span className="text-sm text-gray-500 block">Leader: {sg.leaderId.firstName} {sg.leaderId.lastName}</span>}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/small-groups/${sg._id}?clusterName=${encodeURIComponent(cluster.name)}&centerName=${encodeURIComponent(cluster.centerId?.name || centerNameFromQuery || "")}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No small groups found in this cluster yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Optional: Section for Members directly in this Cluster (if applicable) */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Direct Members in {cluster.name}</CardTitle>
           {canAddMemberToCluster && (
            <Button asChild size="sm">
                <Link href={`/dashboard/members/new?clusterId=${cluster._id}&clusterName=${encodeURIComponent(cluster.name)}`}>
                    <Plus className="mr-2 h-4 w-4" /> Add Member to Cluster
                </Link>
            </Button>
           )}
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <ul className="space-y-2">
              {members.map(member => (
                <li key={member._id} className="flex justify-between items-center p-2 border rounded-md">
                  <span>{member.firstName} {member.lastName} {member.roleInCluster && `(${member.roleInCluster})`}</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/members/${member._id}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No direct members found in this cluster yet.</p>
          )}
        </CardContent>
      </Card> */}

    </div>
  )
}


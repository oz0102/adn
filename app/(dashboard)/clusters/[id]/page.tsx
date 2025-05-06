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
  Users, 
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

// Frontend Cluster interface - adjust based on actual backend model
interface Cluster {
  _id: string
  clusterId: string // Or a unique identifier
  name: string
  centerId?: { // Link to parent Center
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
  assistantLeaderId?: { // Optional assistant leader
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

// Mock interface for Small Groups for now
interface SmallGroup {
  _id: string;
  name: string;
  leaderName: string;
  memberCount: number;
}

interface Member {
    _id: string;
    firstName: string;
    lastName: string;
    roleInCluster?: string; // e.g. Member, Assistant Leader
}

export default function ClusterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryParams = useSearchParams();
  const { toast } = useToast()
  const { user } = useAuthStore()
  const clusterId = params.id as string
  const centerNameFromQuery = queryParams.get("centerName");

  const [cluster, setCluster] = useState<Cluster | null>(null)
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([]) // For displaying SGs in this cluster
  const [members, setMembers] = useState<Member[]>([]) // For displaying members in this cluster
  const [isLoading, setIsLoading] = useState(true)

  // Permissions will depend on the cluster's centerId if available
  const canEditCluster = user && cluster ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER"], cluster.centerId?._id, cluster._id) : false;
  const canCreateSmallGroup = user && cluster ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER"], cluster.centerId?._id, cluster._id) : false;

  const fetchClusterDetails = useCallback(async () => {
    if (!user || !clusterId) return;
    try {
      setIsLoading(true)
      // TODO: Replace with actual API call to fetch cluster details
      // const response = await fetch(`/api/clusters/${clusterId}`)
      // if (!response.ok) throw new Error("Failed to fetch cluster details")
      // const data = await response.json()
      // setCluster(data.cluster)

      // TODO: Fetch small groups for this cluster
      // const sgResponse = await fetch(`/api/small-groups?clusterId=${clusterId}`)
      // const sgData = await sgResponse.json()
      // setSmallGroups(sgData.smallGroups || [])

      // TODO: Fetch members for this cluster
      // const membersResponse = await fetch(`/api/members?clusterId=${clusterId}`)
      // const membersData = await membersResponse.json()
      // setMembers(membersData.members || [])

      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockCluster: Cluster = {
        _id: clusterId,
        clusterId: `CL${1000 + parseInt(clusterId.replace("cluster", ""))}`,
        name: `Omega Cluster ${clusterId.replace("cluster", "")}`,
        centerId: {
            _id: "center1", // Assuming a parent center
            name: centerNameFromQuery || "Demo Center"
        },
        location: `North Suburb, Park Avenue ${clusterId.replace("cluster", "")}`,
        leaderId: {
          _id: `leader${clusterId.replace("cluster", "")}`,
          firstName: `ClusterLead${clusterId.replace("cluster", "")}`,
          lastName: "Abrams",
          email: `clusterlead${clusterId.replace("cluster", "")}@example.com`
        },
        assistantLeaderId: {
            _id: `assist${clusterId.replace("cluster", "")}`,
            firstName: `Assistant${clusterId.replace("cluster", "")}`,
            lastName: "Bellwether"
        },
        contactEmail: `contact@omegacluster${clusterId.replace("cluster", "")}.org`,
        contactPhone: `+1-555-020${clusterId.replace("cluster", "")}`,
        description: `Omega Cluster ${clusterId.replace("cluster", "")} focuses on community outreach and discipleship. We host regular events and activities.`,
        meetingSchedule: {
            day: "Wednesday",
            time: "19:00",
            frequency: "Weekly"
        },
        memberCount: 40 + parseInt(clusterId.replace("cluster", "")) * 10,
        smallGroupCount: 3 + parseInt(clusterId.replace("cluster", "")),
      }
      setCluster(mockCluster)

      const mockSmallGroupsData: SmallGroup[] = Array.from({ length: mockCluster.smallGroupCount || 0 }).map((_, i) => ({
        _id: `sg_in_cluster_${clusterId}_${i+1}`,
        name: `Hope Small Group ${i+1}`,
        leaderName: `SG Lead ${i+1}`,
        memberCount: 7 + i
      }));
      setSmallGroups(mockSmallGroupsData);

      const mockMembersData: Member[] = Array.from({ length: mockCluster.memberCount || 0 }).map((_, i) => ({
        _id: `member_in_cluster_${clusterId}_${i+1}`,
        firstName: `MemberFName${i+1}`,
        lastName: `MemberLName${i+1}`,
        roleInCluster: i % 5 === 0 ? "Assistant" : "Member"
      }));
      setMembers(mockMembersData);

    } catch (error) {
      console.error("Error fetching cluster details:", error)
      toast({
        title: "Error",
        description: "Failed to load cluster details. Please try again.",
        variant: "destructive",
      })
      setCluster(null)
    } finally {
      setIsLoading(false)
    }
  }, [clusterId, toast, user, centerNameFromQuery])

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
  
  // Permission check for viewing this specific cluster
  if (!checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER"], cluster.centerId?._id, cluster._id)) {
      return <p>You do not have permission to view this cluster.</p>;
  }

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push(cluster.centerId?._id ? `/dashboard/centers/${cluster.centerId._id}` : "/dashboard/clusters")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {cluster.centerId?.name || "Clusters"}
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
            {/* TODO: Create an edit page for clusters */}
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
              <span>{cluster.smallGroupCount || 0} Small Groups</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span>{cluster.memberCount || 0} Members</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section for Small Groups within this Cluster */} 
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Small Groups in {cluster.name}</CardTitle>
          {canCreateSmallGroup && (
            <Button asChild size="sm">
                {/* TODO: Ensure new small group page can take clusterId and clusterName */}
                <Link href={`/dashboard/small-groups/new?clusterId=${cluster._id}&clusterName=${encodeURIComponent(cluster.name)}`}>
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
                  <span>{sg.name} (Leader: {sg.leaderName}) - {sg.memberCount} members</span>
                  {/* TODO: Link to actual small group detail page */}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/small-groups/${sg._id}?clusterName=${encodeURIComponent(cluster.name)}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No small groups found in this cluster yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Section for Members within this Cluster */} 
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members in {cluster.name}</CardTitle>
           {/* TODO: Add member button if permissions allow */}
           {/* <Button asChild size="sm">
                <Link href={`/dashboard/members/new?clusterId=${cluster._id}`}>
                    <Plus className="mr-2 h-4 w-4" /> Add Member
                </Link>
            </Button> */}
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <ul className="space-y-2">
              {members.map(member => (
                <li key={member._id} className="flex justify-between items-center p-2 border rounded-md">
                  <span>{member.firstName} {member.lastName} {member.roleInCluster && `(${member.roleInCluster})`}</span>
                  {/* TODO: Link to actual member detail page */}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/members/${member._id}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No members found in this cluster yet.</p>
          )}
        </CardContent>
      </Card>

    </div>
  )
}


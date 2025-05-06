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
  Users, // Icon for Small Group
  MapPin, 
  Mail, 
  Phone, 
  UserCircle, 
  Edit, 
  ArrowLeft,
  Calendar,
  Users2 // Icon for members
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"

// Frontend SmallGroup interface - adjust based on actual backend model
interface SmallGroup {
  _id: string
  groupId: string // Or a unique identifier
  name: string
  clusterId?: { // Link to parent Cluster
    _id: string
    name: string
    centerId?: { // Grandparent Center
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
}

interface Member {
    _id: string;
    firstName: string;
    lastName: string;
    roleInGroup?: string; // e.g. Member, Assistant Leader
}

export default function SmallGroupDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryParams = useSearchParams();
  const { toast } = useToast()
  const { user } = useAuthStore()
  const smallGroupId = params.id as string
  const clusterNameFromQuery = queryParams.get("clusterName");

  const [smallGroup, setSmallGroup] = useState<SmallGroup | null>(null)
  const [members, setMembers] = useState<Member[]>([]) // For displaying members in this small group
  const [isLoading, setIsLoading] = useState(true)

  // Permissions will depend on the small group's clusterId and its centerId
  const canEditSmallGroup = user && smallGroup ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER"], smallGroup.clusterId?.centerId?._id, smallGroup.clusterId?._id, smallGroup._id) : false;
  const canAddMember = user && smallGroup ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER"], smallGroup.clusterId?.centerId?._id, smallGroup.clusterId?._id, smallGroup._id) : false;

  const fetchSmallGroupDetails = useCallback(async () => {
    if (!user || !smallGroupId) return;
    try {
      setIsLoading(true)
      // TODO: Replace with actual API call to fetch small group details
      // const response = await fetch(`/api/small-groups/${smallGroupId}`)
      // if (!response.ok) throw new Error("Failed to fetch small group details")
      // const data = await response.json()
      // setSmallGroup(data.smallGroup)

      // TODO: Fetch members for this small group
      // const membersResponse = await fetch(`/api/members?smallGroupId=${smallGroupId}`)
      // const membersData = await membersResponse.json()
      // setMembers(membersData.members || [])

      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockSmallGroup: SmallGroup = {
        _id: smallGroupId,
        groupId: `SG${2000 + parseInt(smallGroupId.replace("sg", ""))}`,
        name: `Grace Small Group ${smallGroupId.replace("sg", "")}`,
        clusterId: {
            _id: "cluster1", // Assuming a parent cluster
            name: clusterNameFromQuery || "Demo Cluster",
            centerId: {
                _id: "center1",
                name: "Demo Center"
            }
        },
        location: `Community Hall B, Room ${smallGroupId.replace("sg", "")}`,
        leaderId: {
          _id: `sgleader${smallGroupId.replace("sg", "")}`,
          firstName: `SGLead${smallGroupId.replace("sg", "")}`,
          lastName: `Parker`,
          email: `sglead${smallGroupId.replace("sg", "")}@example.com`
        },
        assistantLeaderId: {
            _id: `sgassist${smallGroupId.replace("sg", "")}`,
            firstName: `SGAssist${smallGroupId.replace("sg", "")}`,
            lastName: `Jones`
        },
        contactEmail: `contact@gracesg${smallGroupId.replace("sg", "")}.org`,
        contactPhone: `+1-555-030${smallGroupId.replace("sg", "")}`,
        description: `Grace Small Group ${smallGroupId.replace("sg", "")} is a close-knit community focused on bible study and fellowship.`,
        meetingSchedule: {
            day: "Tuesday",
            time: "18:30",
            frequency: "Weekly"
        },
        memberCount: 10 + parseInt(smallGroupId.replace("sg", "")),
      }
      setSmallGroup(mockSmallGroup)

      const mockMembersData: Member[] = Array.from({ length: mockSmallGroup.memberCount || 0 }).map((_, i) => ({
        _id: `member_in_sg_${smallGroupId}_${i+1}`,
        firstName: `SGMemberFName${i+1}`,
        lastName: `SGMemberLName${i+1}`,
        roleInGroup: i % 4 === 0 ? "Co-leader" : "Member"
      }));
      setMembers(mockMembersData);

    } catch (error) {
      console.error("Error fetching small group details:", error)
      toast({
        title: "Error",
        description: "Failed to load small group details. Please try again.",
        variant: "destructive",
      })
      setSmallGroup(null)
    } finally {
      setIsLoading(false)
    }
  }, [smallGroupId, toast, user, clusterNameFromQuery])

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
            <Button onClick={() => router.push(smallGroup?.clusterId?._id ? `/dashboard/clusters/${smallGroup.clusterId._id}` : "/dashboard/small-groups")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
        </div>
    );
  }
  
  // Permission check for viewing this specific small group
  if (!checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER"], smallGroup.clusterId?.centerId?._id, smallGroup.clusterId?._id, smallGroup._id)) {
      return <p>You do not have permission to view this small group.</p>;
  }

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push(smallGroup.clusterId?._id ? `/dashboard/clusters/${smallGroup.clusterId._id}?centerName=${encodeURIComponent(smallGroup.clusterId?.centerId?.name || "")}` : "/dashboard/small-groups")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to {smallGroup.clusterId?.name || "Small Groups"}
        </Button>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
            <Users className="h-12 w-12 text-purple-600" />
            <div>
                <Badge variant="secondary" className="mb-1">{smallGroup.groupId}</Badge>
                <h1 className="text-3xl font-bold tracking-tight">{smallGroup.name}</h1>
                {smallGroup.clusterId && <Link href={`/dashboard/clusters/${smallGroup.clusterId._id}?centerName=${encodeURIComponent(smallGroup.clusterId?.centerId?.name || "")}`} className="text-sm text-blue-500 hover:underline">Part of {smallGroup.clusterId.name}</Link>}
            </div>
        </div>
        {canEditSmallGroup && (
          <Button asChild>
            {/* TODO: Create an edit page for small groups */}
            <Link href={`/dashboard/small-groups/${smallGroup._id}/edit`}> 
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
              <span>{smallGroup.memberCount || 0} Members</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section for Members within this Small Group */} 
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Members in {smallGroup.name}</CardTitle>
           {canAddMember && (
            <Button asChild size="sm">
                {/* TODO: Ensure new member page can take smallGroupId and smallGroupName */}
                <Link href={`/dashboard/members/new?smallGroupId=${smallGroup._id}&smallGroupName=${encodeURIComponent(smallGroup.name)}`}>
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
                  <span>{member.firstName} {member.lastName} {member.roleInGroup && `(${member.roleInGroup})`}</span>
                  {/* TODO: Link to actual member detail page */}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/members/${member._id}`}>View</Link>
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


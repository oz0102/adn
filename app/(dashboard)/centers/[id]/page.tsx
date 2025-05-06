// app/(dashboard)/centers/[id]/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
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
  Building, 
  MapPin, 
  Users, 
  Network, 
  Mail, 
  Phone, 
  UserCircle, 
  Edit, 
  Plus,
  ArrowLeft
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"

// Frontend Center interface - should match the one in centers/page.tsx
interface Center {
  _id: string
  centerId: string
  name: string
  location?: string
  leadPastor?: {
    _id: string
    firstName: string
    lastName: string
    email?: string // Added email for display
  }
  contactEmail?: string
  contactPhone?: string
  description?: string
  clusterCount?: number
  memberCount?: number
  // Add other relevant fields from backend
}

// Mock interfaces for Clusters and Small Groups for now
interface Cluster {
  _id: string;
  name: string;
  leaderName: string;
  memberCount: number;
}

interface SmallGroup {
  _id: string;
  name: string;
  leaderName: string;
  memberCount: number;
}

export default function CenterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const centerId = params.id as string

  const [center, setCenter] = useState<Center | null>(null)
  const [clusters, setClusters] = useState<Cluster[]>([]) // For displaying clusters in this center
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([]) // For displaying SGs in this center
  const [isLoading, setIsLoading] = useState(true)

  const canEditCenter = user ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN"], center?._id) : false
  const canCreateCluster = user ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN"], center?._id) : false;

  const fetchCenterDetails = useCallback(async () => {
    if (!user || !centerId) return;
    try {
      setIsLoading(true)
      // TODO: Replace with actual API call to fetch center details
      // const response = await fetch(`/api/centers/${centerId}`)
      // if (!response.ok) throw new Error("Failed to fetch center details")
      // const data = await response.json()
      // setCenter(data.center)

      // TODO: Fetch clusters and small groups for this center
      // const clustersResponse = await fetch(`/api/clusters?centerId=${centerId}`)
      // const clustersData = await clustersResponse.json()
      // setClusters(clustersData.clusters || [])

      // const smallGroupsResponse = await fetch(`/api/small-groups?centerId=${centerId}`)
      // const smallGroupsData = await smallGroupsResponse.json()
      // setSmallGroups(smallGroupsData.smallGroups || [])

      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500))
      const mockCenter: Center = {
        _id: centerId,
        centerId: `C${100 + parseInt(centerId.replace("center", ""))}`,
        name: `City Center ${centerId.replace("center", "")}`,
        location: `Central District, Main Street ${centerId.replace("center", "")}`,
        leadPastor: {
          _id: `pastor${centerId.replace("center", "")}`,
          firstName: `LeadPastor${centerId.replace("center", "")}`,
          lastName: "Doe",
          email: `leadpastor${centerId.replace("center", "")}@example.com`
        },
        contactEmail: `contact@citycenter${centerId.replace("center", "")}.org`,
        contactPhone: `+1-555-010${centerId.replace("center", "")}`,
        description: `City Center ${centerId.replace("center", "")} is a thriving community hub dedicated to spiritual growth and outreach. We offer a variety of programs and services for all ages. Our mission is to spread love and faith throughout the city.`,
        clusterCount: 3 + parseInt(centerId.replace("center", "")),
        memberCount: 250 + parseInt(centerId.replace("center", "")) * 50,
      }
      setCenter(mockCenter)

      const mockClustersData: Cluster[] = Array.from({ length: mockCenter.clusterCount || 0 }).map((_, i) => ({
        _id: `cluster_in_center_${centerId}_${i+1}`,
        name: `Alpha Cluster ${i+1}`,
        leaderName: `ClusterLead ${i+1}`,
        memberCount: 20 + i * 5
      }));
      setClusters(mockClustersData);

      const mockSmallGroupsData: SmallGroup[] = Array.from({ length: (mockCenter.clusterCount || 0) * 2 }).map((_, i) => ({
        _id: `sg_in_center_${centerId}_${i+1}`,
        name: `Faith Group ${i+1}`,
        leaderName: `SG Lead ${i+1}`,
        memberCount: 8 + i
      }));
      setSmallGroups(mockSmallGroupsData);

    } catch (error) {
      console.error("Error fetching center details:", error)
      toast({
        title: "Error",
        description: "Failed to load center details. Please try again.",
        variant: "destructive",
      })
      setCenter(null) // Clear center on error
    } finally {
      setIsLoading(false)
    }
  }, [centerId, toast, user])

  useEffect(() => {
    if (user) {
        fetchCenterDetails()
    }
  }, [user, fetchCenterDetails])

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading center details...</p></div>
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
  
  // Permission check for viewing this specific center
  if (!checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN"], center._id)) {
      return <p>You do not have permission to view this center.</p>;
  }

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={() => router.push("/dashboard/centers")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Centers List
        </Button>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-4">
            <Building className="h-12 w-12 text-blue-600" />
            <div>
                <Badge variant="secondary" className="mb-1">{center.centerId}</Badge>
                <h1 className="text-3xl font-bold tracking-tight">{center.name}</h1>
            </div>
        </div>
        {canEditCenter && (
          <Button asChild>
            <Link href={`/dashboard/centers/${center._id}/edit`}> {/* Assuming an edit page */} 
              <Edit className="mr-2 h-4 w-4" /> Edit Center
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Center Overview</CardTitle>
          {center.description && <CardDescription>{center.description}</CardDescription>}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-medium">Details</h4>
            {center.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span>{center.location}</span>
              </div>
            )}
            {center.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-500" />
                <a href={`mailto:${center.contactEmail}`} className="text-blue-600 hover:underline">{center.contactEmail}</a>
              </div>
            )}
            {center.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-500" />
                <span>{center.contactPhone}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Leadership & Stats</h4>
            {center.leadPastor && (
              <div className="flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-gray-500" />
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(center.leadPastor.firstName, center.leadPastor.lastName)}</AvatarFallback>
                    </Avatar>
                    <span>{center.leadPastor.firstName} {center.leadPastor.lastName} (Lead Pastor)</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-gray-500" />
              <span>{center.clusterCount || 0} Clusters</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span>{center.memberCount || 0} Members</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section for Clusters within this Center */} 
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Clusters in {center.name}</CardTitle>
          {canCreateCluster && (
            <Button asChild size="sm">
                <Link href={`/dashboard/clusters/new?centerId=${center._id}&centerName=${encodeURIComponent(center.name)}`}>
                    <Plus className="mr-2 h-4 w-4" /> Add Cluster
                </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {clusters.length > 0 ? (
            <ul className="space-y-2">
              {clusters.map(cluster => (
                <li key={cluster._id} className="flex justify-between items-center p-2 border rounded-md">
                  <span>{cluster.name} (Leader: {cluster.leaderName}) - {cluster.memberCount} members</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/clusters/${cluster._id}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No clusters found in this center yet.</p>
          )}
        </CardContent>
      </Card>
      
      {/* Placeholder for Small Groups list if needed directly on Center page, or link to a dedicated view */}
      {/* For now, we assume Small Groups are primarily viewed under their respective Clusters */}

    </div>
  )
}


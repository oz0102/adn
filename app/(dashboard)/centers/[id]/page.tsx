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
  clusterCount?: number // This might be derived or fetched separately
  memberCount?: number // This might be derived or fetched separately
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
  // Add other fields as returned by API
}

// SmallGroup interface is not used in this component directly for listing, so it can be removed if not needed for other logic.
// interface SmallGroup {
//   _id: string;
//   groupId: string;
//   name: string;
//   leaderId?: {
//     firstName: string;
//     lastName: string;
//   };
//   memberCount?: number;
//   // Add other fields as returned by API
// }

export default function CenterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const centerIdFromParams = params.id as string

  const [center, setCenter] = useState<Center | null>(null)
  const [clusters, setClusters] = useState<Cluster[]>([]) 
  // const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([]) // Removed as it was unused
  const [isLoading, setIsLoading] = useState(true)

  const canEditCenter = user && center ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN"], center._id) : false
  const canCreateCluster = user && center ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN"], center._id) : false;

  const fetchCenterDetails = useCallback(async () => {
    if (!user || !centerIdFromParams) return;
    try {
      setIsLoading(true)
      
      // Fetch center details
      const centerResponse = await fetch(`/api/centers/${centerIdFromParams}`)
      if (!centerResponse.ok) {
        if (centerResponse.status === 403) throw new Error("Permission denied to view this center.")
        if (centerResponse.status === 404) throw new Error("Center not found.")
        throw new Error(`Failed to fetch center details. Status: ${centerResponse.status}`)
      }
      const centerData = await centerResponse.json()
      setCenter(centerData.center)

      // Fetch clusters for this center
      const clustersResponse = await fetch(`/api/clusters?centerId=${centerIdFromParams}&limit=100`) // Fetching more clusters, assuming pagination is not on this page for clusters list
      if (!clustersResponse.ok) {
        console.warn(`Failed to fetch clusters for center ${centerIdFromParams}. Status: ${clustersResponse.status}`);
        // Don't throw error, page can still load center details
      } else {
        const clustersData = await clustersResponse.json()
        setClusters(clustersData.clusters || [])
      }

    } catch (error: any) {
      console.error("Error fetching center details:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load center details. Please try again.",
        variant: "destructive",
      })
      setCenter(null) 
    } finally {
      setIsLoading(false)
    }
  }, [centerIdFromParams, toast, user])

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
  
  if (user && !checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN"], center._id)) {
      return (
        <div className="text-center py-10">
            <Building className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Permission Denied</h3>
            <p className="text-gray-500 mb-4">You do not have permission to view this center.</p>
            <Button onClick={() => router.push("/dashboard/centers")}>Back to Centers</Button>
        </div>
      );
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
            <Link href={`/dashboard/centers/${center._id}/edit`}> 
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
              <span>{clusters.length > 0 ? clusters.length : (center.clusterCount || 0)} Clusters</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span>{center.memberCount || 0} Members (Overall)</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <div>
                    <Link href={`/dashboard/clusters/${cluster._id}?centerName=${encodeURIComponent(center.name)}`} className="font-medium hover:underline">{cluster.name}</Link>
                    {cluster.leaderId && <span className="text-sm text-gray-500 block">Leader: {cluster.leaderId.firstName} {cluster.leaderId.lastName}</span>}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/clusters/${cluster._id}?centerName=${encodeURIComponent(center.name)}`}>View</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No clusters found in this center yet.</p>
          )}
        </CardContent>
      </Card>

    </div>
  )
}


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
} from "@/lib/client/components/ui/card"
import { Button } from "@/lib/client/components/ui/button"
import { Badge } from "@/lib/client/components/ui/badge"
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
  ArrowLeft,
  AlertTriangle,
  Calendar
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/lib/client/components/ui/avatar"
import { useToast } from "@/lib/client/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { useSession } from "next-auth/react"

// Frontend Center interface
interface Center {
  _id: string
  centerId: string
  name: string
  location?: string
  leadPastor?: {
    _id: string
    firstName: string
    lastName: string
    email?: string
  }
  contactEmail?: string
  contactPhone?: string
  description?: string
  clusterCount?: number
  memberCount?: number
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

export default function CenterDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuthStore()
  const { status } = useSession()
  const centerIdFromParams = params.centerId as string // Changed from params.id

  const [center, setCenter] = useState<Center | null>(null)
  const [clusters, setClusters] = useState<Cluster[]>([]) 
  const [isLoading, setIsLoading] = useState(true)
  const [canEditCenter, setCanEditCenter] = useState(false)
  const [canCreateCluster, setCanCreateCluster] = useState(false)
  const [hasViewPermission, setHasViewPermission] = useState(true)

  // Check permissions via API instead of direct model access
  const checkPermissions = useCallback(async () => {
    if (!user || !centerIdFromParams) return;
    
    try {
      // Check if user can edit center (GLOBAL_ADMIN or CENTER_ADMIN for this center)
      const editResponse = await fetch(`/api/auth/check-permission?roles=GLOBAL_ADMIN,CENTER_ADMIN&centerId=${centerIdFromParams}`);
      if (editResponse.ok) {
        const data = await editResponse.json();
        setCanEditCenter(data.hasPermission);
      }
      
      // Check if user can create clusters (same permissions as edit)
      setCanCreateCluster(canEditCenter);
      
      // Check view permission (GLOBAL_ADMIN or CENTER_ADMIN)
      const viewResponse = await fetch(`/api/auth/check-permission?roles=GLOBAL_ADMIN,CENTER_ADMIN`);
      if (viewResponse.ok) {
        const data = await viewResponse.json();
        setHasViewPermission(data.hasPermission);
      } else {
        setHasViewPermission(false);
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      setCanEditCenter(false);
      setCanCreateCluster(false);
      setHasViewPermission(false);
    }
  }, [user, centerIdFromParams, canEditCenter]);

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
      const clustersResponse = await fetch(`/api/clusters?centerId=${centerIdFromParams}&limit=100`)
      if (!clustersResponse.ok) {
        console.warn(`Failed to fetch clusters for center ${centerIdFromParams}. Status: ${clustersResponse.status}`);
        // Don't throw error, page can still load center details
      } else {
        const clustersData = await clustersResponse.json()
        setClusters(clustersData.clusters || [])
      }

    } catch (error: Error) {
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
    // Only proceed if authentication is complete
    if (status === "loading") return;
    
    if (isAuthenticated && user) {
      checkPermissions();
      fetchCenterDetails();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, isAuthenticated, user, checkPermissions, fetchCenterDetails, router]);

  if (status === "loading" || isLoading) {
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
            <Button onClick={() => router.push("/centers")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Centers
            </Button>
        </div>
    );
  }
  
  if (!hasViewPermission) {
      return (
        <div className="text-center py-10">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Permission Denied</h3>
            <p className="text-gray-500 mb-4">You do not have permission to view this center.</p>
            <Button onClick={() => router.push("/centers")}>Back to Centers</Button>
        </div>
      );
  }

  return (
    <div className="space-y-6 p-6">
        <Button variant="outline" onClick={() => router.push("/centers")} className="mb-4">
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
            <Link href={`/centers/${center._id}/edit`}> 
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
                <Link href={`/clusters/new?centerId=${center._id}&centerName=${encodeURIComponent(center.name)}`}>
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
                    <Link href={`/clusters/${cluster._id}?centerName=${encodeURIComponent(center.name)}`} className="font-medium hover:underline">{cluster.name}</Link>
                    {cluster.leaderId && <span className="text-sm text-gray-500 block">Leader: {cluster.leaderId.firstName} {cluster.leaderId.lastName}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/clusters/${cluster._id}`}>View</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/clusters/${cluster._id}/dashboard`}>Dashboard</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No clusters found in this center yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/centers/${center._id}/dashboard`}>
                <Building className="mr-2 h-4 w-4" /> Center Dashboard
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/centers/${center._id}/members`}>
                <Users className="mr-2 h-4 w-4" /> View Members
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href={`/centers/${center._id}/events`}>
                <Calendar className="mr-2 h-4 w-4" /> Center Events
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full mt-0.5">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">New member added</p>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

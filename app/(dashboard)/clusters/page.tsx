// app/(dashboard)/clusters/page.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus, 
  ChevronRight, 
  X, 
  Users as UsersIcon, // Renamed to avoid conflict
  MapPin,
  Calendar,
  Layers, // Icon for Clusters
  AlertTriangle // For permission errors
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"

// Frontend Cluster interface - adjust based on actual backend model
interface Cluster {
  _id: string
  clusterId: string
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
  description?: string
  meetingSchedule?: {
    day: string
    time: string
    frequency: string
  }
  memberCount?: number
  smallGroupCount?: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

// Add a User interface that includes the assignedRoles property
// This interface defines the expected shape of the user object.
interface User {
  _id: string;
  assignedRoles?: Array<{
    role: string;
    scopeId?: string;
  }>;
  // Add other user properties as needed
}

export default function ClustersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  // Explicitly type `user` according to the local `User` interface.
  // This tells TypeScript to expect `user` to be of type `User | null`.
  const { user }: { user: User | null } = useAuthStore();
  
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCenterId, setFilterCenterId] = useState<string | null>(searchParams.get("centerId"))
  const [parentCenterName, setParentCenterName] = useState<string | null>(searchParams.get("centerName"))

  // With `user` correctly typed as `User | null`:
  // If `user` is truthy, `user._id` will be `string` (not undefined).
  // This should resolve the errors for `checkPermission` calls.
  const canViewAnyCluster = user ? checkPermission(user._id, ["HQ_ADMIN"]) : false;
  const canCreateCluster = user ? checkPermission(user._id, ["HQ_ADMIN", "CENTER_ADMIN"], filterCenterId || undefined) : false;

  const fetchClusters = useCallback(async (page: number, search: string, centerIdForFilter?: string | null) => {
    if (!user) return; // After this, `user` is of type `User`.

    // `user.assignedRoles` is now correctly typed as `Array<{...}> | undefined`.
    // The optional chaining `?.some` will work as expected, resolving the "property does not exist" errors.
    let hasPermissionToFetch = canViewAnyCluster;
    if (centerIdForFilter && user.assignedRoles?.some((r: { role: string; scopeId?: string }) => r.role === "CENTER_ADMIN" && r.scopeId === centerIdForFilter)) {
        hasPermissionToFetch = true;
    }
    if (!centerIdForFilter && user.assignedRoles?.some((r: { role: string; scopeId?: string }) => r.role === "CENTER_ADMIN") && !canViewAnyCluster) {
        hasPermissionToFetch = true; 
    }
    if (!hasPermissionToFetch && !canViewAnyCluster && !user.assignedRoles?.some((r: { role: string; scopeId?: string }) => r.role === "CLUSTER_LEADER")) {
        toast({ title: "Permission Denied", description: "You may not have permission to view all clusters. Try navigating from a center.", variant: "destructive" });
        setClusters([]);
        setPagination({ page:1, limit:10, total:0, pages:0 });
        setIsLoading(false);
        return;
    }

    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", pagination.limit.toString())
      if (search) queryParams.append("search", search)
      if (centerIdForFilter) queryParams.append("centerId", centerIdForFilter)
      
      const response = await fetch(`/api/clusters?${queryParams.toString()}`)
      if (!response.ok) {
        if(response.status === 403) {
            toast({ title: "Permission Denied", description: "You do not have permission to fetch these clusters.", variant: "destructive" });
            setClusters([]);
            setPagination({ page, limit: pagination.limit, total: 0, pages: 0 });
            setIsLoading(false);
            return;
        }
        throw new Error(`Failed to fetch clusters. Status: ${response.status}`)
      }
      const data = await response.json()
      setClusters(data.clusters || [])
      setPagination(data.paginationInfo || { page, limit: pagination.limit, total: 0, pages: 0 })
      if (data.clusters && data.clusters.length > 0 && centerIdForFilter && !parentCenterName) {
        setParentCenterName(data.clusters[0].centerId?.name || null);
      }

    } catch (error: any) {
      console.error("Error fetching clusters:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load clusters data. Please try again.",
        variant: "destructive",
      })
      setClusters([]);
      setPagination({ page, limit: pagination.limit, total: 0, pages: 0 });
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, toast, user, canViewAnyCluster, parentCenterName])

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const centerIdFromQuery = searchParams.get("centerId")
    const centerNameFromQuery = searchParams.get("centerName")

    setSearchTerm(search)
    setFilterCenterId(centerIdFromQuery)
    if (centerNameFromQuery) setParentCenterName(centerNameFromQuery);

    if (user) {
        fetchClusters(page, search, centerIdFromQuery)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user, fetchClusters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchTerm, page: 1 })
  }

  const clearFilters = () => {
    setSearchTerm("")
    const paramsToKeep: Record<string, string | number | null> = {};
    if (filterCenterId) paramsToKeep.centerId = filterCenterId;
    if (parentCenterName) paramsToKeep.centerName = parentCenterName;
    router.push(`/dashboard/clusters${Object.keys(paramsToKeep).length > 0 ? `?${new URLSearchParams(paramsToKeep as Record<string,string>).toString()}` : ""}`);
  }

  const updateUrlParams = (params: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        newParams.set(key, value.toString())
      } else {
        newParams.delete(key)
      }
    })
    router.push(`/dashboard/clusters?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams({ page })
  }

  if (!user && !isLoading) {
    return <p>Loading user data or user not authenticated...</p>;
  }

  // Fix type error by passing user._id instead of user object
  const canViewPage = user ? checkPermission(user._id, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER"]) : false;
  
  if (user && !canViewPage) {
      return (
          <div className="text-center py-10">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Permission Denied</h3>
              <p className="text-gray-500 mb-4">You do not have permission to view this page.</p>
              <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clusters {parentCenterName ? `(in ${parentCenterName})` : ""}</h1>
        {canCreateCluster && (
          <Button asChild>
            <Link href={`/dashboard/clusters/new${filterCenterId ? `?centerId=${filterCenterId}${parentCenterName ? `&centerName=${encodeURIComponent(parentCenterName)}` : ""}` : ""}`}>
              <Plus className="mr-2 h-4 w-4" /> Create Cluster
            </Link>
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search clusters..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={clearFilters}
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-20 bg-gray-100 dark:bg-gray-800"></CardHeader>
                <CardContent className="pt-4">
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded mb-1"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : clusters.length === 0 ? (
          <div className="text-center py-10">
            <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Clusters Found</h3>
            <p className="text-gray-500 mb-4">
              There are no clusters matching your search criteria or available for the selected center.
            </p>
            {canCreateCluster && <Button onClick={() => router.push(`/dashboard/clusters/new${filterCenterId ? `?centerId=${filterCenterId}${parentCenterName ? `&centerName=${encodeURIComponent(parentCenterName)}` : ""}` : ""}`)}>Create Cluster</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clusters.map((cluster) => (
              <Card key={cluster._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="w-fit mb-2">{cluster.clusterId}</Badge>
                    {cluster.centerId && <Badge variant="secondary" className="text-xs">{cluster.centerId.name}</Badge>}
                  </div>
                  <CardTitle>{cluster.name}</CardTitle>
                  {cluster.description && <CardDescription className="line-clamp-2">{cluster.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    {cluster.location && (
                        <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{cluster.location}</span>
                        </div>
                    )}
                    {cluster.meetingSchedule && (
                        <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                            {cluster.meetingSchedule.day}s at {cluster.meetingSchedule.time} ({cluster.meetingSchedule.frequency})
                        </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{cluster.smallGroupCount || 0} small groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-gray-500" /> 
                      <span className="text-sm">{cluster.memberCount || 0} members</span>
                    </div>
                    {cluster.leaderId && (
                        <div>
                        <h4 className="text-sm font-medium mb-1">Cluster Leader</h4>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                            <AvatarFallback>
                                {getInitials(cluster.leaderId.firstName, cluster.leaderId.lastName)}
                            </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{cluster.leaderId.firstName} {cluster.leaderId.lastName}</span>
                        </div>
                        </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/clusters/${cluster._id}?centerName=${encodeURIComponent(cluster.centerId?.name || parentCenterName || "")}`}>
                      <span>View Cluster</span>
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {pagination.pages > 1 && (
            <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
            />
        )}
      </div>
    </div>
  )
}


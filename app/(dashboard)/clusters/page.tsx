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
  Users,
  MapPin,
  Calendar,
  Layers, // Changed from LucideLayoutGrid
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

export default function ClustersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuthStore()
  
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

  // Permissions: HQ can see all, Center Admin can see their center's clusters, Cluster Leader can see their own.
  // Create permission depends on context (e.g. creating for a specific center)
  const canViewAnyCluster = user ? checkPermission(user, ["HQ_ADMIN"]) : false;
  const canCreateCluster = user ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN"], filterCenterId || undefined) : false;

  const fetchClusters = useCallback(async (page: number, search: string, centerIdForFilter?: string | null) => {
    if (!user) return;
    // Determine if user has permission to view clusters at all or for a specific center
    // HQ_ADMIN can view all. CENTER_ADMIN can view for their center. CLUSTER_LEADER can view their own (handled on detail page).
    let hasPermissionToFetch = canViewAnyCluster;
    if (centerIdForFilter && user.assignedRoles?.some(r => r.role === "CENTER_ADMIN" && r.scopeId === centerIdForFilter)) {
        hasPermissionToFetch = true;
    }
    if (!centerIdForFilter && user.assignedRoles?.some(r => r.role === "CENTER_ADMIN")) {
        // If a center admin is viewing generic /clusters, they should only see their center's clusters.
        // For simplicity, we might require a centerId to be passed for Center Admins.
        // Or, fetch all clusters they have access to (could be multiple centers if role allows, though current model is 1 center per Center Admin).
        // For now, let's assume if no centerIdForFilter, HQ_ADMIN sees all, others see none unless centerId is specified.
        if(!canViewAnyCluster) {
            toast({ title: "Permission Denied", description: "Please select a center to view its clusters or contact an administrator.", variant: "destructive" });
            setClusters([]);
            setPagination({ page:1, limit:10, total:0, pages:0 });
            setIsLoading(false);
            return;
        }
    }
    if (!hasPermissionToFetch && !canViewAnyCluster) {
        toast({ title: "Permission Denied", description: "You do not have permission to view these clusters.", variant: "destructive" });
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
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/clusters?${queryParams.toString()}`)
      // if (!response.ok) {
      //   if(response.status === 403) throw new Error("Permission denied to fetch clusters.")
      //   throw new Error("Failed to fetch clusters")
      // }
      // const data = await response.json()
      // setClusters(data.clusters || [])
      // setPagination(data.paginationInfo || { page, limit: 10, total: 0, pages: 0 })

      // Mock data for now, simulating filtering by centerId if provided
      await new Promise(resolve => setTimeout(resolve, 500))
      const allMockClusters: Cluster[] = Array.from({ length: 5 }).map((_, i) => ({
        _id: `cluster${i + 1}`,
        clusterId: `CL${1000 + i}`,
        name: `${i % 2 === 0 ? "North" : "South"} Region Cluster ${i+1}`,
        centerId: { _id: `center${ (i % 2) + 1 }`, name: `City Center ${ (i % 2) + 1 }` },
        location: `${i % 2 === 0 ? "North" : "South"} Region`,
        leaderId: { _id: `member${i+10}`, firstName: `Pastor${i+1}`, lastName: "Johnson" },
        description: `A cluster of small groups in the ${i % 2 === 0 ? "North" : "South"} region.`,
        meetingSchedule: { day: "Wednesday", time: "19:00", frequency: "Weekly" },
        memberCount: 50 + (i * 20),
        smallGroupCount: 5 + i
      }));
      
      const filteredMockClusters = centerIdForFilter 
        ? allMockClusters.filter(c => c.centerId?._id === centerIdForFilter) 
        : allMockClusters;

      setClusters(filteredMockClusters)
      setPagination({
        page,
        limit: 10,
        total: filteredMockClusters.length, 
        pages: Math.ceil(filteredMockClusters.length / 10),
      })
    } catch (error: any) {
      console.error("Error fetching clusters:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load clusters data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.limit, toast, user, canViewAnyCluster])

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const centerIdFromQuery = searchParams.get("centerId")
    setSearchTerm(search)
    setFilterCenterId(centerIdFromQuery)

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
    // Keep centerId filter if it was set by navigation
    router.push(filterCenterId ? `/dashboard/clusters?centerId=${filterCenterId}` : "/dashboard/clusters")
  }

  const updateUrlParams = (params: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
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

  if (!user) {
    return <p>Loading user data or user not authenticated...</p>;
  }

  // General permission to view the page at all. More specific filtering happens in fetchClusters.
  const canViewPage = user ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER"]) : false;
  if (!canViewPage) {
      return (
          <div className="text-center py-10">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Permission Denied</h3>
              <p className="text-gray-500 mb-4">You do not have permission to view this page.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clusters {filterCenterId && clusters[0]?.centerId?.name ? `(in ${clusters[0].centerId.name})` : ""}</h1>
        {canCreateCluster && (
          <Button asChild>
            <Link href={`/dashboard/clusters/new${filterCenterId ? `?centerId=${filterCenterId}` : ""}`}>
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
            {canCreateCluster && <Button onClick={() => router.push(`/dashboard/clusters/new${filterCenterId ? `?centerId=${filterCenterId}` : ""}`)}>Create Cluster</Button>}
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
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{cluster.smallGroupCount || 0} small groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" /> {/* Consider a different icon for members vs SGs */} 
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
                    <Link href={`/dashboard/clusters/${cluster._id}?centerName=${encodeURIComponent(cluster.centerId?.name || "")}`}>
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


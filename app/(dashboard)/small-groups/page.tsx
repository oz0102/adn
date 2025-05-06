// app/(dashboard)/small-groups/page.tsx
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
  Users as UsersIcon, // Renamed to avoid conflict with Users type
  MapPin,
  Calendar,
  AlertTriangle // For permission errors
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"

// Frontend SmallGroup interface - adjust based on actual backend model
interface SmallGroup {
  _id: string
  groupId: string
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
  }
  description?: string
  meetingSchedule?: {
    day: string
    time: string
    frequency: string
  }
  memberCount?: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function SmallGroupsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuthStore()
  
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClusterId, setFilterClusterId] = useState<string | null>(searchParams.get("clusterId"))
  const [parentClusterName, setParentClusterName] = useState<string | null>(searchParams.get("clusterName"))

  // Permissions
  const canViewAnySmallGroup = user ? checkPermission(user, ["HQ_ADMIN"]) : false;
  // Create permission depends on context (e.g. creating for a specific cluster)
  const canCreateSmallGroup = user ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER"], undefined, filterClusterId || undefined) : false;

  const fetchSmallGroups = useCallback(async (page: number, search: string, clusterIdForFilter?: string | null) => {
    if (!user) return;

    let hasPermissionToFetch = canViewAnySmallGroup;
    if (clusterIdForFilter && user.assignedRoles?.some(r => (r.role === "CENTER_ADMIN" || r.role === "CLUSTER_LEADER") && r.scopeId === clusterIdForFilter)) {
        // This logic is a bit simplified. A Center Admin might have access to multiple clusters in their center.
        // A Cluster Leader has access to SGs in their cluster.
        // For now, if clusterIdForFilter is present, we assume the backend will handle fine-grained RBAC for that scope.
        hasPermissionToFetch = true;
    }
    // If a user is a Center Admin but no clusterId is specified, they might see all SGs in their center(s).
    // If a user is a Cluster Leader but no clusterId is specified, they might see all SGs in their cluster(s).
    // This requires more complex API logic or frontend filtering if the API returns more than needed.
    // For now, if no clusterIdForFilter, HQ_ADMIN sees all. Others need a specific scope or won't see much.
    if (!clusterIdForFilter && !canViewAnySmallGroup && !user.assignedRoles?.some(r => r.role === "CENTER_ADMIN" || r.role === "CLUSTER_LEADER")) {
        toast({ title: "Permission Denied", description: "Please select a cluster to view its small groups or contact an administrator.", variant: "destructive" });
        setSmallGroups([]);
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
      if (clusterIdForFilter) queryParams.append("clusterId", clusterIdForFilter)
      
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/small-groups?${queryParams.toString()}`)
      // if (!response.ok) {
      //   if(response.status === 403) throw new Error("Permission denied to fetch small groups.")
      //   throw new Error("Failed to fetch small groups")
      // }
      // const data = await response.json()
      // setSmallGroups(data.smallGroups || [])
      // setPagination(data.paginationInfo || { page, limit: 10, total: 0, pages: 0 })

      // Mock data for now
      await new Promise(resolve => setTimeout(resolve, 500))
      const allMockSmallGroups: SmallGroup[] = Array.from({ length: 15 }).map((_, i) => ({
        _id: `sg${i + 1}`,
        groupId: `SG${2000 + i}`,
        name: `Faith Group ${i + 1}`,
        clusterId: { 
            _id: `cluster${ (i % 3) + 1 }`, 
            name: `Omega Cluster ${ (i % 3) + 1 }`,
            centerId: { _id: `center${ (i % 2) + 1}`, name: `City Center ${ (i % 2) + 1 }`}
        },
        location: `Community Room ${i+1}`,
        leaderId: { _id: `member_sg_lead${i+20}`, firstName: `SGLead${i+1}`, lastName: "Parker" },
        description: `A welcoming small group for fellowship and study, meeting weekly.`,
        meetingSchedule: { day: "Tuesday", time: "19:00", frequency: "Weekly" },
        memberCount: 8 + i,
      }));
      
      const filteredMockSmallGroups = clusterIdForFilter 
        ? allMockSmallGroups.filter(sg => sg.clusterId?._id === clusterIdForFilter) 
        : allMockSmallGroups;

      setSmallGroups(filteredMockSmallGroups)
      setPagination({
        page,
        limit: 10,
        total: filteredMockSmallGroups.length, 
        pages: Math.ceil(filteredMockSmallGroups.length / 10),
      })
    } catch (error: any) {
      console.error("Error fetching small groups:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load small groups data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.limit, toast, user, canViewAnySmallGroup])

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const clusterIdFromQuery = searchParams.get("clusterId")
    const clusterName = searchParams.get("clusterName")

    setSearchTerm(search)
    setFilterClusterId(clusterIdFromQuery)
    setParentClusterName(clusterName)

    if (user) {
        fetchSmallGroups(page, search, clusterIdFromQuery)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user, fetchSmallGroups])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchTerm, page: 1 })
  }

  const clearFilters = () => {
    setSearchTerm("")
    router.push(filterClusterId ? `/dashboard/small-groups?clusterId=${filterClusterId}${parentClusterName ? `&clusterName=${encodeURIComponent(parentClusterName)}` : ""}` : "/dashboard/small-groups")
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
    router.push(`/dashboard/small-groups?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams({ page })
  }

  if (!user) {
    return <p>Loading user data or user not authenticated...</p>;
  }

  const canViewPage = user ? checkPermission(user, ["HQ_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER"]) : false;
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
        <h1 className="text-3xl font-bold tracking-tight">Small Groups {parentClusterName ? `(in ${parentClusterName})` : ""}</h1>
        {canCreateSmallGroup && (
          <Button asChild>
            <Link href={`/dashboard/small-groups/new${filterClusterId ? `?clusterId=${filterClusterId}${parentClusterName ? `&clusterName=${encodeURIComponent(parentClusterName)}` : ""}` : ""}`}>
              <Plus className="mr-2 h-4 w-4" /> Create Small Group
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
                placeholder="Search small groups..."
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
            {[...Array(6)].map((_, i) => (
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
        ) : smallGroups.length === 0 ? (
          <div className="text-center py-10">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Small Groups Found</h3>
            <p className="text-gray-500 mb-4">
              There are no small groups matching your search criteria or available for the selected cluster.
            </p>
            {canCreateSmallGroup && <Button onClick={() => router.push(`/dashboard/small-groups/new${filterClusterId ? `?clusterId=${filterClusterId}${parentClusterName ? `&clusterName=${encodeURIComponent(parentClusterName)}` : ""}` : ""}`)}>Create Small Group</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {smallGroups.map((group) => (
              <Card key={group._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="w-fit mb-2">{group.groupId}</Badge>
                    {group.clusterId && <Badge variant="secondary" className="text-xs">{group.clusterId.name}</Badge>}
                  </div>
                  <CardTitle>{group.name}</CardTitle>
                  {group.description && <CardDescription className="line-clamp-2">{group.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    {group.location && (
                        <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{group.location}</span>
                        </div>
                    )}
                    {group.meetingSchedule && (
                        <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                            {group.meetingSchedule.day}s at {group.meetingSchedule.time} ({group.meetingSchedule.frequency})
                        </span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                      <UsersIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{group.memberCount || 0} members</span>
                    </div>
                    {group.leaderId && (
                        <div>
                        <h4 className="text-sm font-medium mb-1">Group Leader</h4>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                            <AvatarFallback>
                                {getInitials(group.leaderId.firstName, group.leaderId.lastName)}
                            </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{group.leaderId.firstName} {group.leaderId.lastName}</span>
                        </div>
                        </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/small-groups/${group._id}?clusterName=${encodeURIComponent(group.clusterId?.name || "")}`}>
                      <span>View Group</span>
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


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
  Users as UsersIcon, 
  MapPin,
  Calendar,
  AlertTriangle 
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
  const [parentCenterName, setParentCenterName] = useState<string | null>(searchParams.get("centerName")) // For breadcrumbs/links

  const canViewAnySmallGroup = user ? checkPermission(user, ["GLOBAL_ADMIN"]) : false;
  const canCreateSmallGroup = user ? checkPermission(user, ["GLOBAL_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER"], undefined, filterClusterId || undefined) : false;

  const fetchSmallGroups = useCallback(async (page: number, search: string, clusterIdForFilter?: string | null) => {
    if (!user) return;

    let hasPermissionToFetch = canViewAnySmallGroup;
    if (clusterIdForFilter && user.assignedRoles?.some(r => 
        (r.role === "CLUSTER_LEADER" && r.scopeId === clusterIdForFilter) || 
        (r.role === "CENTER_ADMIN" && r.scopeId === smallGroups[0]?.clusterId?.centerId?._id) // Needs better check if SG data not yet loaded
    )) {
        hasPermissionToFetch = true;
    }
    if (!clusterIdForFilter && user.assignedRoles?.some(r => r.role === "CENTER_ADMIN" || r.role === "CLUSTER_LEADER") && !canViewAnySmallGroup) {
        toast({ title: "Filter Required", description: "Please select a cluster to view its small groups.", variant: "default" });
        setSmallGroups([]);
        setPagination({ page:1, limit:10, total:0, pages:0 });
        setIsLoading(false);
        return;
    }
    if (!hasPermissionToFetch && !canViewAnySmallGroup) {
        toast({ title: "Permission Denied", description: "You may not have permission to view all small groups. Try navigating from a cluster.", variant: "destructive" });
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
      
      const response = await fetch(`/api/small-groups?${queryParams.toString()}`)
      if (!response.ok) {
        if(response.status === 403) {
            toast({ title: "Permission Denied", description: "You do not have permission to fetch these small groups.", variant: "destructive" });
            setSmallGroups([]);
            setPagination({ page, limit: pagination.limit, total: 0, pages: 0 });
            setIsLoading(false);
            return;
        }
        throw new Error(`Failed to fetch small groups. Status: ${response.status}`)
      }
      const data = await response.json()
      setSmallGroups(data.smallGroups || [])
      setPagination(data.paginationInfo || { page, limit: pagination.limit, total: 0, pages: 0 })
      
      // If clusterId is used for filtering and parent names are not already set, try to get them from the first result
      if (data.smallGroups && data.smallGroups.length > 0 && clusterIdForFilter) {
        if (!parentClusterName) setParentClusterName(data.smallGroups[0].clusterId?.name || null);
        if (!parentCenterName) setParentCenterName(data.smallGroups[0].clusterId?.centerId?.name || null);
      }

    } catch (error: Error) {
      console.error("Error fetching small groups:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load small groups data. Please try again.",
        variant: "destructive",
      })
      setSmallGroups([]);
      setPagination({ page, limit: pagination.limit, total: 0, pages: 0 });
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, toast, user, canViewAnySmallGroup, parentClusterName, parentCenterName, smallGroups])

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const clusterIdFromQuery = searchParams.get("clusterId")
    const clusterNameFromQuery = searchParams.get("clusterName")
    const centerNameFromQuery = searchParams.get("centerName")

    setSearchTerm(search)
    setFilterClusterId(clusterIdFromQuery)
    if (clusterNameFromQuery) setParentClusterName(clusterNameFromQuery);
    if (centerNameFromQuery) setParentCenterName(centerNameFromQuery);

    if (user) {
        fetchSmallGroups(page, search, clusterIdFromQuery)
    }
  }, [searchParams, user, fetchSmallGroups])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchTerm, page: 1 })
  }

  const clearFilters = () => {
    setSearchTerm("")
    const paramsToKeep: Record<string, string | number | null> = {};
    if (filterClusterId) paramsToKeep.clusterId = filterClusterId;
    if (parentClusterName) paramsToKeep.clusterName = parentClusterName;
    if (parentCenterName) paramsToKeep.centerName = parentCenterName;
    router.push(`/dashboard/small-groups${Object.keys(paramsToKeep).length > 0 ? `?${new URLSearchParams(paramsToKeep as Record<string,string>).toString()}` : ""}`);
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
    router.push(`/dashboard/small-groups?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams({ page })
  }

  if (!user && !isLoading) {
    return <p>Loading user data or user not authenticated...</p>;
  }

  const canViewPage = user ? checkPermission(user, ["GLOBAL_ADMIN", "CENTER_ADMIN", "CLUSTER_LEADER", "SMALL_GROUP_LEADER"]) : false;
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
        <h1 className="text-3xl font-bold tracking-tight">Small Groups {parentClusterName ? `(in ${parentClusterName})` : ""}</h1>
        {canCreateSmallGroup && (
          <Button asChild>
            <Link href={`/dashboard/small-groups/new${filterClusterId ? `?clusterId=${filterClusterId}${parentClusterName ? `&clusterName=${encodeURIComponent(parentClusterName)}` : ""}${parentCenterName ? `&centerName=${encodeURIComponent(parentCenterName)}` : ""}` : ""}`}>
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
            {canCreateSmallGroup && <Button onClick={() => router.push(`/dashboard/small-groups/new${filterClusterId ? `?clusterId=${filterClusterId}${parentClusterName ? `&clusterName=${encodeURIComponent(parentClusterName)}` : ""}${parentCenterName ? `&centerName=${encodeURIComponent(parentCenterName)}` : ""}` : ""}`)}>Create Small Group</Button>}
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
                    <Link href={`/dashboard/small-groups/${group._id}?clusterName=${encodeURIComponent(group.clusterId?.name || parentClusterName || "")}&centerName=${encodeURIComponent(group.clusterId?.centerId?.name || parentCenterName || "")}`}>
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


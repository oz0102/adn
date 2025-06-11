"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/lib/client/components/ui/card"
import { Button } from "@/lib/client/components/ui/button"
import { Input } from "@/lib/client/components/ui/input"
import { Pagination } from "@/lib/client/components/ui/pagination"
import { Badge } from "@/lib/client/components/ui/badge"
import {
  Search,
  Plus,
  ChevronRight,
  X,
  Users as UsersIcon,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowLeft
} from "lucide-react"
<<<<<<< HEAD
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
=======
import { Avatar, AvatarFallback } from "@/lib/client/components/ui/avatar"
import { useToast } from "@/lib/client/hooks/use-toast"
>>>>>>> feature/comprehensive-restructure-and-attendees
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"
import { ICenter } from "@/models/center"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


interface SmallGroup {
  _id: string
  groupId: string
  name: string
  clusterId?: {
    _id: string
    name: string
    // centerId is not needed here as we are already in a center context
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

interface Cluster { // For filter dropdown
  _id: string;
  name: string;
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function CenterSmallGroupsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const centerIdFromUrl = params.centerId as string;

  const { toast } = useToast()
  const { user } = useAuthStore()

  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([])
  const [center, setCenter] = useState<ICenter | null>(null);
  const [clustersForFilter, setClustersForFilter] = useState<Cluster[]>([]); // Clusters within this center
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClusterId, setFilterClusterId] = useState<string>("") // Specific cluster within this center

  const [canViewPage, setCanViewPage] = useState(false);
  const [canCreateSmallGroup, setCanCreateSmallGroup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenterDetails = useCallback(async () => {
    if (!centerIdFromUrl) return;
    try {
      const response = await fetch(`/api/centers/${centerIdFromUrl}`);
      if(!response.ok) throw new Error("Failed to fetch center details");
      const data = await response.json();
      setCenter(data.center);
    } catch (err) {
      console.error("Error fetching center details:", err);
      toast({ title: "Error", description: "Could not load center details.", variant: "destructive" });
    }
  }, [centerIdFromUrl, toast]);

  useEffect(() => {
    const checkPagePermissionAndFetchInitialData = async () => {
        if (user && centerIdFromUrl) {
            const hasPermission = await checkPermission(user, "GLOBAL_ADMIN") || await checkPermission(user, "CENTER_ADMIN", { centerId: centerIdFromUrl });
            setCanViewPage(hasPermission);
            const hasCreatePermission = await checkPermission(user, "GLOBAL_ADMIN") ||
                                        await checkPermission(user, "CENTER_ADMIN", { centerId: centerIdFromUrl }) ||
                                        await checkPermission(user, "CLUSTER_LEADER"); // Cluster leaders of this center can create
            setCanCreateSmallGroup(hasCreatePermission);

            if (!hasPermission) {
                setError("You do not have permission to view small groups for this center.");
                setIsLoading(false);
            } else {
                fetchCenterDetails();
                 // Fetch clusters for this center for filtering
                try {
                    const clustersResponse = await fetch(`/api/clusters?centerId=${centerIdFromUrl}`);
                    if(clustersResponse.ok) {
                        const clustersData = await clustersResponse.json();
                        setClustersForFilter(clustersData.clusters || clustersData.data?.clusters || []);
                    } else {
                         toast({ title: "Error", description: "Failed to load clusters for filtering.", variant: "destructive" });
                    }
                } catch (err) {
                     toast({ title: "Error", description: "Failed to load clusters for filtering.", variant: "destructive" });
                }
            }
        } else if (!user) {
            setIsLoading(true);
        }
    };
    checkPagePermissionAndFetchInitialData();
  }, [user, centerIdFromUrl, fetchCenterDetails, toast]);


  const fetchSmallGroups = useCallback(async (
    page: number,
    search: string,
    clusterIdParam?: string // clusterId specific to this center's clusters
  ) => {
    if (!centerIdFromUrl || !canViewPage) {
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", pagination.limit.toString())
      queryParams.append("centerId", centerIdFromUrl); // Always filter by centerId from URL

      if (search) queryParams.append("search", search)
      if (clusterIdParam) queryParams.append("clusterId", clusterIdParam)

      const response = await fetch(`/api/small-groups?${queryParams.toString()}`)
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch small groups. Status: ${response.status}`)
      }
      const data = await response.json()
      setSmallGroups(data.smallGroups || data.data?.smallGroups || [])
      setPagination(data.paginationInfo || { page, limit: pagination.limit, total: 0, pages: 0 })
      setError(null);
    } catch (error: any) {
      console.error("Error fetching small groups:", error)
      setError(error.message || "Failed to load small groups.");
      toast({ title: "Error", description: error.message || "Failed to load small groups data.", variant: "destructive" })
      setSmallGroups([]);
      setPagination({ page, limit: pagination.limit, total: 0, pages: 0 });
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, toast, centerIdFromUrl, canViewPage])

  useEffect(() => {
    if(canViewPage && centerIdFromUrl){
        const page = parseInt(searchParams.get("page") || "1")
        const search = searchParams.get("search") || ""
        const clusterIdFromQuery = searchParams.get("clusterId") || "" // This is for filtering within the center

        setSearchTerm(search)
        setFilterClusterId(clusterIdFromQuery)
        fetchSmallGroups(page, search, clusterIdFromQuery)
    }
  }, [searchParams, canViewPage, centerIdFromUrl, fetchSmallGroups])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchTerm, page: 1 })
  }

  const handleClusterFilterChange = (value: string) => {
    const actualValue = value === "all" ? "" : value;
    setFilterClusterId(actualValue);
    updateUrlParams({ clusterId: actualValue, page: 1 });
  };

  const clearFilters = () => {
    setSearchTerm("")
    setFilterClusterId("")
    router.push(`/centers/${centerIdFromUrl}/dashboard/small-groups`)
  }

  const updateUrlParams = (paramsToUpdate: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") newParams.set(key, value.toString())
      else newParams.delete(key)
    })
    router.push(`/centers/${centerIdFromUrl}/dashboard/small-groups?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => updateUrlParams({ page });
  const getSelectValue = (value: string) => value || "all";

  if (isLoading && !error && !smallGroups.length) return <div className="container mx-auto py-6 text-center"><p>Loading small groups...</p></div>;

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
         <Button onClick={() => router.push(`/centers/${centerIdFromUrl}/dashboard`)} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Center Dashboard
        </Button>
      </div>
    );
  }

  if (!canViewPage && !isLoading) {
     return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view small groups for this center.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Small Groups for {center?.name || `Center`}</h1>
        {canCreateSmallGroup && (
          <Button asChild>
            {/* Pass centerId and potentially selected clusterId to the new small group page */}
            <Link href={`/dashboard/small-groups/new?centerId=${centerIdFromUrl}${filterClusterId ? `&clusterId=${filterClusterId}` : ""}`}>
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
              <Input type="search" placeholder="Search small groups..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button type="submit">Search</Button>
          </form>
          <div className="flex items-center gap-2">
            <Select value={getSelectValue(filterClusterId)} onValueChange={handleClusterFilterChange} disabled={clustersForFilter.length === 0}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Cluster" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clusters in Center</SelectItem>
                {clustersForFilter.map((cluster) => (<SelectItem key={cluster._id} value={cluster._id}>{cluster.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters"><X className="h-4 w-4" /></Button>
          </div>
        </div>

        {isLoading && smallGroups.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => ( <Card key={i} className="animate-pulse"><CardHeader className="h-20 bg-gray-100 dark:bg-gray-800"></CardHeader><CardContent className="pt-4"><div className="h-6 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mb-3"></div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded mb-1"></div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div></CardContent><CardFooter><div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-full"></div></CardFooter></Card>))}
          </div>
        ) : !isLoading && smallGroups.length === 0 ? (
          <div className="text-center py-10"><UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" /><h3 className="text-lg font-medium mb-2">No Small Groups Found</h3><p className="text-gray-500 mb-4">There are no small groups for this center matching your criteria.</p>
            {canCreateSmallGroup && <Button onClick={() => router.push(`/dashboard/small-groups/new?centerId=${centerIdFromUrl}${filterClusterId ? `&clusterId=${filterClusterId}` : ""}`)}>Create Small Group</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {smallGroups.map((group) => (
              <Card key={group._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start"><Badge variant="outline" className="w-fit mb-2">{group.groupId}</Badge>{group.clusterId && <Badge variant="secondary" className="text-xs">{group.clusterId.name}</Badge>}</div>
                  <CardTitle>{group.name}</CardTitle>
                  {group.description && <CardDescription className="line-clamp-2">{group.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {group.location && (<div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-500" /><span className="text-sm">{group.location}</span></div>)}
                  {group.meetingSchedule && (<div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /><span className="text-sm">{group.meetingSchedule.day}s at {group.meetingSchedule.time} ({group.meetingSchedule.frequency})</span></div>)}
                  <div className="flex items-center gap-2"><UsersIcon className="h-4 w-4 text-gray-500" /><span className="text-sm">{group.memberCount || 0} members</span></div>
                  {group.leaderId && (<div><h4 className="text-sm font-medium mb-1">Leader</h4><div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback>{getInitials(group.leaderId.firstName, group.leaderId.lastName)}</AvatarFallback></Avatar><span className="text-sm">{group.leaderId.firstName} {group.leaderId.lastName}</span></div></div>)}
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    {/* Links to global small group detail page */}
                    <Link href={`/dashboard/small-groups/${group._id}?centerId=${centerIdFromUrl}&clusterId=${group.clusterId?._id}`}>
                      <span>View Group</span><ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {pagination.pages > 1 && !isLoading && (<Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange}/>)}
      </div>
    </div>
  )
}

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
  AlertTriangle,
  ArrowLeft
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"
import { ICluster } from "@/models/cluster" // For cluster name and centerId
import { apiClient } from "@/lib/api-client"

interface SmallGroup {
  _id: string
  groupId: string
  name: string
  // clusterId is implicit from the page context
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

export default function ClusterSmallGroupsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const clusterIdFromUrl = params.clusterId as string;

  const { toast } = useToast()
  const { user } = useAuthStore()

  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([])
  const [cluster, setCluster] = useState<ICluster | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  // No more specific filters like clusterId needed here, page is already scoped.
  // Other filters (e.g. by leader, by day) could be added if needed.

  const [canViewPage, setCanViewPage] = useState(false);
  const [canCreateSmallGroup, setCanCreateSmallGroupInCluster] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClusterDetails = useCallback(async () => {
    if (!clusterIdFromUrl) return;
    try {
      const response = await apiClient.get<{ cluster: ICluster }>(`/clusters/${clusterIdFromUrl}`);
      setCluster(response.cluster);
    } catch (err) {
      console.error("Error fetching cluster details:", err);
      toast({ title: "Error", description: "Could not load cluster details.", variant: "destructive" });
    }
  }, [clusterIdFromUrl, toast]);

  useEffect(() => {
    const checkPagePermissionAndFetchInitialData = async () => {
        if (user && clusterIdFromUrl) {
            // Permission: Global Admin, or Cluster Leader for this specific cluster,
            // or Center Admin of the center this cluster belongs to.
            // The CLUSTER_LEADER check needs the cluster's centerId if your checkPermission requires it.
            // Fetching cluster first to get centerId for more precise CENTER_ADMIN check.
            let tempClusterData: ICluster | null = null;
            try {
                const clusterRes = await apiClient.get<{ cluster: ICluster }>(`/clusters/${clusterIdFromUrl}`);
                tempClusterData = clusterRes.cluster;
                setCluster(tempClusterData); // Set cluster data early
            } catch (err) {
                 setError("Failed to fetch cluster details for permission check.");
                 setIsLoading(false);
                 return;
            }

            const globalAdmin = await checkPermission(user, "GLOBAL_ADMIN");
            const clusterLeader = await checkPermission(user, "CLUSTER_LEADER", { clusterId: clusterIdFromUrl, centerId: tempClusterData?.centerId?.toString() });
            const centerAdmin = tempClusterData?.centerId ? await checkPermission(user, "CENTER_ADMIN", { centerId: tempClusterData.centerId.toString() }) : false;

            const hasPermission = globalAdmin || clusterLeader || centerAdmin;
            setCanViewPage(hasPermission);
            setCanCreateSmallGroupInCluster(hasPermission); // Same permission for creating within this cluster

            if (!hasPermission) {
                setError("You do not have permission to view small groups for this cluster.");
            }
            setIsLoading(false); // Initial permission and cluster detail fetch done
        } else if (!user) {
            setIsLoading(true);
        }
    };
    checkPagePermissionAndFetchInitialData();
  }, [user, clusterIdFromUrl, toast]);


  const fetchSmallGroups = useCallback(async (page: number, search: string) => {
    if (!clusterIdFromUrl || !canViewPage) {
        setIsLoading(false); // Ensure loading stops if no permission
        return;
    }
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", pagination.limit.toString())
      queryParams.append("clusterId", clusterIdFromUrl); // Always filter by clusterId from URL

      if (search) queryParams.append("search", search)

      const response = await apiClient.get<{ smallGroups: SmallGroup[], paginationInfo: PaginationInfo }>(`/small-groups?${queryParams.toString()}`)
      setSmallGroups(response.smallGroups || [])
      setPagination(response.paginationInfo || { page, limit: pagination.limit, total: 0, pages: 0 })
      setError(null);
    } catch (error: any) {
      console.error("Error fetching small groups:", error)
      setError(error.message || "Failed to load small groups data.");
      toast({ title: "Error", description: error.message || "Failed to load small groups data.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, toast, clusterIdFromUrl, canViewPage])

  useEffect(() => {
    if(canViewPage && clusterIdFromUrl){
        const page = parseInt(searchParams.get("page") || "1")
        const search = searchParams.get("search") || ""
        setSearchTerm(search)
        fetchSmallGroups(page, search)
    }
  }, [searchParams, canViewPage, clusterIdFromUrl, fetchSmallGroups])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchTerm, page: 1 })
  }

  const clearFilters = () => {
    setSearchTerm("")
    router.push(`/clusters/${clusterIdFromUrl}/dashboard/small-groups`)
  }

  const updateUrlParams = (paramsToUpdate: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") newParams.set(key, value.toString())
      else newParams.delete(key)
    })
    router.push(`/clusters/${clusterIdFromUrl}/dashboard/small-groups?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => updateUrlParams({ page });

  if (isLoading && !error && !smallGroups.length) return <div className="container mx-auto py-6 text-center"><p>Loading small groups...</p></div>;

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
         <Button onClick={() => router.push(cluster?.centerId ? `/centers/${cluster.centerId.toString()}/dashboard/clusters` : '/dashboard/clusters')} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  if (!canViewPage && !isLoading) {
     return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view small groups for this cluster.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Small Groups in {cluster?.name || `Cluster ${clusterIdFromUrl}`}</h1>
        {canCreateSmallGroup && (
          <Button asChild>
            <Link href={`/dashboard/small-groups/new?clusterId=${clusterIdFromUrl}${cluster?.centerId ? `&centerId=${(cluster.centerId as any)._id || cluster.centerId.toString()}` : ''}`}>
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
          {(searchTerm) && (<Button variant="outline" size="icon" onClick={clearFilters} title="Clear search"><X className="h-4 w-4" /></Button>)}
        </div>

        {isLoading && smallGroups.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => ( <Card key={i} className="animate-pulse"><CardHeader className="h-20 bg-gray-100 dark:bg-gray-800"></CardHeader><CardContent className="pt-4"><div className="h-6 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mb-3"></div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded mb-1"></div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div></CardContent><CardFooter><div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-full"></div></CardFooter></Card>))}
          </div>
        ) : !isLoading && smallGroups.length === 0 ? (
          <div className="text-center py-10"><UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" /><h3 className="text-lg font-medium mb-2">No Small Groups Found</h3><p className="text-gray-500 mb-4">There are no small groups in this cluster matching your criteria.</p>
            {canCreateSmallGroup && <Button onClick={() => router.push(`/dashboard/small-groups/new?clusterId=${clusterIdFromUrl}${cluster?.centerId ? `&centerId=${(cluster.centerId as any)._id || cluster.centerId.toString()}` : ''}`)}>Create Small Group</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {smallGroups.map((group) => (
              <Card key={group._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start"><Badge variant="outline" className="w-fit mb-2">{group.groupId}</Badge></div>
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
                    {/* Links to global small group detail page, passing cluster and center context for breadcrumbs/back nav */}
                    <Link href={`/dashboard/small-groups/${group._id}?clusterId=${clusterIdFromUrl}&centerId=${cluster?.centerId ? ((cluster.centerId as any)._id || cluster.centerId.toString()) : ''}`}>
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

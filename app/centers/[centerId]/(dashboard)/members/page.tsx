"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, useParams } from "next/navigation" // Added useParams
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/lib/client/components/ui/badge"
import { Search, Plus, ChevronRight, X, AlertTriangleIcon } from "lucide-react" // Added AlertTriangleIcon
import { useToast } from "@/lib/client/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store" // Added for permissions
import { checkPermission } from "@/lib/permissions" // Added for permissions
import { ICenter } from "@/models/center" // For center name

interface Member {
  _id: string
  memberId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  gender: string
  clusterId?: {
    _id: string
    name: string
  }
  smallGroupId?: {
    _id: string
    name: string
  }
}

interface Cluster {
  _id: string
  name: string
}

interface SmallGroup {
  _id: string
  name: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function CenterMembersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams() // Use useParams to get centerId from route
  const centerIdFromUrl = params.centerId as string;

  const { toast } = useToast()
  const { user } = useAuthStore();

  const [members, setMembers] = useState<Member[]>([])
  const [center, setCenter] = useState<ICenter | null>(null);
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    clusterId: "",
    smallGroupId: "",
    gender: "",
  })
  const [canViewMembers, setCanViewMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchCenterDetails = useCallback(async () => {
    if (!centerIdFromUrl) return;
    try {
      // Assuming you have an apiClient similar to other pages
      const response = await fetch(`/api/centers/${centerIdFromUrl}`);
      if(!response.ok) throw new Error("Failed to fetch center details");
      const data = await response.json();
      setCenter(data.center);
    } catch (err) {
      console.error("Error fetching center details:", err);
      toast({ title: "Error", description: "Could not load center details.", variant: "destructive" });
    }
  }, [centerIdFromUrl, toast]);

  // Fetch clusters and small groups specific to this center
  useEffect(() => {
    if (!centerIdFromUrl || !canViewMembers) return;

    const fetchFiltersData = async () => {
      try {
        const [clustersResponse, smallGroupsResponse] = await Promise.all([
          fetch(`/api/clusters?centerId=${centerIdFromUrl}`), // Filter by centerId
          fetch(`/api/small-groups?centerId=${centerIdFromUrl}`) // Filter by centerId
        ]);

        if (clustersResponse.ok) {
          const clustersData = await clustersResponse.json();
          // Assuming API returns { clusters: Cluster[] } or similar structure
          setClusters(clustersData.clusters || clustersData.data?.clusters || []);
        }
         if (smallGroupsResponse.ok) {
          const smallGroupsData = await smallGroupsResponse.json();
          setSmallGroups(smallGroupsData.smallGroups || smallGroupsData.data?.smallGroups || []);
        }
      } catch (error) {
        console.error("Error fetching filters data for center:", error);
        toast({ title: "Error", description: "Failed to load filter options.", variant: "destructive" });
      }
    };

    fetchFiltersData();
  }, [centerIdFromUrl, canViewMembers, toast]);

  const fetchMembers = useCallback(async (
    page: number,
    search: string,
    clusterId: string,
    smallGroupId: string,
    gender: string
  ) => {
    if (!centerIdFromUrl || !canViewMembers) {
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", "10")
      queryParams.append("centerId", centerIdFromUrl); // Always filter by centerId from URL

      if (search) queryParams.append("search", search)
      if (clusterId) queryParams.append("clusterId", clusterId)
      if (smallGroupId) queryParams.append("smallGroupId", smallGroupId)
      if (gender) queryParams.append("gender", gender)

      const response = await fetch(`/api/members?${queryParams.toString()}`)

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch members');
      }

      const data = await response.json()

      // Assuming API returns { success: boolean, data: { members: [], pagination: {}}}
      // Adjust based on your actual API response structure
      setMembers(data.data?.members || data.members || [])
      setPagination(data.pagination || {
        page,
        limit: 10,
        total: data.data?.members?.length || data.members?.length || 0,
        pages: Math.ceil((data.data?.members?.length || data.members?.length || 0) / 10)
      })
      setError(null);
    } catch (error: any) {
      console.error("Error fetching members:", error)
      setError(error.message || "Failed to load members data.");
      toast({
        title: "Error",
        description: error.message || "Failed to load members data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [centerIdFromUrl, toast, canViewMembers])


  useEffect(() => {
    const checkPagePermission = async () => {
        if (user && centerIdFromUrl) {
            const hasPermission = await checkPermission(user, "GLOBAL_ADMIN") || await checkPermission(user, "CENTER_ADMIN", { centerId: centerIdFromUrl });
            setCanViewMembers(hasPermission);
            if (!hasPermission) {
                setError("You do not have permission to view members for this center.");
                setIsLoading(false);
            } else {
                fetchCenterDetails(); // Fetch center name if permission is granted
            }
        } else if (!user) {
            setIsLoading(true); // Still waiting for user session
        }
    };
    checkPagePermission();
  }, [user, centerIdFromUrl, fetchCenterDetails]);


  useEffect(() => {
    if(canViewMembers) {
        const page = parseInt(searchParams.get("page") || "1")
        const search = searchParams.get("search") || ""
        const clusterId = searchParams.get("clusterId") || ""
        const smallGroupId = searchParams.get("smallGroupId") || ""
        const gender = searchParams.get("gender") || ""

        setSearchTerm(search)
        setFilters({ clusterId, smallGroupId, gender })
        fetchMembers(page, search, clusterId, smallGroupId, gender)
    }
  }, [searchParams, fetchMembers, canViewMembers]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchTerm, page: 1 })
  }

  const handleFilterChange = (key: string, value: string) => {
    const actualValue = value === "all" ? "" : value
    setFilters(prev => ({ ...prev, [key]: actualValue }))
    if (value === "all") {
      const newParams = new URLSearchParams(searchParams.toString())
      newParams.delete(key)
      newParams.set("page", "1")
      router.push(`/centers/${centerIdFromUrl}/dashboard/members?${newParams.toString()}`)
    } else {
      updateUrlParams({ [key]: value, page: 1 })
    }
  }

  const clearFilters = () => {
    setFilters({ clusterId: "", smallGroupId: "", gender: "" })
    setSearchTerm("")
    router.push(`/centers/${centerIdFromUrl}/dashboard/members`)
  }

  const updateUrlParams = (paramsToUpdate: Record<string, string | number | boolean | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value) newParams.set(key, value.toString())
      else newParams.delete(key)
    })
    router.push(`/centers/${centerIdFromUrl}/dashboard/members?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams({ page })
  }

  const getSelectValue = (value: string) => value || "all";

  if (isLoading && !error && !members.length) { // Show loading only if no error and no data yet
    return <div className="container mx-auto py-6 text-center"><p>Loading members...</p></div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
         <Button onClick={() => router.push('/dashboard')} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Global Dashboard
        </Button>
      </div>
    );
  }

  if (!canViewMembers && !isLoading) { // After loading, if still no permission
     return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view members for this center.</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Members for {center?.name || `Center ${centerIdFromUrl}`}</h1>
        <Button asChild>
          {/* Pass centerId to the new member page */}
          <Link href={`/dashboard/members/new?centerId=${centerIdFromUrl}`}>
            <Plus className="mr-2 h-4 w-4" /> Add Member
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Member Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search by name, email, or phone..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>

              <div className="flex items-center gap-2">
                <Select
                  value={getSelectValue(filters.clusterId)}
                  onValueChange={(value) => handleFilterChange("clusterId", value)}
                  disabled={clusters.length === 0}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clusters</SelectItem>
                    {clusters.map((cluster) => (
                      <SelectItem key={cluster._id} value={cluster._id}>
                        {cluster.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={getSelectValue(filters.smallGroupId)}
                  onValueChange={(value) => handleFilterChange("smallGroupId", value)}
                  disabled={smallGroups.length === 0}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Small Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Small Groups</SelectItem>
                    {smallGroups.map((group) => (
                      <SelectItem key={group._id} value={group._id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={getSelectValue(filters.gender)}
                  onValueChange={(value) => handleFilterChange("gender", value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genders</SelectItem>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>

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

            {(searchTerm || filters.clusterId || filters.smallGroupId || filters.gender) && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchTerm}
                    <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => { setSearchTerm(""); updateUrlParams({ search: "" }); }}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {filters.clusterId && (<Badge variant="secondary" className="flex items-center gap-1">Cluster: {clusters.find(c => c._id === filters.clusterId)?.name}<Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => handleFilterChange("clusterId", "all")}><X className="h-3 w-3" /></Button></Badge>)}
                {filters.smallGroupId && (<Badge variant="secondary" className="flex items-center gap-1">Small Group: {smallGroups.find(g => g._id === filters.smallGroupId)?.name}<Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => handleFilterChange("smallGroupId", "all")}><X className="h-3 w-3" /></Button></Badge>)}
                {filters.gender && (<Badge variant="secondary" className="flex items-center gap-1">Gender: {filters.gender}<Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => handleFilterChange("gender", "all")}><X className="h-3 w-3" /></Button></Badge>)}
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Cluster</TableHead><TableHead>Small Group</TableHead><TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && members.length === 0 ? ( <TableRow><TableCell colSpan={6} className="text-center py-10">Loading members...</TableCell></TableRow>) :
                   !isLoading && members.length === 0 ? ( <TableRow><TableCell colSpan={6} className="text-center py-10">No members found. Try adjusting your search or filters.</TableCell></TableRow>) :
                   (members.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell className="font-medium">{member.memberId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(member.firstName, member.lastName)}</AvatarFallback></Avatar>
                            <div><p className="font-medium">{member.firstName} {member.lastName}</p><p className="text-sm text-gray-500">{member.gender}</p></div>
                          </div>
                        </TableCell>
                        <TableCell><div><p>{member.email}</p><p className="text-sm text-gray-500">{member.phoneNumber}</p></div></TableCell>
                        <TableCell>{member.clusterId ? (<Badge variant="outline">{member.clusterId.name}</Badge>) : (<span className="text-gray-500 text-sm">Not assigned</span>)}</TableCell>
                        <TableCell>{member.smallGroupId ? (<Badge variant="outline">{member.smallGroupId.name}</Badge>) : (<span className="text-gray-500 text-sm">Not assigned</span>)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              {/* Links to global member detail page */}
                              <Link href={`/dashboard/members/${member._id}`}>
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )))}
                </TableBody>
              </Table>
            </div>

            <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

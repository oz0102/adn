"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, ChevronRight, X, AlertTriangleIcon, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"
import { ICluster } from "@/models/cluster"
import { apiClient } from "@/lib/api-client"

interface Member {
  _id: string; memberId: string; firstName: string; lastName: string; email: string;
  phoneNumber: string; gender: string;
  clusterId?: { _id: string; name: string }; // Should match current cluster
  smallGroupId?: { _id: string; name: string };
}
interface SmallGroup { _id: string; name: string; } // For filter
interface PaginationInfo { page: number; limit: number; total: number; pages: number; }

export default function ClusterMembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const clusterIdFromUrl = params.clusterId as string;

  const { toast } = useToast();
  const { user } = useAuthStore();

  const [members, setMembers] = useState<Member[]>([]);
  const [cluster, setCluster] = useState<ICluster | null>(null);
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([]); // Small groups within this cluster
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ smallGroupId: "", gender: "" });

  const [canViewPage, setCanViewPage] = useState(false);
  const [canCreateMember, setCanCreateMember] = useState(false);
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
    const checkPagePermissionAndFetchData = async () => {
      if (user && clusterIdFromUrl) {
        // Fetch cluster details first to get centerId for more accurate permission check if needed
        let tempClusterData: ICluster | null = null;
        try {
            const clusterRes = await apiClient.get<{ cluster: ICluster }>(`/clusters/${clusterIdFromUrl}`);
            tempClusterData = clusterRes.cluster;
            setCluster(tempClusterData);
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
        setCanCreateMember(hasPermission); // Assuming same permission for creating members in this cluster

        if (hasPermission) {
          // Fetch Small Groups for this cluster for filtering
          try {
            const sgResponse = await apiClient.get<{ smallGroups: SmallGroup[] }>(`/small-groups?clusterId=${clusterIdFromUrl}`);
            setSmallGroups(sgResponse.smallGroups || []);
          } catch (err) {
            toast({ title: "Error", description: "Failed to load small groups for filtering.", variant: "destructive" });
          }
        } else {
          setError("You do not have permission to view members for this cluster.");
        }
        setIsLoading(false); // Initial permission and cluster detail fetch done
      } else if(!user) {
        setIsLoading(true);
      }
    };
    checkPagePermissionAndFetchData();
  }, [user, clusterIdFromUrl, toast]);

  const fetchMembers = useCallback(async (page: number, search: string, smallGroupId: string, gender: string) => {
    if (!clusterIdFromUrl || !canViewPage) {
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", "10");
      queryParams.append("clusterId", clusterIdFromUrl); // Always filter by clusterId from URL

      if (search) queryParams.append("search", search);
      if (smallGroupId) queryParams.append("smallGroupId", smallGroupId);
      if (gender) queryParams.append("gender", gender);

      const response = await apiClient.get<{ data: { members: Member[] }, pagination: PaginationInfo }>(`/members?${queryParams.toString()}`);
      setMembers(response.data?.members || []);
      setPagination(response.pagination || { page, limit: 10, total: 0, pages: 0 });
      setError(null);
    } catch (error: any) {
      setError(error.message || "Failed to load members data.");
      toast({ title: "Error", description: error.message || "Failed to load members data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [clusterIdFromUrl, toast, canViewPage]);

  useEffect(() => {
    if(canViewPage && clusterIdFromUrl){
        const page = parseInt(searchParams.get("page") || "1");
        const search = searchParams.get("search") || "";
        const smallGroupId = searchParams.get("smallGroupId") || "";
        const gender = searchParams.get("gender") || "";

        setSearchTerm(search);
        setFilters({ smallGroupId, gender }); // Removed clusterId from local filters
        fetchMembers(page, search, smallGroupId, gender);
    }
  }, [searchParams, fetchMembers, canViewPage, clusterIdFromUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchTerm, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    const actualValue = value === "all" ? "" : value;
    setFilters(prev => ({ ...prev, [key]: actualValue }));
    updateUrlParams({ [key]: actualValue, page: 1 });
  };

  const clearFilters = () => {
    setFilters({ smallGroupId: "", gender: "" });
    setSearchTerm("");
    router.push(`/clusters/${clusterIdFromUrl}/dashboard/members`);
  };

  const updateUrlParams = (paramsToUpdate: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") newParams.set(key, value.toString());
      else newParams.delete(key);
    });
    router.push(`/clusters/${clusterIdFromUrl}/dashboard/members?${newParams.toString()}`);
  };

  const handlePageChange = (page: number) => updateUrlParams({ page });
  const getSelectValue = (value: string) => value || "all";

  if (isLoading && !error && !members.length) return <div className="container mx-auto py-6 text-center"><p>Loading members...</p></div>;

  if (error) {
    return ( <div className="container mx-auto py-10 text-center"> <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" /> <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2> <p className="text-muted-foreground">{error}</p> <Button onClick={() => router.push(cluster?.centerId ? `/centers/${cluster.centerId.toString()}/dashboard/clusters` : '/dashboard/clusters')} variant="outline" className="mt-4"> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Button> </div>);
  }
  if (!canViewPage && !isLoading) {
     return ( <div className="container mx-auto py-10 text-center"> <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" /> <h2 className="text-xl font-semibold mb-2">Access Denied</h2> <p className="text-muted-foreground">You do not have permission to view members for this cluster.</p> </div>);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Members in {cluster?.name || `Cluster ${clusterIdFromUrl}`}</h1>
        {canCreateMember && (
          <Button asChild>
            <Link href={`/dashboard/members/new?clusterId=${clusterIdFromUrl}${cluster?.centerId ? `&centerId=${(cluster.centerId as any)._id || cluster.centerId.toString()}` : ''}`}>
              <Plus className="mr-2 h-4 w-4" /> Add Member
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle>Member Directory</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input type="search" placeholder="Search by name, email, or phone..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button type="submit">Search</Button>
              </form>
              <div className="flex items-center gap-2">
                <Select value={getSelectValue(filters.smallGroupId)} onValueChange={(value) => handleFilterChange("smallGroupId", value)} disabled={smallGroups.length === 0}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Small Group" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Small Groups</SelectItem>{smallGroups.map((group) => (<SelectItem key={group._id} value={group._id}>{group.name}</SelectItem>))}</SelectContent>
                </Select>
                <Select value={getSelectValue(filters.gender)} onValueChange={(value) => handleFilterChange("gender", value)}>
                  <SelectTrigger className="w-[120px]"><SelectValue placeholder="Gender" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Genders</SelectItem><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters"><X className="h-4 w-4" /></Button>
              </div>
            </div>

            {(searchTerm || filters.smallGroupId || filters.gender) && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (<Badge variant="secondary" className="flex items-center gap-1">Search: {searchTerm}<Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => { setSearchTerm(""); updateUrlParams({ search: null });}}><X className="h-3 w-3" /></Button></Badge>)}
                {filters.smallGroupId && (<Badge variant="secondary" className="flex items-center gap-1">Small Group: {smallGroups.find(g => g._id === filters.smallGroupId)?.name}<Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => handleFilterChange("smallGroupId", "all")}><X className="h-3 w-3" /></Button></Badge>)}
                {filters.gender && (<Badge variant="secondary" className="flex items-center gap-1">Gender: {filters.gender}<Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => handleFilterChange("gender", "all")}><X className="h-3 w-3" /></Button></Badge>)}
              </div>
            )}

            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Contact</TableHead><TableHead>Small Group</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading && members.length === 0 ? ( <TableRow><TableCell colSpan={5} className="text-center py-10">Loading members...</TableCell></TableRow>) :
                   !isLoading && members.length === 0 ? ( <TableRow><TableCell colSpan={5} className="text-center py-10">No members found in this cluster. Try adjusting filters.</TableCell></TableRow>) :
                   (members.map((member) => (
                      <TableRow key={member._id}>
                        <TableCell className="font-medium">{member.memberId}</TableCell>
                        <TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarFallback>{getInitials(member.firstName, member.lastName)}</AvatarFallback></Avatar><div><p className="font-medium">{member.firstName} {member.lastName}</p><p className="text-sm text-gray-500">{member.gender}</p></div></div></TableCell>
                        <TableCell><div><p>{member.email}</p><p className="text-sm text-gray-500">{member.phoneNumber}</p></div></TableCell>
                        <TableCell>{member.smallGroupId ? (<Badge variant="outline">{member.smallGroupId.name}</Badge>) : (<span className="text-gray-500 text-sm">Not assigned</span>)}</TableCell>
                        <TableCell><div className="flex items-center gap-2"><Button variant="ghost" size="icon" asChild><Link href={`/dashboard/members/${member._id}?clusterId=${clusterIdFromUrl}`}><ChevronRight className="h-4 w-4" /></Link></Button></div></TableCell>
                      </TableRow>
                    )))}
                </TableBody>
              </Table>
            </div>
            {pagination.pages > 1 && !isLoading && (<Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange}/>)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

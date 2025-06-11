"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/lib/client/components/ui/table";
import { Button } from "@/lib/client/components/ui/button";
import { Input } from "@/lib/client/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/lib/client/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/client/components/ui/card";
import { Avatar, AvatarFallback } from "@/lib/client/components/ui/avatar";
import { Pagination } from "@/lib/client/components/ui/pagination";
import { Badge } from "@/lib/client/components/ui/badge";
import {
  Search, Plus, ChevronRight, X, Mail, Phone,
  Calendar, AlertCircle, CheckCircle, XCircle, Clock, AlertTriangleIcon, ArrowLeft
} from "lucide-react";

import { useToast } from "@/lib/client/hooks/use-toast";
import { formatDate, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { checkPermission } from "@/lib/permissions";
import { ICluster } from "@/models/cluster";
import { apiClient } from "@/lib/client/api/api-client";

// WhatsApp Icon Component
const WhatsAppIcon = ({ className = "h-4 w-4" }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor"> <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" /> <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.695 1.447h.005c9.975 0 16.944-9.95 13.467-17.949-1.382-3.254-4.363-5.505-8.453-6.146C9.337-.329 3.708 2.868 1.364 8.93.359 11.177-.22 13.697.12 16.205c.124.895.33 1.77.572 2.625.493 1.73 2.283 1.03 2.773-.857.087-.334.167-.67.248-1.015.344-1.437-.24-1.68-1.223-2.647-.655-.642-.908-1.678-.543-2.647 2.611-6.9 12.25-7.836 17.622-2.399 2.91 2.94 2.84 9.042-.15 11.79-1.54 1.432-3.962.574-4.258-1.334-.203-1.297.27-2.588.774-3.906.283-.686.159-1.695-.15-2.094-.437-.462-1.13-.284-1.72-.076a10.8 10.8 0 0 0-2.935 1.574c-.947.673-1.946 1.324-2.698 2.229-.732.872-1.162 2.063-1.947 2.96-.49.559-1.248 1.348-1.986 1.613-.12.043-.21.074-.3.114-.82.403-1.27.36-1.402.24-.625-.547-.748-2.364-.748-2.364.943-5.309 8-4.27 10.949-2.341.217.145.447.313.68.495 1.088.856 2.13 1.77 2.419 3.136.275 1.296.26 2.612.065 3.038.977 1.605 1.55 2.708 1.55 4.35 0 5.356-5.244 9.78-11.663 9.78-2.068 0-4.077-.54-5.848-1.557L0 23.956l3.92-1.018a12.027 12.027 0 0 1-1.386-1.7c-3.858-6.144 1.006-13.324 3.205-15.36 1.222-1.128 5.907-4.197 10.463-2.913 5.75 1.62 7.88 5.04 8.015 9.992.184 6.637-5.394 9.548-5.758 9.777-.364.228-1.105.254-1.83-.35-1.069-1.496-1.878-3.294-2.412-5.072-.331-1.101-.391-2.165.047-3.197.33-.781.89-1.356 1.427-1.93.334-.36.61-.739.903-1.1.156-.226.322-.434.49-.627a.31.31 0 0 0 .088-.063c.192-.195.345-.362.463-.506.128-.155.23-.315.302-.488-.24.068-.483.14-.731.215-.474.147-1.095.284-1.471.284-.75 0-1.26-.436-1.743-.436a1.396 1.396 0 0 0-.513.101c-.147.054-.29.135-.437.214a7.796 7.796 0 0 0-1.81 1.367c-.138.155-.295.329-.442.49-.31.317-.607.65-.877 1.002-.121.195-.238.389-.346.588-.079.151-.156.304-.225.456a3.92 3.92 0 0 0-.155.378 4.7 4.7 0 0 0-.152.532c-.044.2-.07.402-.093.605a4.277 4.277 0 0 0-.031.534c.004.13.02.26.032.389.018.192.042.383.08.571.066.328.161.647.266.955.161.475.355.948.532 1.403.107.274.218.552.29.846.064.263.11.534.14.813.017.184.028.368.028.554 0 .071-.007.144-.01.216a7.764 7.764 0 0 1-.042.493c-.028.205-.069.406-.113.607-.055.24-.121.476-.2.708-.075.223-.16.44-.25.66-.105.249-.221.494-.345.735-.102.195-.207.387-.319.574-.11.184-.226.362-.345.54-.259.39-.544.758-.833 1.118-.196.245-.387.493-.591.733-.16.189-.313.383-.48.568-.354.391-.706.776-1.072 1.144-.64.64-1.331 1.224-2.079 1.735-.372.254-.754.491-1.145.717-.37.213-.747.414-1.132.599-.32.154-.645.301-.976.427-.153.059-.309.111-.464.166"   fill-rule="evenodd" clip-rule="evenodd"/></svg> );

interface FollowUp {
  _id: string;
  personType: 'New Convert' | 'Attendee' | 'Member' | 'Unregistered Guest';
  personName: string;
  personEmail?: string;
  personPhone: string;
  personWhatsApp?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  responseCategory: 'Promising' | 'Undecided' | 'Cold';
  assignedTo?: { _id: string; email: string; };
  nextFollowUpDate?: string;
  attempts: number;
  requiredAttempts: number;
  createdAt: string;
}

interface PaginationInfo { page: number; limit: number; total: number; pages: number; }

export default function ClusterFollowUpsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const clusterIdFromUrl = params.clusterId as string;

  const { toast } = useToast();
  const { user } = useAuthStore();

  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [cluster, setCluster] = useState<ICluster | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "", responseCategory: "", personType: "", assignedTo: "" });

  const [canViewPage, setCanViewPage] = useState(false);
  const [canCreateFollowUp, setCanCreateFollowUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClusterDetails = useCallback(async () => {
    if (!clusterIdFromUrl) return null;
    try {
      const response = await apiClient.get<{ cluster: ICluster }>(`/clusters/${clusterIdFromUrl}`);
      setCluster(response.cluster);
      return response.cluster;
    } catch (err) {
      console.error("Error fetching cluster details:", err);
      setError("Failed to load cluster details.");
      return null;
    }
  }, [clusterIdFromUrl]);

  useEffect(() => {
    const checkPagePermissionsAndFetch = async () => {
      if (user && clusterIdFromUrl) {
        setIsLoading(true);
        const fetchedCluster = await fetchClusterDetails();
        if (!fetchedCluster) { setIsLoading(false); return; }

        const globalAdmin = await checkPermission(user, "GLOBAL_ADMIN");
        const clusterLeader = await checkPermission(user, "CLUSTER_LEADER", { clusterId: clusterIdFromUrl, centerId: fetchedCluster.centerId?.toString() });
        const centerAdmin = fetchedCluster.centerId ? await checkPermission(user, "CENTER_ADMIN", { centerId: fetchedCluster.centerId.toString() }) : false;

        const hasPermission = globalAdmin || clusterLeader || centerAdmin;
        setCanViewPage(hasPermission);
        setCanCreateFollowUp(hasPermission); // Assuming same permission for creating

        if (!hasPermission) {
          setError("You do not have permission to view follow-ups for this cluster.");
        }
        setIsLoading(false);
      } else if (!user) {
        setIsLoading(true);
      }
    };
    checkPagePermissionsAndFetch();
  }, [user, clusterIdFromUrl, fetchClusterDetails]);

  const fetchFollowUps = useCallback(async (page: number, search: string, status: string, responseCategory: string, personType: string, assignedTo: string) => {
    if (!clusterIdFromUrl || !canViewPage) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", pagination.limit.toString());
      queryParams.append("clusterId", clusterIdFromUrl); // Always filter by clusterId

      if (search) queryParams.append("search", search);
      if (status) queryParams.append("status", status);
      if (responseCategory) queryParams.append("responseCategory", responseCategory);
      if (personType) queryParams.append("personType", personType);
      if (assignedTo) queryParams.append("assignedTo", assignedTo); // API needs to scope this for the cluster

      const response = await apiClient.get<{ data: FollowUp[], pagination: PaginationInfo }>(`/follow-ups?${queryParams.toString()}`);
      setFollowUps(response.data || []);
      setPagination(response.pagination || { page, limit: pagination.limit, total: 0, pages: 0 });
      setError(null);
    } catch (error: any) {
      setError(error.message || "Failed to load follow-ups.");
      toast({ title: "Error", description: error.message || "Failed to load follow-ups data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, toast, clusterIdFromUrl, canViewPage]);

  useEffect(() => {
    if(canViewPage && clusterIdFromUrl){
        const page = parseInt(searchParams.get("page") || "1");
        const search = searchParams.get("search") || "";
        const statusVal = searchParams.get("status") || "";
        const responseCategoryVal = searchParams.get("responseCategory") || "";
        const personTypeVal = searchParams.get("personType") || "";
        const assignedToVal = searchParams.get("assignedTo") || "";

        setSearchTerm(search);
        setFilters({ status: statusVal, responseCategory: responseCategoryVal, personType: personTypeVal, assignedTo: assignedToVal });
        fetchFollowUps(page, search, statusVal, responseCategoryVal, personTypeVal, assignedToVal);
    }
  }, [searchParams, fetchFollowUps, canViewPage, clusterIdFromUrl]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); updateUrlParams({ search: searchTerm, page: 1 }); };
  const handleFilterChange = (key: string, value: string) => {
    const actualValue = value === "all" ? "" : value;
    setFilters(prev => ({ ...prev, [key]: actualValue }));
    updateUrlParams({ [key]: actualValue === "" ? null : actualValue, page: 1 });
  };
  const clearFilters = () => {
    setFilters({ status: "", responseCategory: "", personType: "", assignedTo: "" });
    setSearchTerm("");
    router.push(`/clusters/${clusterIdFromUrl}/dashboard/follow-ups`);
  };
  const updateUrlParams = (paramsToUpdate: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") newParams.set(key, value.toString());
      else newParams.delete(key);
    });
    router.push(`/clusters/${clusterIdFromUrl}/dashboard/follow-ups?${newParams.toString()}`);
  };
  const handlePageChange = (page: number) => updateUrlParams({ page });
  const getSelectValue = (value: string) => value || "all";
  const getStatusPillColor = (status: string, responseCategory: string) => { /* ... */ return ""; };
  const getStatusIcon = (status: string) => { /* ... */ return null; };

  if (isLoading && !error && !followUps.length) return <div className="container mx-auto py-6 text-center"><p>Loading follow-ups...</p></div>;
  if (error) return ( <div className="container mx-auto py-10 text-center"> <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" /> <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2> <p className="text-muted-foreground">{error}</p> <Button onClick={() => router.push(`/clusters/${clusterIdFromUrl}/dashboard`)} variant="outline" className="mt-4"> <ArrowLeft className="mr-2 h-4 w-4" /> Back </Button> </div>);
  if (!canViewPage && !isLoading) return ( <div className="container mx-auto py-10 text-center"> <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" /> <h2 className="text-xl font-semibold mb-2">Access Denied</h2> <p className="text-muted-foreground">You do not have permission to view these follow-ups.</p> </div>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Follow-ups for {cluster?.name || `Cluster ${clusterIdFromUrl}`}</h1>
        {canCreateFollowUp && (
          <Button asChild>
            <Link href={`/dashboard/follow-ups/new?clusterId=${clusterIdFromUrl}${cluster?.centerId ? `&centerId=${(cluster.centerId as any)._id || cluster.centerId.toString()}` : ''}`}>
              <Plus className="mr-2 h-4 w-4" /> New Follow-up
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle>Follow-up Management</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters and Search UI - Copied and adapted path from global follow-ups page */}
            <div className="flex flex-col sm:flex-row gap-2">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" /><Input type="search" placeholder="Search by name, email, or phone..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                <Button type="submit">Search</Button>
              </form>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={getSelectValue(filters.status)} onValueChange={(value) => handleFilterChange("status", value)}><SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Failed">Failed</SelectItem></SelectContent></Select>
                <Select value={getSelectValue(filters.responseCategory)} onValueChange={(value) => handleFilterChange("responseCategory", value)}><SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Response" /></SelectTrigger><SelectContent><SelectItem value="all">All Responses</SelectItem><SelectItem value="Promising">Promising</SelectItem><SelectItem value="Undecided">Undecided</SelectItem><SelectItem value="Cold">Cold</SelectItem></SelectContent></Select>
                <Select value={getSelectValue(filters.personType)} onValueChange={(value) => handleFilterChange("personType", value)}><SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Person Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="New Convert">New Convert</SelectItem><SelectItem value="Attendee">Attendee</SelectItem><SelectItem value="Member">Member</SelectItem><SelectItem value="Unregistered Guest">Unregistered Guest</SelectItem></SelectContent></Select>
                <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters"><X className="h-4 w-4" /></Button>
              </div>
            </div>
            {(searchTerm || filters.status || filters.responseCategory || filters.personType || filters.assignedTo) && ( /* ... Badge display ... */ )}

            {/* FollowUps Table - Copied and adapted path from global follow-ups page */}
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead>Person</TableHead><TableHead>Contact</TableHead><TableHead>Status</TableHead><TableHead>Progress</TableHead><TableHead>Assigned To</TableHead><TableHead>Next Follow-up</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading && followUps.length === 0 ? (<TableRow><TableCell colSpan={7} className="text-center py-10">Loading follow-ups...</TableCell></TableRow>) :
                   !isLoading && followUps.length === 0 ? (<TableRow><TableCell colSpan={7} className="text-center py-10">No follow-ups found for this cluster.</TableCell></TableRow>) :
                   (followUps.map((followUp) => (
                      <TableRow key={followUp._id}>
                        <TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarFallback>{getInitials(followUp.personName, "")}</AvatarFallback></Avatar><div><p className="font-medium">{followUp.personName}</p><Badge variant="outline">{followUp.personType}</Badge></div></div></TableCell>
                        <TableCell><div className="flex flex-col space-y-1">{followUp.personEmail && (<div className="flex items-center gap-1"><Mail className="h-3 w-3 text-gray-500" /><span className="text-sm">{followUp.personEmail}</span></div>)}<div className="flex items-center gap-1"><Phone className="h-3 w-3 text-gray-500" /><span className="text-sm">{followUp.personPhone}</span></div>{followUp.personWhatsApp && (<div className="flex items-center gap-1"><WhatsAppIcon className="h-3 w-3 text-green-500" /><span className="text-sm">{followUp.personWhatsApp}</span></div>)}</div></TableCell>
                        <TableCell><Badge className={`flex items-center gap-1 ${getStatusPillColor(followUp.status, followUp.responseCategory)}`}>{getStatusIcon(followUp.status)}<span>{followUp.status}</span></Badge>{followUp.status !== 'Completed' && followUp.status !== 'Failed' && (<Badge variant="outline" className="mt-1">{followUp.responseCategory}</Badge>)}</TableCell>
                        <TableCell><div className="flex items-center gap-1"><span className="text-sm">{followUp.attempts} of {followUp.requiredAttempts}</span><div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${(followUp.attempts / followUp.requiredAttempts) * 100}%` }}></div></div></div></TableCell>
                        <TableCell><span className="text-sm">{followUp.assignedTo?.email || 'N/A'}</span></TableCell>
                        <TableCell>{followUp.nextFollowUpDate ? (<div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-gray-500" /><span>{formatDate(new Date(followUp.nextFollowUpDate))}</span></div>) : (<span className="text-gray-500">Not scheduled</span>)}</TableCell>
                        <TableCell><div className="flex items-center gap-2"><Button variant="ghost" size="icon" asChild><Link href={`/dashboard/follow-ups/${followUp._id}?clusterId=${clusterIdFromUrl}`}><ChevronRight className="h-4 w-4" /></Link></Button></div></TableCell>
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

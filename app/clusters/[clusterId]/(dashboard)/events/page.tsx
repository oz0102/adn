"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import {
  Search, Plus, Calendar, ChevronRight, X, Clock, MapPin, CalendarDays, AlertTriangleIcon, ArrowLeft
} from "lucide-react"
import { useToast } from "@/lib/client/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"
import { ICluster } from "@/models/cluster"
import { apiClient } from "@/lib/api-client"

interface Event {
  _id: string; title: string; description: string; eventType: string;
  startDate: string; endDate: string; location: string;
  organizer?: { _id: string; name: string; }; // Made optional
  flyer?: string; reminderSent: boolean;
  // centerId might be part of event data if API returns it
  centerId?: { _id: string; name: string; } | string | null;
}
interface PaginationInfo { page: number; limit: number; total: number; pages: number; }
interface UrlParams { [key: string]: string | number | undefined | null; }

export default function ClusterEventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const clusterIdFromUrl = params.clusterId as string;

  const { toast } = useToast();
  const { user } = useAuthStore();

  const [events, setEvents] = useState<Event[]>([]);
  const [cluster, setCluster] = useState<ICluster | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ eventType: "", startDate: "", endDate: "" });

  const [canViewPage, setCanViewPage] = useState(false);
  const [canCreateEvent, setCanCreateEvent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClusterDetails = useCallback(async () => {
    if (!clusterIdFromUrl) return;
    try {
      const response = await apiClient.get<{ cluster: ICluster }>(`/clusters/${clusterIdFromUrl}`);
      setCluster(response.cluster);
      return response.cluster; // Return cluster for permission check
    } catch (err) {
      console.error("Error fetching cluster details:", err);
      setError("Failed to load cluster details.");
      toast({ title: "Error", description: "Could not load cluster details.", variant: "destructive" });
      return null;
    }
  }, [clusterIdFromUrl, toast]);

  useEffect(() => {
    const checkPagePermissionsAndFetch = async () => {
      if (user && clusterIdFromUrl) {
        setIsLoading(true);
        const fetchedCluster = await fetchClusterDetails();
        if (!fetchedCluster) { // Error occurred in fetchClusterDetails
            setIsLoading(false);
            return;
        }

        const globalAdmin = await checkPermission(user, "GLOBAL_ADMIN");
        const clusterLeader = await checkPermission(user, "CLUSTER_LEADER", { clusterId: clusterIdFromUrl, centerId: fetchedCluster.centerId?.toString() });
        const centerAdmin = fetchedCluster.centerId ? await checkPermission(user, "CENTER_ADMIN", { centerId: fetchedCluster.centerId.toString() }) : false;

        const hasPermission = globalAdmin || clusterLeader || centerAdmin;
        setCanViewPage(hasPermission);
        setCanCreateEvent(hasPermission); // Assuming same permission for creating events in this cluster

        if (!hasPermission) {
          setError("You do not have permission to view events for this cluster.");
        }
        setIsLoading(false); // Initial permission and cluster detail fetch done
      } else if (!user) {
        setIsLoading(true);
      }
    };
    checkPagePermissionsAndFetch();
  }, [user, clusterIdFromUrl, fetchClusterDetails]);


  const fetchEvents = useCallback(async (page: number, search: string, eventType: string, startDate: string, endDate: string) => {
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
      if (eventType) queryParams.append("eventType", eventType);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      // Assuming API can handle clusterId for events
      const response = await apiClient.get<{ events: Event[], paginationInfo: PaginationInfo }>(`/events?${queryParams.toString()}`);
      setEvents(response.events || []);
      setPagination(response.paginationInfo || { page, limit: pagination.limit, total: 0, pages: 0 });
      setError(null);
    } catch (error: any) {
      setError(error.message || "Failed to load events.");
      toast({ title: "Error", description: error.message || "Failed to load events data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit, toast, clusterIdFromUrl, canViewPage]);

  useEffect(() => {
    if(canViewPage && clusterIdFromUrl) {
        const page = parseInt(searchParams.get("page") || "1");
        const search = searchParams.get("search") || "";
        const eventType = searchParams.get("eventType") || "";
        const startDate = searchParams.get("startDate") || "";
        const endDate = searchParams.get("endDate") || "";

        setSearchTerm(search);
        setFilters({ eventType, startDate, endDate });
        fetchEvents(page, search, eventType, startDate, endDate);
    }
  }, [searchParams, fetchEvents, canViewPage, clusterIdFromUrl]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); updateUrlParams({ search: searchTerm, page: 1 }); };
  const handleFilterChange = (key: string, value: string) => {
    const actualValue = value === "all" ? "" : value;
    setFilters(prev => ({ ...prev, [key]: actualValue }));
    updateUrlParams({ [key]: actualValue === "" ? null : actualValue, page: 1 });
  };
  const clearFilters = () => {
    setFilters({ eventType: "", startDate: "", endDate: "" });
    setSearchTerm("");
    router.push(`/clusters/${clusterIdFromUrl}/dashboard/events`);
  };
  const updateUrlParams = (paramsToUpdate: UrlParams) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") newParams.set(key, value.toString());
      else newParams.delete(key);
    });
    router.push(`/clusters/${clusterIdFromUrl}/dashboard/events?${newParams.toString()}`);
  };
  const handlePageChange = (page: number) => updateUrlParams({ page });
  const getSelectValue = (value: string) => value || "all";

  if (isLoading && !error && !events.length) return <div className="container mx-auto py-6 text-center"><p>Loading events...</p></div>;
  if (error) return ( <div className="container mx-auto py-10 text-center"> <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" /> <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2> <p className="text-muted-foreground">{error}</p> <Button onClick={() => router.push(`/clusters/${clusterIdFromUrl}/dashboard`)} variant="outline" className="mt-4"> <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cluster Dashboard </Button> </div>);
  if (!canViewPage && !isLoading) return ( <div className="container mx-auto py-10 text-center"> <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" /> <h2 className="text-xl font-semibold mb-2">Access Denied</h2> <p className="text-muted-foreground">You do not have permission to view events for this cluster.</p> </div> );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events for {cluster?.name || `Cluster ${clusterIdFromUrl}`}</h1>
        {canCreateEvent && (
          <Button asChild>
            <Link href={`/dashboard/events/new?clusterId=${clusterIdFromUrl}${cluster?.centerId ? `&centerId=${(cluster.centerId as any)._id || cluster.centerId.toString()}` : ''}`}>
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Filters and Search UI - Copied and adapted path from global events page */}
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" /><Input type="search" placeholder="Search events..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
            <Button type="submit">Search</Button>
          </form>
          <div className="flex items-center gap-2">
            <Select value={getSelectValue(filters.eventType)} onValueChange={(value) => handleFilterChange("eventType", value)}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Event Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="Sunday Service">Sunday Service</SelectItem><SelectItem value="Midweek Service">Midweek Service</SelectItem><SelectItem value="Cluster Meeting">Cluster Meeting</SelectItem><SelectItem value="Small Group">Small Group</SelectItem><SelectItem value="Training">Training</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select>
            <Input type="date" placeholder="Start Date" className="w-[150px]" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} />
            <Input type="date" placeholder="End Date" className="w-[150px]" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} />
            <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters"><X className="h-4 w-4" /></Button>
          </div>
        </div>
        {(searchTerm || filters.eventType || filters.startDate || filters.endDate) && ( /* ... Badge display ... */ )}

        {/* Events Grid/List */}
        {isLoading && events.length === 0 ? ( /* ... Skeleton ... */ <p>Loading skeleton...</p> ) :
         !isLoading && events.length === 0 ? ( <div className="text-center py-10"><CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" /><h3 className="text-lg font-medium mb-2">No Events Found</h3><p className="text-gray-500 mb-4">There are no events for this cluster matching your criteria.</p><Button onClick={clearFilters}>Clear Filters</Button></div> ) :
         (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2"><div className="flex items-center justify-between"><Badge variant="outline">{event.eventType}</Badge><div className="flex items-center"><Calendar className="h-4 w-4 text-gray-500 mr-1" /><span className="text-sm">{formatDate(new Date(event.startDate))}</span></div></div><CardTitle className="mt-2">{event.title}</CardTitle><CardDescription className="line-clamp-2">{event.description}</CardDescription></CardHeader>
                <CardContent className="flex-1 space-y-2"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-500" /><span className="text-sm">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-500" /><span className="text-sm">{event.location}</span></div></CardContent>
                <CardFooter className="border-t pt-4"><div className="w-full flex items-center justify-between"><span className="text-sm text-gray-500">By {event.organizer?.name || 'N/A'}</span><Button variant="outline" size="sm" asChild><Link href={`/dashboard/events/${event._id}?clusterId=${clusterIdFromUrl}&centerId=${cluster?.centerId ? ((cluster.centerId as any)._id || cluster.centerId.toString()) : ''}`}><span>View Details</span><ChevronRight className="ml-2 h-4 w-4" /></Link></Button></div></CardFooter>
              </Card>
            ))}
          </div>
        )}
        {pagination.pages > 1 && !isLoading && (<Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange}/>)}
      </div>
    </div>
  )
}

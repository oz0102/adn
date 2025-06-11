"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, useParams } from "next/navigation" // Added useParams
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Calendar,
  ChevronRight,
  X,
  Clock,
  MapPin,
  CalendarDays,
  AlertTriangleIcon, // Added AlertTriangleIcon
  ArrowLeft // Added ArrowLeft
} from "lucide-react"
import { useToast } from "@/lib/client/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import { useAuthStore } from "@/lib/store" // Added for permissions
import { checkPermission } from "@/lib/permissions" // Added for permissions
import { ICenter } from "@/models/center" // For center name
import { apiClient } from "@/lib/api-client"; // Assuming apiClient

interface Event {
  _id: string
  title: string
  description: string
  eventType: string
  startDate: string
  endDate: string
  location: string
  organizer?: { // Made organizer optional as it might not always be populated or present
    _id: string;
    name: string;
  }
  flyer?: string
  reminderSent: boolean
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

interface UrlParams {
  [key: string]: string | number | undefined | null;
}

export default function CenterEventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const centerIdFromUrl = params.centerId as string;

  const { toast } = useToast()
  const { user } = useAuthStore();

  const [events, setEvents] = useState<Event[]>([])
  const [center, setCenter] = useState<ICenter | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    eventType: "",
    startDate: "",
    endDate: "",
  })
  const [canViewEvents, setCanViewEvents] = useState(false);
  const [canCreateEvents, setCanCreateEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenterDetails = useCallback(async () => {
    if (!centerIdFromUrl) return;
    try {
      const response = await apiClient.get<{ center: ICenter }>(`/centers/${centerIdFromUrl}`);
      setCenter(response.center);
    } catch (err) {
      console.error("Error fetching center details:", err);
      // Non-critical for page function, title will just use ID
    }
  }, [centerIdFromUrl]);

  useEffect(() => {
    const checkPagePermissions = async () => {
      if (user && centerIdFromUrl) {
        const hasViewPerm = await checkPermission(user, "GLOBAL_ADMIN") || await checkPermission(user, "CENTER_ADMIN", { centerId: centerIdFromUrl });
        setCanViewEvents(hasViewPerm);
        const hasCreatePerm = await checkPermission(user, "GLOBAL_ADMIN") || await checkPermission(user, "CENTER_ADMIN", { centerId: centerIdFromUrl });
        setCanCreateEvents(hasCreatePerm);

        if (hasViewPerm) {
          fetchCenterDetails();
        } else {
          setError("You do not have permission to view events for this center.");
          setIsLoading(false);
        }
      } else if (!user) {
        setIsLoading(true);
      }
    };
    checkPagePermissions();
  }, [user, centerIdFromUrl, fetchCenterDetails]);

  const fetchEvents = useCallback(async (
    page: number,
    search: string,
    eventType: string,
    startDate: string,
    endDate: string
  ) => {
    if (!centerIdFromUrl || !canViewEvents) {
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", pagination.limit.toString())
      queryParams.append("centerId", centerIdFromUrl); // Always filter by centerId

      if (search) queryParams.append("search", search)
      if (eventType) queryParams.append("eventType", eventType)
      if (startDate) queryParams.append("startDate", startDate)
      if (endDate) queryParams.append("endDate", endDate)

      const response = await apiClient.get<{ events: Event[], paginationInfo: PaginationInfo }>(`/events?${queryParams.toString()}`)
      setEvents(response.events || [])
      setPagination(response.paginationInfo || { page, limit: pagination.limit, total: 0, pages: 0 })
      setError(null);
    } catch (error: any) {
      console.error("Error fetching events:", error)
      setError(error.message || "Failed to load events data.");
      toast({
        title: "Error",
        description: error.message || "Failed to load events data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, toast, centerIdFromUrl, canViewEvents])

  useEffect(() => {
    if(canViewEvents && centerIdFromUrl){
        const page = parseInt(searchParams.get("page") || "1")
        const search = searchParams.get("search") || ""
        const eventType = searchParams.get("eventType") || ""
        const startDate = searchParams.get("startDate") || ""
        const endDate = searchParams.get("endDate") || ""

        setSearchTerm(search)
        setFilters({ eventType, startDate, endDate })
        fetchEvents(page, search, eventType, startDate, endDate)
    }
  }, [searchParams, fetchEvents, canViewEvents, centerIdFromUrl]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchTerm, page: 1 })
  }

  const handleFilterChange = (key: string, value: string) => {
    const actualValue = value === "all" ? "" : value
    setFilters(prev => ({ ...prev, [key]: actualValue }))
    if (value === "all" || value === "") { // Clear filter from URL if "all" or empty
      updateUrlParams({ [key]: null, page: 1 })
    } else {
      updateUrlParams({ [key]: value, page: 1 })
    }
  }

  const clearFilters = () => {
    setFilters({ eventType: "", startDate: "", endDate: "" })
    setSearchTerm("")
    router.push(`/centers/${centerIdFromUrl}/dashboard/events`)
  }

  const updateUrlParams = (paramsToUpdate: UrlParams) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") newParams.set(key, value.toString())
      else newParams.delete(key)
    })
    router.push(`/centers/${centerIdFromUrl}/dashboard/events?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => updateUrlParams({ page });
  const getSelectValue = (value: string) => value || "all";

  if (isLoading && !error && !events.length) return <div className="container mx-auto py-6 text-center"><p>Loading events...</p></div>;

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
         <Button onClick={() => router.push(`/centers/${centerIdFromUrl}/dashboard`)} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Center Dashboard
        </Button>
      </div>
    );
  }

  if (!canViewEvents && !isLoading) {
     return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view events for this center.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events for {center?.name || `Center`}</h1>
        {canCreateEvents && (
          <Button asChild>
            <Link href={`/dashboard/events/new?centerId=${centerIdFromUrl}`}>
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input type="search" placeholder="Search events..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex items-center gap-2">
            <Select value={getSelectValue(filters.eventType)} onValueChange={(value) => handleFilterChange("eventType", value)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Event Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                <SelectItem value="Midweek Service">Midweek Service</SelectItem>
                <SelectItem value="Cluster Meeting">Cluster Meeting</SelectItem>
                <SelectItem value="Small Group">Small Group</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" placeholder="Start Date" className="w-[150px]" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} />
            <Input type="date" placeholder="End Date" className="w-[150px]" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} />
            <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters"><X className="h-4 w-4" /></Button>
          </div>
        </div>

        {(searchTerm || filters.eventType || filters.startDate || filters.endDate) && (
          <div className="flex flex-wrap gap-2">
            {searchTerm && (<Badge variant="secondary" className="flex items-center gap-1">Search: {searchTerm}<Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => { setSearchTerm(""); updateUrlParams({ search: null });}}><X className="h-3 w-3" /></Button></Badge>)}
            {filters.eventType && (<Badge variant="secondary" className="flex items-center gap-1">Type: {filters.eventType}<Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => handleFilterChange("eventType", "all")}><X className="h-3 w-3" /></Button></Badge>)}
            {filters.startDate && (<Badge variant="secondary" className="flex items-center gap-1">Start: {filters.startDate}<Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => handleFilterChange("startDate", "")}><X className="h-3 w-3" /></Button></Badge>)}
            {filters.endDate && (<Badge variant="secondary" className="flex items-center gap-1">End: {filters.endDate}<Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => handleFilterChange("endDate", "")}><X className="h-3 w-3" /></Button></Badge>)}
          </div>
        )}

        {isLoading && events.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => ( <Card key={i} className="animate-pulse"><CardHeader className="h-20 bg-gray-100 dark:bg-gray-800"></CardHeader><CardContent className="pt-4"><div className="h-6 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mb-3"></div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded mb-1"></div><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div></CardContent><CardFooter><div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-full"></div></CardFooter></Card>))}
          </div>
        ) : !isLoading && events.length === 0 ? (
          <div className="text-center py-10"><CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" /><h3 className="text-lg font-medium mb-2">No Events Found</h3><p className="text-gray-500 mb-4">There are no events for this center matching your criteria.</p><Button onClick={clearFilters}>Clear Filters</Button></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between"><Badge variant="outline">{event.eventType}</Badge><div className="flex items-center"><Calendar className="h-4 w-4 text-gray-500 mr-1" /><span className="text-sm">{formatDate(new Date(event.startDate))}</span></div></div>
                  <CardTitle className="mt-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-500" /><span className="text-sm">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-500" /><span className="text-sm">{event.location}</span></div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-sm text-gray-500">By {event.organizer?.name || 'N/A'}</span>
                    <Button variant="outline" size="sm" asChild>
                      {/* Links to global event detail page */}
                      <Link href={`/dashboard/events/${event._id}?centerId=${centerIdFromUrl}`}><span>View Details</span><ChevronRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {pagination.pages > 1 && !isLoading && (<Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange} />)}
      </div>
    </div>
  )
}

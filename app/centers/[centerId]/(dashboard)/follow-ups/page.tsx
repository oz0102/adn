"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, useParams } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import {
  Search, Plus, ChevronRight, X, Mail, Phone,
  Calendar, AlertCircle, CheckCircle, XCircle, Clock, AlertTriangleIcon, ArrowLeft
} from "lucide-react"
import { useToast } from "@/lib/client/hooks/use-toast"
import { formatDate, getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { checkPermission } from "@/lib/permissions"
import { ICenter } from "@/models/center"
import { apiClient } from "@/lib/api-client"


// WhatsApp Icon Component (assuming it's defined elsewhere or not strictly needed for this adaptation)
const WhatsAppIcon = ({ className = "h-4 w-4" }) => ( /* ... SVG ... */ );

interface FollowUp {
  _id: string;
  personType: 'New Convert' | 'Attendee' | 'Member' | 'Unregistered Guest'; // Updated
  personName: string; // This will be constructed based on populated personId/attendeeId or newAttendee
  personEmail?: string;
  personPhone: string;
  personWhatsApp?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  responseCategory: 'Promising' | 'Undecided' | 'Cold';
  assignedTo?: { // Made optional as it might not always be populated or needed in list view
    _id: string;
    email: string;
  };
  nextFollowUpDate?: string;
  attempts: number; // Simplified to count
  requiredAttempts: number;
  createdAt: string;
  // For populated fields if needed directly, though personName etc. are preferred
  personId?: any;
  attendeeId?: any;
  newAttendee?: { firstName: string; lastName: string; email?:string; phoneNumber:string; whatsappNumber?:string };
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function CenterFollowUpsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const centerIdFromUrl = params.centerId as string;

  const { toast } = useToast()
  const { user } = useAuthStore();

  const [followUps, setFollowUps] = useState<FollowUp[]>([])
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
    status: "",
    responseCategory: "",
    personType: "",
    assignedTo: "", // This might need to be populated with users relevant to the center
  })
  const [canViewPage, setCanViewPage] = useState(false);
  const [canCreateFollowUp, setCanCreateFollowUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenterDetails = useCallback(async () => {
    if (!centerIdFromUrl) return;
    try {
      const response = await apiClient.get<{ center: ICenter }>(`/centers/${centerIdFromUrl}`);
      setCenter(response.center);
    } catch (err) {
      console.error("Error fetching center details:", err);
    }
  }, [centerIdFromUrl]);

  useEffect(() => {
    const checkPagePermissions = async () => {
        if (user && centerIdFromUrl) {
            const hasPermission = await checkPermission(user, "GLOBAL_ADMIN") || await checkPermission(user, "CENTER_ADMIN", { centerId: centerIdFromUrl });
            setCanViewPage(hasPermission);
            // Create permission might be similar or more granular (e.g. CLUSTER_LEADER of this center)
            setCanCreateFollowUp(hasPermission);

            if (hasPermission) {
                fetchCenterDetails();
            } else {
                setError("You do not have permission to view follow-ups for this center.");
                setIsLoading(false);
            }
        } else if (!user) {
            setIsLoading(true);
        }
    };
    checkPagePermissions();
  }, [user, centerIdFromUrl, fetchCenterDetails]);

  const fetchFollowUps = useCallback(async (
    page: number,
    search: string,
    status: string,
    responseCategory: string,
    personType: string,
    assignedTo: string
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
      if (status) queryParams.append("status", status)
      if (responseCategory) queryParams.append("responseCategory", responseCategory)
      if (personType) queryParams.append("personType", personType)
      if (assignedTo) queryParams.append("assignedTo", assignedTo) // API needs to handle this for center context

      const response = await apiClient.get<{data: FollowUp[], pagination: PaginationInfo}>(`/follow-ups?${queryParams.toString()}`);

      setFollowUps(response.data || []) // Assuming API structure matches { data: [], pagination: {}}
      setPagination(response.pagination || { page, limit: pagination.limit, total: 0, pages: 0 })
      setError(null);

    } catch (error: any) {
      console.error("Error fetching follow-ups:", error)
      setError(error.message || "Failed to load follow-ups data.");
      toast({
        title: "Error",
        description: error.message || "Failed to load follow-ups data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, toast, centerIdFromUrl, canViewPage])

  useEffect(() => {
    if (canViewPage && centerIdFromUrl) {
        const page = parseInt(searchParams.get("page") || "1");
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "";
        const responseCategory = searchParams.get("responseCategory") || "";
        const personType = searchParams.get("personType") || "";
        const assignedTo = searchParams.get("assignedTo") || "";

        setSearchTerm(search);
        setFilters({ status, responseCategory, personType, assignedTo });
        fetchFollowUps(page, search, status, responseCategory, personType, assignedTo);
    }
  }, [searchParams, fetchFollowUps, canViewPage, centerIdFromUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchTerm, page: 1 })
  }

  const handleFilterChange = (key: string, value: string) => {
    const actualValue = value === "all" ? "" : value
    setFilters(prev => ({ ...prev, [key]: actualValue }))
    updateUrlParams({ [key]: actualValue, page: 1 })
  }

  const clearFilters = () => {
    setFilters({ status: "", responseCategory: "", personType: "", assignedTo: "" })
    setSearchTerm("")
    router.push(`/centers/${centerIdFromUrl}/dashboard/follow-ups`)
  }

  const updateUrlParams = (paramsToUpdate: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") newParams.set(key, value.toString())
      else newParams.delete(key)
    })
    router.push(`/centers/${centerIdFromUrl}/dashboard/follow-ups?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => updateUrlParams({ page });
  const getSelectValue = (value: string) => value || "all";

  const getStatusPillColor = (status: string, responseCategory: string) => {
    if (status === 'Completed') return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
    if (status === 'Failed') return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
    switch (responseCategory) {
      case 'Promising': return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500"; // Changed from green to blue for promising
      case 'Undecided': return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500";
      case 'Cold': return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500"; // Changed from red to orange for cold
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500";
    }
  };
  const getStatusIcon = (status: string) => { /* ... same as global page ... */
    switch (status) {
      case 'Completed': return <CheckCircle className="h-4 w-4" />;
      case 'Failed': return <XCircle className="h-4 w-4" />;
      case 'In Progress': return <Clock className="h-4 w-4" />;
      case 'Pending': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };


  if (isLoading && !error && !followUps.length) return <div className="container mx-auto py-6 text-center"><p>Loading follow-ups...</p></div>;

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

  if (!canViewPage && !isLoading) {
     return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view follow-ups for this center.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Follow-ups for {center?.name || `Center`}</h1>
        {canCreateFollowUp && (
          <Button asChild>
            <Link href={`/dashboard/follow-ups/new?centerId=${centerIdFromUrl}`}>
              <Plus className="mr-2 h-4 w-4" /> New Follow-up
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle>Follow-up Management</CardTitle></CardHeader>
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
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={getSelectValue(filters.status)} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="Pending">Pending</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem><SelectItem value="Failed">Failed</SelectItem></SelectContent>
                </Select>
                <Select value={getSelectValue(filters.responseCategory)} onValueChange={(value) => handleFilterChange("responseCategory", value)}>
                  <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Response" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Responses</SelectItem><SelectItem value="Promising">Promising</SelectItem><SelectItem value="Undecided">Undecided</SelectItem><SelectItem value="Cold">Cold</SelectItem></SelectContent>
                </Select>
                <Select value={getSelectValue(filters.personType)} onValueChange={(value) => handleFilterChange("personType", value)}>
                  <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Person Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="New Convert">New Convert</SelectItem>
                    <SelectItem value="Attendee">Attendee</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Unregistered Guest">Unregistered Guest</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters"><X className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Display active filters */}
            <div className="rounded-md border">
              <Table>
                <TableHeader><TableRow><TableHead>Person</TableHead><TableHead>Contact</TableHead><TableHead>Status</TableHead><TableHead>Progress</TableHead><TableHead>Assigned To</TableHead><TableHead>Next Follow-up</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading && followUps.length === 0 ? (<TableRow><TableCell colSpan={7} className="text-center py-10">Loading follow-ups...</TableCell></TableRow>) :
                   !isLoading && followUps.length === 0 ? (<TableRow><TableCell colSpan={7} className="text-center py-10">No follow-ups found for this center. Try adjusting filters.</TableCell></TableRow>) :
                   (followUps.map((followUp) => (
                      <TableRow key={followUp._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8"><AvatarFallback>{getInitials(followUp.personName, "")}</AvatarFallback></Avatar>
                            <div><p className="font-medium">{followUp.personName}</p><Badge variant="outline">{followUp.personType}</Badge></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            {followUp.personEmail && (<div className="flex items-center gap-1"><Mail className="h-3 w-3 text-gray-500" /><span className="text-sm">{followUp.personEmail}</span></div>)}
                            <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-gray-500" /><span className="text-sm">{followUp.personPhone}</span></div>
                            {followUp.personWhatsApp && (<div className="flex items-center gap-1"><WhatsAppIcon className="h-3 w-3 text-green-500" /><span className="text-sm">{followUp.personWhatsApp}</span></div>)}
                          </div>
                        </TableCell>
                        <TableCell><Badge className={`flex items-center gap-1 ${getStatusPillColor(followUp.status, followUp.responseCategory)}`}>{getStatusIcon(followUp.status)}<span>{followUp.status}</span></Badge>{followUp.status !== 'Completed' && followUp.status !== 'Failed' && (<Badge variant="outline" className="mt-1">{followUp.responseCategory}</Badge>)}</TableCell>
                        <TableCell><div className="flex items-center gap-1"><span className="text-sm">{followUp.attempts} of {followUp.requiredAttempts}</span><div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{ width: `${(followUp.attempts / followUp.requiredAttempts) * 100}%` }}></div></div></div></TableCell>
                        <TableCell><span className="text-sm">{followUp.assignedTo?.email || 'N/A'}</span></TableCell>
                        <TableCell>{followUp.nextFollowUpDate ? (<div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-gray-500" /><span>{formatDate(new Date(followUp.nextFollowUpDate))}</span></div>) : (<span className="text-gray-500">Not scheduled</span>)}</TableCell>
                        <TableCell><div className="flex items-center gap-2"><Button variant="ghost" size="icon" asChild><Link href={`/dashboard/follow-ups/${followUp._id}?centerId=${centerIdFromUrl}`}><ChevronRight className="h-4 w-4" /></Link></Button></div></TableCell>
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

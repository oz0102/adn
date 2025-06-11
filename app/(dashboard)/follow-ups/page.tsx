


// app/(dashboard)/follow-ups/page.tsx - Main follow-up listing page
"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/lib/client/components/ui/table"
import { Button } from "@/lib/client/components/ui/button"
import { Input } from "@/lib/client/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/client/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/client/components/ui/card"
import { Avatar, AvatarFallback } from "@/lib/client/components/ui/avatar"
import { Pagination } from "@/lib/client/components/ui/pagination"
import { Badge } from "@/lib/client/components/ui/badge"
import { 
  Search, Plus, ChevronRight, X, Mail, Phone, 
  Calendar, AlertCircle, CheckCircle, XCircle, Clock 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getInitials } from "@/lib/utils"

// WhatsApp Icon Component
const WhatsAppIcon = ({ className = "h-4 w-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z" />
    <path d="M20.52 3.449C12.831-3.984.106 1.407.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.695 1.447h.005c9.975 0 16.944-9.95 13.467-17.949-1.382-3.254-4.363-5.505-8.453-6.146C9.337-.329 3.708 2.868 1.364 8.93.359 11.177-.22 13.697.12 16.205c.124.895.33 1.77.572 2.625.493 1.73 2.283 1.03 2.773-.857.087-.334.167-.67.248-1.015.344-1.437-.24-1.68-1.223-2.647-.655-.642-.908-1.678-.543-2.647 2.611-6.9 12.25-7.836 17.622-2.399 2.91 2.94 2.84 9.042-.15 11.79-1.54 1.432-3.962.574-4.258-1.334-.203-1.297.27-2.588.774-3.906.283-.686.159-1.695-.15-2.094-.437-.462-1.13-.284-1.72-.076a10.8 10.8 0 0 0-2.935 1.574c-.947.673-1.946 1.324-2.698 2.229-.732.872-1.162 2.063-1.947 2.96-.49.559-1.248 1.348-1.986 1.613-.12.043-.21.074-.3.114-.82.403-1.27.36-1.402.24-.625-.547-.748-2.364-.748-2.364.943-5.309 8-4.27 10.949-2.341.217.145.447.313.68.495 1.088.856 2.13 1.77 2.419 3.136.275 1.296.26 2.612.065 3.038.977 1.605 1.55 2.708 1.55 4.35 0 5.356-5.244 9.78-11.663 9.78-2.068 0-4.077-.54-5.848-1.557L0 23.956l3.92-1.018a12.027 12.027 0 0 1-1.386-1.7c-3.858-6.144 1.006-13.324 3.205-15.36 1.222-1.128 5.907-4.197 10.463-2.913 5.75 1.62 7.88 5.04 8.015 9.992.184 6.637-5.394 9.548-5.758 9.777-.364.228-1.105.254-1.83-.35-1.069-1.496-1.878-3.294-2.412-5.072-.331-1.101-.391-2.165.047-3.197.33-.781.89-1.356 1.427-1.93.334-.36.61-.739.903-1.1.156-.226.322-.434.49-.627a.31.31 0 0 0 .088-.063c.192-.195.345-.362.463-.506.128-.155.23-.315.302-.488-.24.068-.483.14-.731.215-.474.147-1.095.284-1.471.284-.75 0-1.26-.436-1.743-.436a1.396 1.396 0 0 0-.513.101c-.147.054-.29.135-.437.214a7.796 7.796 0 0 0-1.81 1.367c-.138.155-.295.329-.442.49-.31.317-.607.65-.877 1.002-.121.195-.238.389-.346.588-.079.151-.156.304-.225.456a3.92 3.92 0 0 0-.155.378 4.7 4.7 0 0 0-.152.532c-.044.2-.07.402-.093.605a4.277 4.277 0 0 0-.031.534c.004.13.02.26.032.389.018.192.042.383.08.571.066.328.161.647.266.955.161.475.355.948.532 1.403.107.274.218.552.29.846.064.263.11.534.14.813.017.184.028.368.028.554 0 .071-.007.144-.01.216a7.764 7.764 0 0 1-.042.493c-.028.205-.069.406-.113.607-.055.24-.121.476-.2.708-.075.223-.16.44-.25.66-.105.249-.221.494-.345.735-.102.195-.207.387-.319.574-.11.184-.226.362-.345.54-.259.39-.544.758-.833 1.118-.196.245-.387.493-.591.733-.16.189-.313.383-.48.568-.354.391-.706.776-1.072 1.144-.64.64-1.331 1.224-2.079 1.735-.372.254-.754.491-1.145.717-.37.213-.747.414-1.132.599-.32.154-.645.301-.976.427-.153.059-.309.111-.464.166"   
      fill-rule="evenodd" clip-rule="evenodd"/>
  </svg>
);

interface FollowUp {
  _id: string;
  personType: 'New Convert' | 'New Attendee' | 'Member';
  personName: string;
  personEmail?: string;
  personPhone: string;
  personWhatsApp?: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  responseCategory: 'Promising' | 'Undecided' | 'Cold';
  assignedTo: {
    _id: string;
    email: string;
  };
  nextFollowUpDate?: string;
  attempts: number;
  requiredAttempts: number;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function FollowUpsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    responseCategory: "",
    personType: "",
    assignedTo: "",
  });
  
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const responseCategory = searchParams.get("responseCategory") || "";
    const personType = searchParams.get("personType") || "";
    const assignedTo = searchParams.get("assignedTo") || "";
    
    setSearchTerm(search);
    setFilters({
      status,
      responseCategory,
      personType,
      assignedTo,
    });
    
    fetchFollowUps(page, search, status, responseCategory, personType, assignedTo);
  }, [searchParams, fetchFollowUps]);

  const fetchFollowUps = useCallback(async (
    page: number, 
    search: string, 
    status: string, 
    responseCategory: string,
    personType: string, 
    assignedTo: string
  ) => {
    try {
      setIsLoading(true);
      
      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", pagination.limit.toString());
      
      if (search) queryParams.append("search", search);
      if (status) queryParams.append("status", status);
      if (responseCategory) queryParams.append("responseCategory", responseCategory);
      if (personType) queryParams.append("personType", personType);
      if (assignedTo) queryParams.append("assignedTo", assignedTo);
      
      // In a real implementation, you would fetch actual data from your API
      // const response = await fetch(`/api/follow-ups?${queryParams.toString()}`);
      // const data = await response.json();
      
      // For demonstration purposes, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Fake loading delay
      
      // Mock data
      const mockFollowUps: FollowUp[] = Array.from({ length: 10 }).map((_, i) => ({
        _id: `followup${i + 1}`,
        personType: ['New Convert', 'New Attendee', 'Member'][i % 3] as FollowUp['personType'],
        personName: `Person ${i + 1}`,
        personEmail: `person${i + 1}@example.com`,
        personPhone: `+1234567890${i}`,
        personWhatsApp: i % 2 === 0 ? `+1234567890${i}` : undefined,
        status: ['Pending', 'In Progress', 'Completed', 'Failed'][i % 4] as FollowUp['status'],
        responseCategory: ['Promising', 'Undecided', 'Cold'][i % 3] as FollowUp['responseCategory'],
        assignedTo: {
          _id: 'user1',
          email: 'user@example.com'
        },
        nextFollowUpDate: i % 3 === 0 ? new Date(Date.now() + 86400000 * (i + 1)).toISOString() : undefined,
        attempts: i % 4 + 1,
        requiredAttempts: i % 2 === 0 ? 8 : 4,
        createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
      }));
      
      setFollowUps(mockFollowUps);
      setPagination({
        page,
        limit: 10,
        total: 35, // Mock total
        pages: 4,  // Mock pages
      });
    } catch (error: Error) {
      console.error("Error fetching follow-ups:", error);
      toast({
        title: "Error",
        description: "Failed to load follow-ups data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, pagination.limit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchTerm, page: 1 });
  };

  const handleFilterChange = (key: string, value: string) => {
    const actualValue = value === "all" ? "" : value;
    
    setFilters(prev => ({ ...prev, [key]: actualValue }));
    
    if (value === "all") {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete(key);
      newParams.set("page", "1");
      router.push(`/follow-ups?${newParams.toString()}`);
    } else {
      updateUrlParams({ [key]: value, page: 1 });
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      responseCategory: "",
      personType: "",
      assignedTo: "",
    });
    setSearchTerm("");
    router.push("/follow-ups");
  };

  const updateUrlParams = (params: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });
    
    router.push(`/follow-ups?${newParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
  };

  // Helper to get the select value (handles the "all" case)
  const getSelectValue = (value: string) => {
    return value || "all";
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Failed':
        return <XCircle className="h-4 w-4" />;
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'Pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Helper function to get status color based on response category
  const getStatusColor = (status: string, responseCategory: string) => {
    if (status === 'Completed') {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
    } else if (status === 'Failed') {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
    } else {
      // For pending and in progress, use response category
      switch (responseCategory) {
        case 'Promising': // Green - promising lead
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
        case 'Undecided': // Yellow - keep pursuing
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500";
        case 'Cold': // Red - do not pursue
          return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500";
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
        <Button asChild>
          <Link href="/follow-ups/new">
            <Plus className="mr-2 h-4 w-4" /> New Follow-up
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Follow-up Management</CardTitle>
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
              
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={getSelectValue(filters.status)}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={getSelectValue(filters.responseCategory)}
                  onValueChange={(value) => handleFilterChange("responseCategory", value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Response" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Responses</SelectItem>
                    <SelectItem value="Promising">Promising</SelectItem>
                    <SelectItem value="Undecided">Undecided</SelectItem>
                    <SelectItem value="Cold">Cold</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={getSelectValue(filters.personType)}
                  onValueChange={(value) => handleFilterChange("personType", value)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Person Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="New Convert">New Convert</SelectItem>
                    <SelectItem value="New Attendee">New Attendee</SelectItem>
                    <SelectItem value="Member">Member</SelectItem>
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
            
            {(searchTerm || filters.status || filters.responseCategory || filters.personType || filters.assignedTo) && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchTerm}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => {
                        setSearchTerm("");
                        updateUrlParams({ search: "" });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.status && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Status: {filters.status}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange("status", "all")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.responseCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Response: {filters.responseCategory}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange("responseCategory", "all")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.personType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Type: {filters.personType}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange("personType", "all")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.assignedTo && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Assigned: {filters.assignedTo}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange("assignedTo", "all")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
              </div>
            )}
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Person</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        Loading follow-ups...
                      </TableCell>
                    </TableRow>
                  ) : followUps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        No follow-ups found. Try adjusting your search or filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    followUps.map((followUp) => (
                      <TableRow key={followUp._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{getInitials(followUp.personName, "")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{followUp.personName}</p>
                              <Badge variant="outline">{followUp.personType}</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            {followUp.personEmail && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-gray-500" />
                                <span className="text-sm">{followUp.personEmail}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-gray-500" />
                              <span className="text-sm">{followUp.personPhone}</span>
                            </div>
                            {followUp.personWhatsApp && (
                              <div className="flex items-center gap-1">
                                <WhatsAppIcon className="h-3 w-3 text-green-500" />
                                <span className="text-sm">{followUp.personWhatsApp}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`flex items-center gap-1 ${getStatusColor(followUp.status, followUp.responseCategory)}`}>
                            {getStatusIcon(followUp.status)}
                            <span>{followUp.status}</span>
                          </Badge>
                          {followUp.status !== 'Completed' && followUp.status !== 'Failed' && (
                            <Badge 
                              variant="outline" 
                              className="mt-1"
                            >
                              {followUp.responseCategory}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{followUp.attempts} of {followUp.requiredAttempts}</span>
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500" 
                                style={{ width: `${(followUp.attempts / followUp.requiredAttempts) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{followUp.assignedTo.email}</span>
                        </TableCell>
                        <TableCell>
                          {followUp.nextFollowUpDate ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              <span>{formatDate(new Date(followUp.nextFollowUpDate))}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/follow-ups/${followUp._id}`}>
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
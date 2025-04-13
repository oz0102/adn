// app/(dashboard)/follow-ups/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Search, Plus, Filter, UserCheck, ChevronRight, X, Mail, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate, getInitials, getStatusColor } from "@/lib/utils"

interface FollowUp {
  _id: string
  personType: 'New Attendee' | 'Member'
  personName: string
  personEmail?: string
  personPhone: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed'
  assignedTo: {
    _id: string;
    email: string;
  }
  nextFollowUpDate?: string
  createdAt: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function FollowUpsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
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
    personType: "",
    assignedTo: "",
  })
  
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const personType = searchParams.get("personType") || ""
    const assignedTo = searchParams.get("assignedTo") || ""
    
    setSearchTerm(search)
    setFilters({
      status,
      personType,
      assignedTo,
    })
    
    fetchFollowUps(page, search, status, personType, assignedTo)
  }, [searchParams])

  const fetchFollowUps = async (
    page: number, 
    search: string, 
    status: string, 
    personType: string, 
    assignedTo: string
  ) => {
    try {
      setIsLoading(true)
      
      // Build query string
      let queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", pagination.limit.toString())
      
      if (search) queryParams.append("search", search)
      if (status) queryParams.append("status", status)
      if (personType) queryParams.append("personType", personType)
      if (assignedTo) queryParams.append("assignedTo", assignedTo)
      
      // In a real implementation, you would fetch actual data from your API
      // This is just simulating the API response
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
      // Mock data
      const mockFollowUps: FollowUp[] = Array.from({ length: 10 }).map((_, i) => ({
        _id: `followup${i + 1}`,
        personType: i % 2 === 0 ? 'New Attendee' : 'Member',
        personName: `Person ${i + 1}`,
        personEmail: `person${i + 1}@example.com`,
        personPhone: `+1234567890${i}`,
        status: ['Pending', 'In Progress', 'Completed', 'Failed'][i % 4] as any,
        assignedTo: {
          _id: 'user1',
          email: 'user@example.com'
        },
        nextFollowUpDate: i % 3 === 0 ? new Date(Date.now() + 86400000 * (i + 1)).toISOString() : undefined,
        createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
      }))
      
      setFollowUps(mockFollowUps)
      setPagination({
        page,
        limit: 10,
        total: 35, // Mock total
        pages: 4,  // Mock pages
      })
    } catch (error) {
      console.error("Error fetching follow-ups:", error)
      toast({
        title: "Error",
        description: "Failed to load follow-ups data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchTerm, page: 1 })
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    updateUrlParams({ [key]: value, page: 1 })
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      personType: "",
      assignedTo: "",
    })
    setSearchTerm("")
    router.push("/dashboard/follow-ups")
  }

  const updateUrlParams = (params: Record<string, any>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString())
      } else {
        newParams.delete(key)
      }
    })
    
    router.push(`/dashboard/follow-ups?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams({ page })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
        <Button asChild>
          <Link href="/dashboard/follow-ups/new">
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
              
              <div className="flex items-center gap-2">
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filters.personType}
                  onValueChange={(value) => handleFilterChange("personType", value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Person Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
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
            
            {(searchTerm || filters.status || filters.personType) && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchTerm}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => {
                        setSearchTerm("")
                        updateUrlParams({ search: "" })
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
                      onClick={() => handleFilterChange("status", "")}
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
                      onClick={() => handleFilterChange("personType", "")}
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
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        Loading follow-ups...
                      </TableCell>
                    </TableRow>
                  ) : followUps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
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
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(followUp.status)}>
                            {followUp.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{followUp.assignedTo.email}</span>
                        </TableCell>
                        <TableCell>
                          {followUp.nextFollowUpDate ? (
                            formatDate(new Date(followUp.nextFollowUpDate))
                          ) : (
                            <span className="text-gray-500">Not scheduled</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/dashboard/follow-ups/${followUp._id}`}>
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
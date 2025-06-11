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
import { Pagination } from "@/lib/client/components/ui/pagination"
import { Badge } from "@/lib/client/components/ui/badge"
import { 
  Search, 
  Plus, 
  Calendar, 
  ChevronRight, 
  X, 
  UsersRound, 
  Check, 
  UserX
} from "lucide-react"
import { useToast } from "@/lib/client/hooks/use-toast"
import { formatDate } from "@/lib/utils"

interface Attendance {
  _id: string
  eventTitle: string
  eventType: string
  date: string
  totalPresent: number
  totalAbsent: number
  totalExcused: number
  recordedBy: {
    _id: string;
    email: string;
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function AttendancePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([])
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
  
  const fetchAttendance = async (
    page: number, 
    search: string, 
    eventType: string, 
    startDate: string, 
    endDate: string
  ) => {
    try {
      setIsLoading(true)
      
      // Build query string
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", pagination.limit.toString())
      
      if (search) queryParams.append("search", search)
      if (eventType) queryParams.append("eventType", eventType)
      if (startDate) queryParams.append("startDate", startDate)
      if (endDate) queryParams.append("endDate", endDate)
      
      // In a real implementation, you would fetch actual data from your API
      // This is just simulating the API response
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
      // Mock data
      const mockAttendance: Attendance[] = Array.from({ length: 10 }).map((_, i) => ({
        _id: `attendance${i + 1}`,
        eventTitle: i % 2 === 0 ? 'Sunday Service' : `${['Midweek Service', 'Prayer Meeting', 'Bible Study'][i % 3]}`,
        eventType: i % 2 === 0 ? 'Sunday Service' : ['Midweek Service', 'Cluster Meeting', 'Small Group'][i % 3],
        date: new Date(Date.now() - 86400000 * i * 5).toISOString(), // Every 5 days back
        totalPresent: 80 + (i * 3),
        totalAbsent: 20 + (i * 2),
        totalExcused: 10 + i,
        recordedBy: {
          _id: 'user1',
          email: 'user@example.com'
        }
      }))
      
      setAttendanceRecords(mockAttendance)
      setPagination({
        page,
        limit: 10,
        total: 35, // Mock total
        pages: 4,  // Mock pages
      })
    } catch (error) {
      console.error("Error fetching attendance:", error)
      toast({
        title: "Error",
        description: "Failed to load attendance data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const eventType = searchParams.get("eventType") || ""
    const startDate = searchParams.get("startDate") || ""
    const endDate = searchParams.get("endDate") || ""
    
    setSearchTerm(search)
    setFilters({
      eventType,
      startDate,
      endDate,
    })
    
    fetchAttendance(page, search, eventType, startDate, endDate)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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
      eventType: "",
      startDate: "",
      endDate: "",
    })
    setSearchTerm("")
    router.push("/dashboard/attendance")
  }

  const updateUrlParams = (params: Record<string, string | number>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString())
      } else {
        newParams.delete(key)
      }
    })
    
    router.push(`/dashboard/attendance?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams({ page })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <Button asChild>
          <Link href="/dashboard/attendance/new">
            <Plus className="mr-2 h-4 w-4" /> Record Attendance
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="search"
                    placeholder="Search events..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>
              
              <div className="flex items-center gap-2">
                <Select
                  value={filters.eventType}
                  onValueChange={(value) => handleFilterChange("eventType", value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                    <SelectItem value="Midweek Service">Midweek Service</SelectItem>
                    <SelectItem value="Cluster Meeting">Cluster Meeting</SelectItem>
                    <SelectItem value="Small Group">Small Group</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  placeholder="Start Date"
                  className="w-[150px]"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange("startDate", e.target.value)}
                />
                
                <Input
                  type="date"
                  placeholder="End Date"
                  className="w-[150px]"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange("endDate", e.target.value)}
                />
                
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
            
            {(searchTerm || filters.eventType || filters.startDate || filters.endDate) && (
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
                
                {filters.eventType && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Event Type: {filters.eventType}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange("eventType", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.startDate && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Start Date: {filters.startDate}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange("startDate", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                
                {filters.endDate && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    End Date: {filters.endDate}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleFilterChange("endDate", "")}
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
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Attendance Stats</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        Loading attendance records...
                      </TableCell>
                    </TableRow>
                  ) : attendanceRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">
                        No attendance records found. Try adjusting your search or filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendanceRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell className="font-medium">{record.eventTitle}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formatDate(new Date(record.date))}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.eventType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-500" />
                              <span className="text-sm">Present: {record.totalPresent}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <UserX className="h-3 w-3 text-red-500" />
                              <span className="text-sm">Absent: {record.totalAbsent}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <UsersRound className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm">Excused: {record.totalExcused}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{record.recordedBy.email}</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/dashboard/attendance/${record._id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
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

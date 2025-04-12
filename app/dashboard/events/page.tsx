// app/(dashboard)/events/page.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
  CalendarDays
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

interface Event {
  _id: string
  title: string
  description: string
  eventType: string
  startDate: string
  endDate: string
  location: string
  organizer: {
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

export default function EventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [events, setEvents] = useState<Event[]>([])
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
    
    fetchEvents(page, search, eventType, startDate, endDate)
  }, [searchParams])

  const fetchEvents = async (
    page: number, 
    search: string, 
    eventType: string, 
    startDate: string, 
    endDate: string
  ) => {
    try {
      setIsLoading(true)
      
      // Build query string
      let queryParams = new URLSearchParams()
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
      const mockEvents: Event[] = Array.from({ length: 9 }).map((_, i) => ({
        _id: `event${i + 1}`,
        title: [`Sunday Service`, `Midweek Service`, `Prayer Meeting`, `Bible Study`, `Youth Service`, `Men's Fellowship`, `Women's Fellowship`, `Choir Practice`, `Leadership Meeting`][i],
        description: `Description for ${[`Sunday Service`, `Midweek Service`, `Prayer Meeting`, `Bible Study`, `Youth Service`, `Men's Fellowship`, `Women's Fellowship`, `Choir Practice`, `Leadership Meeting`][i]}`,
        eventType: [`Sunday Service`, `Midweek Service`, `Cluster Meeting`, `Small Group`, `Training`, `Other`][i % 6],
        startDate: new Date(Date.now() + 86400000 * (i + 1)).toISOString(),
        endDate: new Date(Date.now() + 86400000 * (i + 1) + 7200000).toISOString(),
        location: `Location ${i + 1}`,
        organizer: {
          _id: `team${i + 1}`,
          name: [`Worship Team`, `Technical Team`, `Media Team`, `Pastoral Team`, `Youth Team`, `Children's Team`][i % 6]
        },
        reminderSent: i % 3 === 0
      }))
      
      setEvents(mockEvents)
      setPagination({
        page,
        limit: 10,
        total: 35, // Mock total
        pages: 4,  // Mock pages
      })
    } catch (error) {
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: "Failed to load events data. Please try again.",
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
      eventType: "",
      startDate: "",
      endDate: "",
    })
    setSearchTerm("")
    router.push("/dashboard/events")
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
    
    router.push(`/dashboard/events?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams({ page })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <Button asChild>
          <Link href="/dashboard/events/new">
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Link>
        </Button>
      </div>
      
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
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-20 bg-gray-100 dark:bg-gray-800"></CardHeader>
                <CardContent className="pt-4">
                  <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded mb-2"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mb-3"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded mb-1"></div>
                  <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-10">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Events Found</h3>
            <p className="text-gray-500 mb-4">
              There are no events matching your search criteria.
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{event.eventType}</Badge>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm">{formatDate(new Date(event.startDate))}</span>
                    </div>
                  </div>
                  <CardTitle className="mt-2">{event.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="w-full flex items-center justify-between">
                    <span className="text-sm text-gray-500">By {event.organizer.name}</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/events/${event._id}`}>
                        <span>View Details</span>
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
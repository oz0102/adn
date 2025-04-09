// app/(dashboard)/small-groups/page.tsx
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
import { Pagination } from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus, 
  ChevronRight, 
  X, 
  Users,
  MapPin,
  Calendar
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"

interface SmallGroup {
  _id: string
  groupId: string
  name: string
  location: string
  leaderId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  contactPhone: string
  contactEmail: string
  description: string
  meetingSchedule: {
    day: string
    time: string
    frequency: string
  }
  memberCount: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function SmallGroupsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    
    setSearchTerm(search)
    setLocationFilter(location)
    
    fetchSmallGroups(page, search, location)
  }, [searchParams])

  const fetchSmallGroups = async (
    page: number, 
    search: string, 
    location: string
  ) => {
    try {
      setIsLoading(true)
      
      // Build query string
      let queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", pagination.limit.toString())
      
      if (search) queryParams.append("search", search)
      if (location) queryParams.append("location", location)
      
      // In a real implementation, you would fetch actual data from your API
      // This is just simulating the API response
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
      // Mock data
      const locations = ["North", "South", "East", "West", "Central"]
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      
      const mockSmallGroups: SmallGroup[] = Array.from({ length: 9 }).map((_, i) => {
        const locationIndex = i % locations.length
        const dayIndex = i % days.length
        const memberCount = 5 + (i * 2)
        
        return {
          _id: `smallgroup${i + 1}`,
          groupId: `SG${1000 + i}`,
          name: `${locations[locationIndex]} ${i % 2 === 0 ? 'Young Adults' : 'Family'} Group`,
          location: `${locations[locationIndex]} District`,
          leaderId: {
            _id: `member${i+10}`,
            firstName: `Leader${i+1}`,
            lastName: "Smith",
            email: `leader${i+1}@example.com`
          },
          contactPhone: `+123456789${i}`,
          contactEmail: `${locations[locationIndex].toLowerCase()}group@example.com`,
          description: `A small group for ${i % 2 === 0 ? 'young adults' : 'families'} in the ${locations[locationIndex]} area.`,
          meetingSchedule: {
            day: days[dayIndex],
            time: `${18 + (i % 3)}:00`,
            frequency: i % 3 === 0 ? 'Weekly' : i % 3 === 1 ? 'Bi-weekly' : 'Monthly'
          },
          memberCount
        }
      })
      
      setSmallGroups(mockSmallGroups)
      setPagination({
        page,
        limit: 10,
        total: 25, // Mock total
        pages: 3,  // Mock pages
      })
    } catch (error) {
      console.error("Error fetching small groups:", error)
      toast({
        title: "Error",
        description: "Failed to load small groups data. Please try again.",
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

  const handleLocationChange = (location: string) => {
    setLocationFilter(location)
    updateUrlParams({ location, page: 1 })
  }

  const clearFilters = () => {
    setLocationFilter("")
    setSearchTerm("")
    router.push("/dashboard/small-groups")
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
    
    router.push(`/dashboard/small-groups?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams({ page })
  }

  const locations = ["North", "South", "East", "West", "Central"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Small Groups</h1>
        <Button asChild>
          <Link href="/dashboard/small-groups/new">
            <Plus className="mr-2 h-4 w-4" /> Create Small Group
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
                placeholder="Search small groups..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          
          <div className="flex items-center gap-2">
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
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Button 
            variant={locationFilter === "" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleLocationChange("")}
          >
            All Locations
          </Button>
          {locations.map(location => (
            <Button 
              key={location} 
              variant={locationFilter === location ? "default" : "outline"} 
              size="sm"
              onClick={() => handleLocationChange(location)}
            >
              {location}
            </Button>
          ))}
        </div>
        
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
        ) : smallGroups.length === 0 ? (
          <div className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Small Groups Found</h3>
            <p className="text-gray-500 mb-4">
              There are no small groups matching your search criteria.
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {smallGroups.map((group) => (
              <Card key={group._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit mb-2">{group.groupId}</Badge>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{group.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {group.meetingSchedule.day}s at {group.meetingSchedule.time} ({group.meetingSchedule.frequency})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{group.memberCount} members</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Group Leader</h4>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {getInitials(group.leaderId.firstName, group.leaderId.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{group.leaderId.firstName} {group.leaderId.lastName}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/small-groups/${group._id}`}>
                      <span>View Group</span>
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
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
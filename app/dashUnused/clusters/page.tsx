// app/(dashboard)/clusters/page.tsx
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
  Calendar,
  LucideLayoutGrid
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"

interface Cluster {
  _id: string
  clusterId: string
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
  smallGroupCount: number
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ClustersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    
    setSearchTerm(search)
    
    fetchClusters(page, search)
  }, [searchParams])

  const fetchClusters = async (
    page: number, 
    search: string
  ) => {
    try {
      setIsLoading(true)
      
      // Build query string
      let queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", pagination.limit.toString())
      
      if (search) queryParams.append("search", search)
      
      // In a real implementation, you would fetch actual data from your API
      // This is just simulating the API response
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
      // Mock data
      const regions = ["North", "South", "East", "West", "Central"]
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      
      const mockClusters: Cluster[] = Array.from({ length: 5 }).map((_, i) => {
        const region = regions[i]
        const dayIndex = i % days.length
        const memberCount = 50 + (i * 20)
        const smallGroupCount = 5 + i
        
        return {
          _id: `cluster${i + 1}`,
          clusterId: `CL${1000 + i}`,
          name: `${region} Region Cluster`,
          location: `${region} Region`,
          leaderId: {
            _id: `member${i+10}`,
            firstName: `Pastor${i+1}`,
            lastName: "Johnson",
            email: `pastor${i+1}@example.com`
          },
          contactPhone: `+123456789${i}`,
          contactEmail: `${region.toLowerCase()}cluster@example.com`,
          description: `The cluster of small groups in the ${region} region of the city.`,
          meetingSchedule: {
            day: days[dayIndex],
            time: `${18 + (i % 3)}:00`,
            frequency: i % 3 === 0 ? 'Weekly' : i % 3 === 1 ? 'Bi-weekly' : 'Monthly'
          },
          memberCount,
          smallGroupCount
        }
      })
      
      setClusters(mockClusters)
      setPagination({
        page,
        limit: 10,
        total: 5, // Mock total
        pages: 1,  // Mock pages
      })
    } catch (error) {
      console.error("Error fetching clusters:", error)
      toast({
        title: "Error",
        description: "Failed to load clusters data. Please try again.",
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

  const clearFilters = () => {
    setSearchTerm("")
    router.push("/dashboard/clusters")
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
    
    router.push(`/dashboard/clusters?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams({ page })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clusters</h1>
        <Button asChild>
          <Link href="/dashboard/clusters/new">
            <Plus className="mr-2 h-4 w-4" /> Create Cluster
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
                placeholder="Search clusters..."
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
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
        ) : clusters.length === 0 ? (
          <div className="text-center py-10">
            <LucideLayoutGrid className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Clusters Found</h3>
            <p className="text-gray-500 mb-4">
              There are no clusters matching your search criteria.
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clusters.map((cluster) => (
              <Card key={cluster._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit mb-2">{cluster.clusterId}</Badge>
                  <CardTitle>{cluster.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{cluster.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{cluster.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {cluster.meetingSchedule.day}s at {cluster.meetingSchedule.time} ({cluster.meetingSchedule.frequency})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LucideLayoutGrid className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{cluster.smallGroupCount} small groups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{cluster.memberCount} members</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Cluster Leader</h4>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {getInitials(cluster.leaderId.firstName, cluster.leaderId.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{cluster.leaderId.firstName} {cluster.leaderId.lastName}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/clusters/${cluster._id}`}>
                      <span>View Cluster</span>
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
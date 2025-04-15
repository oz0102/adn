// app/(dashboard)/teams/page.tsx
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
  UserPlus
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"

interface Team {
  _id: string
  name: string
  description: string
  category: string
  leaderId: {
    _id: string
    firstName: string
    lastName: string
    email: string
  }
  assistantLeaderIds: {
    _id: string
    firstName: string
    lastName: string
  }[]
  members: string[]
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function TeamsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [teams, setTeams] = useState<Team[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    
    setSearchTerm(search)
    setCategoryFilter(category)
    
    const fetchTeamsData = async () => {
    try {
      setIsLoading(true)
      
      // Build query string
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", pagination.limit.toString())
      
      if (search) queryParams.append("search", search)
      if (category) queryParams.append("category", category)
      
      // In a real implementation, you would fetch actual data from your API
      // This is just simulating the API response
      await new Promise(resolve => setTimeout(resolve, 500)) // Fake loading delay
      
      // Mock data
      const teamCategories = ["Worship", "Technical", "Media", "Pastoral", "Hospitality", "Outreach"]
      const mockTeams: Team[] = Array.from({ length: 9 }).map((_, i) => {
        const category = teamCategories[i % teamCategories.length]
        const memberCount = 5 + i

        return {
          _id: `team${i + 1}`,
          name: `${category} Team`,
          description: `The ${category.toLowerCase()} team responsible for the ${category.toLowerCase()} services and activities of the church.`,
          category,
          leaderId: {
            _id: `member${i+10}`,
            firstName: `Leader${i+1}`,
            lastName: "Smith",
            email: `leader${i+1}@example.com`
          },
          assistantLeaderIds: [
            {
              _id: `member${i+20}`,
              firstName: `Assistant${i+1}`,
              lastName: "Jones"
            }
          ],
          members: Array(memberCount).fill("").map((_, j) => `member${i*10+j}`)
        }
      })
      
      setTeams(mockTeams)
      setPagination({
        page,
        limit: 10,
        total: 25, // Mock total
        pages: 3,  // Mock pages
      })
    } catch (error) {
      console.error("Error fetching teams:", error)
      toast({
        title: "Error",
        description: "Failed to load teams data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  fetchTeamsData();
}, [searchParams, pagination.limit, toast])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchTerm, page: 1 })
  }

  const handleCategoryChange = (category: string) => {
    setCategoryFilter(category)
    updateUrlParams({ category, page: 1 })
  }

  const clearFilters = () => {
    setCategoryFilter("")
    setSearchTerm("")
    router.push("/dashboard/teams")
  }

  const updateUrlParams = (params: Record<string, string | number | boolean | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString())
      } else {
        newParams.delete(key)
      }
    })
    
    router.push(`/dashboard/teams?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams({ page })
  }

  const teamCategories = ["Worship", "Technical", "Media", "Pastoral", "Hospitality", "Outreach"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
        <Button asChild>
          <Link href="/dashboard/teams/new">
            <Plus className="mr-2 h-4 w-4" /> Create Team
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
                placeholder="Search teams..."
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
            variant={categoryFilter === "" ? "default" : "outline"} 
            size="sm"
            onClick={() => handleCategoryChange("")}
          >
            All
          </Button>
          {teamCategories.map(category => (
            <Button 
              key={category} 
              variant={categoryFilter === category ? "default" : "outline"} 
              size="sm"
              onClick={() => handleCategoryChange(category)}
            >
              {category}
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
        ) : teams.length === 0 ? (
          <div className="text-center py-10">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Teams Found</h3>
            <p className="text-gray-500 mb-4">
              There are no teams matching your search criteria.
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <Card key={team._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit">{team.category}</Badge>
                  <CardTitle className="mt-2">{team.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{team.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Team Lead</h4>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>
                            {getInitials(team.leaderId.firstName, team.leaderId.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{team.leaderId.firstName} {team.leaderId.lastName}</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Team Size</h4>
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{team.members.length} members</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/teams/${team._id}`}>
                      <span>View Team</span>
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
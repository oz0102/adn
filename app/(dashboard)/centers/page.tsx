"use client"

import { useState, useEffect, useCallback } from "react"
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
  Building, // Icon for Center
  Network, // Icon for Clusters count
  AlertTriangle
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/utils"
import { useAuthStore } from "@/lib/store"
import { useSession } from "next-auth/react"

// Frontend Center interface - adjust based on actual backend model
interface Center {
  _id: string
  centerId: string // Or a unique identifier
  name: string
  location?: string
  leadPastor?: {
    _id: string
    firstName: string
    lastName: string
  }
  contactEmail?: string
  contactPhone?: string
  description?: string
  clusterCount?: number
  memberCount?: number
  // Add other relevant fields based on backend Center model
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  pages: number
}

export default function CentersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, isAuthenticated } = useAuthStore()
  const { status } = useSession()

  const [centers, setCenters] = useState<Center[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [canCreateCenter, setCanCreateCenter] = useState(false)
  const [hasViewPermission, setHasViewPermission] = useState(true)

  // Check permissions via API instead of direct model access
  const checkPermissions = useCallback(async () => {
    if (!user) return;
    
    try {
      // Check HQ_ADMIN permission for creating centers
      const createResponse = await fetch(`/api/auth/check-permission?role=HQ_ADMIN`);
      if (createResponse.ok) {
        const data = await createResponse.json();
        setCanCreateCenter(data.hasPermission);
      }
      
      // Check view permission (HQ_ADMIN or CENTER_ADMIN)
      const viewResponse = await fetch(`/api/auth/check-permission?roles=HQ_ADMIN,CENTER_ADMIN`);
      if (viewResponse.ok) {
        const data = await viewResponse.json();
        setHasViewPermission(data.hasPermission);
      } else {
        setHasViewPermission(false);
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
      setCanCreateCenter(false);
      setHasViewPermission(false);
    }
  }, [user]);

  const fetchCenters = useCallback(async (page: number, search: string) => {
    if (!user) return;
    try {
      setIsLoading(true)
      const queryParams = new URLSearchParams()
      queryParams.append("page", page.toString())
      queryParams.append("limit", pagination.limit.toString())
      if (search) queryParams.append("search", search)

      const response = await fetch(`/api/centers?${queryParams.toString()}`)
      if (!response.ok) {
        if (response.status === 403) {
            toast({
                title: "Permission Denied",
                description: "You do not have permission to view centers.",
                variant: "destructive",
            });
            setCenters([]);
            setPagination({ page, limit: pagination.limit, total: 0, pages: 0 });
            return; 
        }
        throw new Error(`Failed to fetch centers. Status: ${response.status}`);
      }
      const data = await response.json()
      setCenters(data.centers || [])
      setPagination(data.paginationInfo || { page, limit: pagination.limit, total: 0, pages: 0 })

    } catch (error: any) {
      console.error("Error fetching centers:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load centers data. Please try again.",
        variant: "destructive",
      })
      setCenters([]) // Clear centers on error
      setPagination({ page, limit: pagination.limit, total: 0, pages: 0 }) // Reset pagination
    } finally {
      setIsLoading(false)
    }
  }, [pagination.limit, toast, user])

  useEffect(() => {
    // Only proceed if authentication is complete
    if (status === "loading") return;
    
    if (isAuthenticated && user) {
      checkPermissions();
      const page = parseInt(searchParams.get("page") || "1")
      const search = searchParams.get("search") || ""
      setSearchTerm(search)
      fetchCenters(page, search)
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [searchParams, status, isAuthenticated, user, fetchCenters, checkPermissions, router]) 

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateUrlParams({ search: searchTerm, page: 1 })
  }

  const clearFilters = () => {
    setSearchTerm("")
    router.push("/centers") 
  }

  const updateUrlParams = (params: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString())
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        newParams.set(key, value.toString())
      } else {
        newParams.delete(key)
      }
    })
    router.push(`/centers?${newParams.toString()}`)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams({ page })
  }

  if (status === "loading" || isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }
  
  if (!hasViewPermission) {
      return (
        <div className="text-center py-10">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Permission Denied</h3>
            <p className="text-gray-500 mb-4">You do not have permission to view this page.</p>
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Centers</h1>
        {canCreateCenter && (
          <Button asChild>
            <Link href="/centers/new">
              <Plus className="mr-2 h-4 w-4" /> Create Center
            </Link>
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search centers..."
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
        ) : centers.length === 0 ? (
          <div className="text-center py-10">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Centers Found</h3>
            <p className="text-gray-500 mb-4">
              There are no centers matching your search criteria or you may not have permission to view them.
            </p>
            {canCreateCenter && <Button onClick={() => router.push("/centers/new")}>Create Center</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.map((center) => (
              <Card key={center._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit mb-2">{center.centerId}</Badge>
                  <CardTitle>{center.name}</CardTitle>
                  {center.description && <CardDescription className="line-clamp-2">{center.description}</CardDescription>}
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    {center.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{center.location}</span>
                      </div>
                    )}
                    {center.leadPastor && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Lead Pastor</h4>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {getInitials(center.leadPastor.firstName, center.leadPastor.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{center.leadPastor.firstName} {center.leadPastor.lastName}</span>
                        </div>
                      </div>
                    )}
                     <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{center.clusterCount || 0} clusters</span>
                      </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{center.memberCount || 0} members</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/centers/${center._id}`}>
                      <span>View Center</span>
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {pagination.pages > 1 && (
            <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={handlePageChange}
            />
        )}
      </div>
    </div>
  )
}

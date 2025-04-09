// app/(dashboard)/flyers/page.tsx
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
  FileText,
  Calendar,
  CheckCircle
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"

interface ProgramFlyer {
  _id: string;
  title: string;
  eventId?: {
    _id: string;
    title: string;
    startDate: string;
  };
  content: {
    title: string;
    subtitle?: string;
    date: string;
    time: string;
    venue: string;
    description: string;
    contactInfo?: string;
    imageUrl?: string;
  };
  status: 'Draft' | 'Published' | 'Archived';
  templateId: {
    _id: string;
    name: string;
    category: string;
  };
  publishDate?: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function FlyersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [flyers, setFlyers] = useState<ProgramFlyer[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    
    setSearchTerm(search);
    setStatusFilter(status);
    
    fetchFlyers(page, search, status);
  }, [searchParams]);

  const fetchFlyers = async (
    page: number, 
    search: string, 
    status: string
  ) => {
    try {
      setIsLoading(true);
      
      // Build query string
      let queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", pagination.limit.toString());
      
      if (search) queryParams.append("search", search);
      if (status) queryParams.append("status", status);
      
      // In a real implementation, you would fetch actual data from your API
      // This is just simulating the API response
      await new Promise(resolve => setTimeout(resolve, 500)); // Fake loading delay
      
      // Mock data
      const mockFlyers: ProgramFlyer[] = Array.from({ length: 9 }).map((_, i) => {
        const status: 'Draft' | 'Published' | 'Archived' = i % 3 === 0 ? 'Draft' : i % 3 === 1 ? 'Published' : 'Archived';
        const templateCategory = ['Sunday Service', 'Midweek Service', 'Special Event', 'Conference', 'Other'][i % 5];
        const date = new Date(Date.now() + (i % 2 === 0 ? 1 : -1) * 86400000 * (i + 1));
        
        return {
          _id: `flyer${i + 1}`,
          title: `${templateCategory} Flyer ${i + 1}`,
          eventId: i % 2 === 0 ? {
            _id: `event${i + 1}`,
            title: `${templateCategory} ${i + 1}`,
            startDate: date.toISOString()
          } : undefined,
          content: {
            title: `${templateCategory} ${i + 1}`,
            subtitle: i % 2 === 0 ? `Subtitle for ${templateCategory} ${i + 1}` : undefined,
            date: date.toISOString(),
            time: `${17 + (i % 3)}:00`,
            venue: `Main ${['Auditorium', 'Hall', 'Chapel', 'Center', 'Room'][i % 5]}`,
            description: `Description for ${templateCategory} ${i + 1}. This is a sample description for the event.`,
            contactInfo: i % 2 === 0 ? 'contact@church.org | +1234567890' : undefined,
            imageUrl: i % 3 === 0 ? '/placeholder.jpg' : undefined
          },
          status,
          templateId: {
            _id: `template${i % 5 + 1}`,
            name: `${templateCategory} Template`,
            category: templateCategory
          },
          publishDate: status === 'Published' ? new Date(Date.now() - 86400000 * i).toISOString() : undefined,
          createdAt: new Date(Date.now() - 86400000 * (i + 2)).toISOString()
        };
      });
      
      setFlyers(mockFlyers);
      setPagination({
        page,
        limit: 10,
        total: 25, // Mock total
        pages: 3,  // Mock pages
      });
    } catch (error) {
      console.error("Error fetching flyers:", error);
      toast({
        title: "Error",
        description: "Failed to load flyers data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchTerm, page: 1 });
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    updateUrlParams({ status, page: 1 });
  };

  const clearFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
    router.push("/dashboard/flyers");
  };

  const updateUrlParams = (params: Record<string, any>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value.toString());
      } else {
        newParams.delete(key);
      }
    });
    
    router.push(`/dashboard/flyers?${newParams.toString()}`);
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-blue-100 text-blue-800';
      case 'Archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Program Flyers</h1>
        <Button asChild>
          <Link href="/dashboard/flyers/new">
            <Plus className="mr-2 h-4 w-4" /> Create Flyer
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
                placeholder="Search flyers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
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
        
        {(searchTerm || statusFilter) && (
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
            
            {statusFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => handleStatusChange("")}
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
        ) : flyers.length === 0 ? (
          <div className="text-center py-10">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Flyers Found</h3>
            <p className="text-gray-500 mb-4">
              There are no flyers matching your search criteria.
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flyers.map((flyer) => (
              <Card key={flyer._id} className="overflow-hidden flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="mb-2">{flyer.templateId.category}</Badge>
                    <Badge className={getStatusColor(flyer.status)}>{flyer.status}</Badge>
                  </div>
                  <CardTitle>{flyer.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{flyer.content.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {formatDate(new Date(flyer.content.date))} at {flyer.content.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">Template: {flyer.templateId.name}</span>
                    </div>
                    {flyer.status === 'Published' && flyer.publishDate && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          Published: {formatDate(new Date(flyer.publishDate))}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/flyers/${flyer._id}`}>
                      <span>View Flyer</span>
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
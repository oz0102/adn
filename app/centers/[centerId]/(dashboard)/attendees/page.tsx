"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/lib/store';
import { checkPermission } from '@/lib/permissions';
import { PlusCircle, Search, Users, AlertTriangleIcon, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import { apiClient } from '@/lib/api-client';
import { IAttendee } from '@/models/attendee';
import { ICenter } from '@/models/center'; // For center name

interface AttendeeWithCenterName extends IAttendee {
  centerId?: {
    _id: string;
    name: string;
  } | null;
}

interface ApiResponse {
  attendees: AttendeeWithCenterName[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function CenterAttendeesPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const router = useRouter(); // Added for navigation
  const params = useParams();
  const centerIdFromUrl = params.centerId as string;

  const [attendees, setAttendees] = useState<AttendeeWithCenterName[]>([]);
  const [center, setCenter] = useState<ICenter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState(''); // Example filter state

  const [canViewAttendees, setCanViewAttendees] = useState(false);
  const [canCreateAttendees, setCanCreateAttendees] = useState(false);

  const fetchCenterDetails = useCallback(async () => {
    if (!centerIdFromUrl) return;
    try {
      const response = await apiClient.get<{ center: ICenter }>(`/centers/${centerIdFromUrl}`);
      setCenter(response.center);
    } catch (err) {
      console.error("Error fetching center details:", err);
      // Non-critical, page can function without center name in title
    }
  }, [centerIdFromUrl]);

  useEffect(() => {
    const checkPagePermissions = async () => {
      if (user && centerIdFromUrl) {
        const hasViewPerm = await checkPermission(user, "GLOBAL_ADMIN") || await checkPermission(user, "CENTER_ADMIN", { centerId: centerIdFromUrl });
        setCanViewAttendees(hasViewPerm);
        const hasCreatePerm = await checkPermission(user, "GLOBAL_ADMIN") || await checkPermission(user, "CENTER_ADMIN", { centerId: centerIdFromUrl });
        setCanCreateAttendees(hasCreatePerm);

        if (hasViewPerm) {
          fetchCenterDetails();
        } else {
          setError("You do not have permission to view attendees for this center.");
          setIsLoading(false);
        }
      } else if (!user) {
        setIsLoading(true); // Waiting for user session
      }
    };
    checkPagePermissions();
  }, [user, centerIdFromUrl, fetchCenterDetails]);

  const fetchAttendees = useCallback(async () => {
    if (!canViewAttendees || !centerIdFromUrl) {
      setAttendees([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
        centerId: centerIdFromUrl, // Always filter by centerId from URL
      });
      if (levelFilter) queryParams.append("level", levelFilter);

      const response = await apiClient.get<ApiResponse>(`/attendees?${queryParams.toString()}`);
      setAttendees(response.attendees);
      setTotalPages(response.pagination.pages);
      setTotalAttendees(response.pagination.total);
    } catch (err: any) {
      console.error("Failed to fetch attendees:", err);
      setError(err.message || "Failed to fetch attendees. Please try again.");
      toast({ title: "Error", description: err.message || "Failed to fetch attendees.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm, levelFilter, centerIdFromUrl, toast, canViewAttendees]);

  useEffect(() => {
    if (canViewAttendees && centerIdFromUrl) {
      fetchAttendees();
    }
  }, [fetchAttendees, canViewAttendees, centerIdFromUrl]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleLevelFilterChange = (value: string) => {
    setLevelFilter(value === 'all' ? '' : value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  if (!user && isLoading) return <div className="flex justify-center items-center h-screen"><p>Loading user data...</p></div>;

  if (error) {
    return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2 text-destructive">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push(canViewAttendees ? `/centers/${centerIdFromUrl}/dashboard` : '/dashboard')} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!canViewAttendees && !isLoading) {
     return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view attendees for this center.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Attendees for {center?.name || `Center`} ({totalAttendees})</h1>
        {canCreateAttendees && (
          <Button asChild>
            <Link href={`/dashboard/attendees/new?centerId=${centerIdFromUrl}`}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Attendee
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-grow">
          <Input
            placeholder="Search attendees by name, email, phone..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
        </div>
        <Select value={levelFilter} onValueChange={handleLevelFilterChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="First-Timer">First-Timer</SelectItem>
                <SelectItem value="Occasional Attendee">Occasional Attendee</SelectItem>
                <SelectItem value="Regular Attendee">Regular Attendee</SelectItem>
            </SelectContent>
        </Select>
      </div>

      {isLoading && attendees.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Card key={i}><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><p>...</p></CardContent></Card>
          ))}
        </div>
      ) : attendees.length === 0 ? (
        <div className="text-center py-10">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Attendees Found</h3>
          <p className="text-gray-500">
            {searchTerm || levelFilter ? "Try adjusting your search or filters." : (canCreateAttendees ? "Create the first attendee record for this center!" : "No attendees to display for this center.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendees.map((attendee) => (
            <Card key={attendee._id}>
              <CardHeader>
                <CardTitle>{attendee.firstName} {attendee.lastName}</CardTitle>
                <CardDescription>
                  {attendee.level} - {attendee.centerId?.name || center?.name || 'N/A'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm text-muted-foreground">{attendee.email || 'No email'}</p>
                <p className="text-sm text-muted-foreground">{attendee.phoneNumber}</p>
                <p className="text-sm text-muted-foreground">
                  First Attended: {new Date(attendee.firstAttendanceDate).toLocaleDateString()}
                </p>
              </CardContent>
              <CardContent>
                <Button variant="outline" size="sm" asChild>
                  {/* Links to global attendee detail page */}
                  <Link href={`/dashboard/attendees/${attendee._id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && !isLoading && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      )}
    </div>
  );
}

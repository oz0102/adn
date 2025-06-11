"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/lib/client/components/ui/button';
import { Input } from '@/lib/client/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/lib/client/components/ui/card';
import { Pagination } from '@/lib/client/components/ui/pagination'; // Assuming this is the correct import
import { useToast } from '@/lib/client/components/ui/use-toast';
import { useAuthStore } from '@/lib/store';
import { checkPermission } from '@/lib/permissions'; // Assuming client-side check is okay or adapted
import { PlusCircle, Search, Users, AlertTriangleIcon } from 'lucide-react';
import { apiClient } from '@/lib/api-client'; // Assuming you have an API client
import { IAttendee } from '@/models/attendee'; // Import Attendee model type

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

export default function AttendeesPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [attendees, setAttendees] = useState<AttendeeWithCenterName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Default limit
  const [totalPages, setTotalPages] = useState(1);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  // Add filter states if needed, e.g., selectedCenter, selectedLevel

  const [canViewAttendees, setCanViewAttendees] = useState(false);
  const [canCreateAttendees, setCanCreateAttendees] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      if (user) {
        // Permissions would depend on your system's roles for viewing/managing attendees
        setCanViewAttendees(await checkPermission(user, "GLOBAL_ADMIN") || await checkPermission(user, "CENTER_ADMIN"));
        setCanCreateAttendees(await checkPermission(user, "GLOBAL_ADMIN") || await checkPermission(user, "CENTER_ADMIN"));
      }
    };
    checkPermissions();
  }, [user]);

  const fetchAttendees = useCallback(async () => {
    if (!canViewAttendees) {
      setAttendees([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: searchTerm,
        // Add other filters like centerId, level if implemented
      });
      const response = await apiClient.get<ApiResponse>(`/attendees?${params.toString()}`);
      setAttendees(response.attendees);
      setTotalPages(response.pagination.pages);
      setTotalAttendees(response.pagination.total);
    } catch (err: any) {
      console.error("Failed to fetch attendees:", err);
      setError(err.message || "Failed to fetch attendees. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to fetch attendees.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchTerm, toast, canViewAttendees]);

  useEffect(() => {
    if (canViewAttendees) {
      fetchAttendees();
    } else if (user) { // User is loaded but no permission
        setIsLoading(false);
        setError("You do not have permission to view attendees.");
    }
  }, [fetchAttendees, canViewAttendees, user]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen"><p>Loading user data...</p></div>;
  }

  if (!isLoading && !canViewAttendees && error) {
     return (
      <div className="container mx-auto py-10 text-center">
        <AlertTriangleIcon className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }


  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Attendees ({totalAttendees})</h1>
        {canCreateAttendees && (
          <Button asChild>
            <Link href="/dashboard/attendees/new">
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
        {/* Add Filter Dropdowns here if needed (e.g., for Center, Level) */}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(limit)].map((_, i) => (
            <Card key={i}><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><p>...</p></CardContent></Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">
          <p>{error}</p>
        </div>
      ) : attendees.length === 0 ? (
        <div className="text-center py-10">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Attendees Found</h3>
          <p className="text-gray-500">
            {searchTerm ? "Try adjusting your search or filters." : (canCreateAttendees ? "Create the first attendee record!" : "No attendees to display.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attendees.map((attendee) => (
            <Card key={attendee._id}>
              <CardHeader>
                <CardTitle>{attendee.firstName} {attendee.lastName}</CardTitle>
                <CardDescription>
                  {attendee.level} - {attendee.centerId?.name || 'N/A'}
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
                  <Link href={`/dashboard/attendees/${attendee._id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && !isLoading && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

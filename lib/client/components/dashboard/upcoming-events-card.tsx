// components/dashboard/upcoming-events-card.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { DataCard } from '@/lib/client/components/ui/data-card';
import { Calendar } from 'lucide-react';
import { Button } from '@/lib/client/components/ui/button';
import { formatDate, formatTime } from '@/lib/utils';
import { Badge } from '@/lib/client/components/ui/badge';
import { EventType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface EventItem {
  id: string;
  title: string;
  eventType: EventType;
  startDate: Date | string;
  endDate: Date | string;
  location: string;
}

interface ApiEventData {
  _id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  location?: string;
}

interface UpcomingEventsCardProps {
  className?: string;
  limit?: number;
}

export function UpcomingEventsCard({ className, limit = 3 }: UpcomingEventsCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setIsLoading(true);

        // Get current date
        const now = new Date();

        // Get date 30 days from now
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        // Fetch upcoming events
        const response = await fetch(
          `/api/events?startDate=${now.toISOString()}&endDate=${thirtyDaysFromNow.toISOString()}&sortBy=startDate&sortOrder=asc&limit=${limit}`
        );

        const data = await response.json();

        if (data.success && data.data.events) {
          // Transform the data
          const transformedEvents: EventItem[] = data.data.events.map((event: ApiEventData) => ({
            id: event._id,
            title: event.name,
            eventType: event.type as EventType,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location || 'TBD'
          }));

          setEvents(transformedEvents);
        } else {
          throw new Error('Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
        toast({
          title: 'Error',
          description: 'Failed to load upcoming events',
          variant: 'destructive',
        });

        // Fallback to sample data if API call fails
        setEvents([
          {
            id: '1',
            title: 'Sunday Service',
            eventType: 'Sunday Service',
            startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
            endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 90), // 2 days + 90 minutes from now
            location: 'Main Auditorium'
          },
          {
            id: '2',
            title: 'Bible Study',
            eventType: 'Midweek Service',
            startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4), // 4 days from now
            endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 60), // 4 days + 60 minutes from now
            location: 'Fellowship Hall'
          },
          {
            id: '3',
            title: 'Youth Meeting',
            eventType: 'Other',
            startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
            endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 120), // 5 days + 120 minutes from now
            location: 'Youth Center'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [toast, limit]);

  const handleViewDetails = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRegister = (eventId: string) => {
    // In a real implementation, this would open a registration form or process
    toast({
      title: 'Registration',
      description: 'Registration functionality will be implemented soon',
    });
  };

  return (
    <DataCard
      title="Upcoming Events"
      icon={<Calendar className="h-4 w-4" />}
      className={className}
      action={{
        label: "View All",
        onClick: () => router.push('/events')
      }}
      isLoading={isLoading}
    >
      {events.length === 0 && !isLoading ? (
        <div className="text-center py-6 text-muted-foreground">
          <p>No upcoming events scheduled</p>
          <Button
            variant="link"
            onClick={() => router.push('/events/new')}
            className="mt-2"
          >
            Create an event
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.slice(0, limit).map((event) => (
            <div key={event.id} className="border rounded-md p-3">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{event.title}</h3>
                <Badge variant="outline">{event.eventType}</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{formatDate(event.startDate)}</p>
                <p>{formatTime(event.startDate)} - {formatTime(event.endDate)}</p>
                <p>{event.location}</p>
              </div>
              <div className="mt-3 flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleViewDetails(event.id)}
                >
                  Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleRegister(event.id)}
                >
                  Register
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DataCard>
  );
}

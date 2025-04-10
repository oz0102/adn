// components/dashboard/upcoming-events-card.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { DataCard } from '@/components/ui/data-card';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { EventType } from '@/types';

interface EventItem {
  id: string;
  title: string;
  eventType: EventType;
  startDate: Date | string;
  endDate: Date | string;
  location: string;
}

interface UpcomingEventsCardProps {
  className?: string;
  limit?: number;
}

export function UpcomingEventsCard({ className, limit = 3 }: UpcomingEventsCardProps) {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    // For now, we'll use placeholder data
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
      },
      {
        id: '4',
        title: 'Prayer Meeting',
        eventType: 'Other',
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 60), // 7 days + 60 minutes from now
        location: 'Prayer Room'
      }
    ]);
  }, []);

  return (
    <DataCard 
      title="Upcoming Events" 
      icon={<Calendar className="h-4 w-4" />}
      className={className}
      action={{
        label: "View All",
        onClick: () => console.log("View all events")
      }}
    >
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
              <Button size="sm" variant="outline" className="flex-1">Details</Button>
              <Button size="sm" className="flex-1">Register</Button>
            </div>
          </div>
        ))}
      </div>
    </DataCard>
  );
}

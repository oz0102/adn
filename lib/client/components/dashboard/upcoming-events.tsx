// components/dashboard/upcoming-events.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/client/components/ui/card"
import { Button } from "@/lib/client/components/ui/button"
import { Calendar, Clock, MapPin } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/lib/client/hooks/use-toast"

interface Event {
  id: string
  title: string
  description: string
  eventType: string
  startDate: string
  endDate: string
  location: string
}

export function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // In a real implementation, fetch actual data from your API
        // This is just placeholder data for now
        setEvents([
          {
            id: "1",
            title: "Sunday Service",
            description: "Weekly Sunday Worship Service",
            eventType: "Sunday Service",
            startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            endDate: new Date(Date.now() + 86400000 + 7200000).toISOString(), // Tomorrow + 2 hours
            location: "Main Auditorium",
          },
          {
            id: "2",
            title: "Midweek Service",
            description: "Midweek Bible Study and Prayer Meeting",
            eventType: "Midweek Service",
            startDate: new Date(Date.now() + 3 * 86400000).toISOString(), // 3 days from now
            endDate: new Date(Date.now() + 3 * 86400000 + 5400000).toISOString(), // 3 days from now + 1.5 hours
            location: "Fellowship Hall",
          },
          {
            id: "3",
            title: "Youth Conference",
            description: "Annual Youth Conference",
            eventType: "Conference",
            startDate: new Date(Date.now() + 5 * 86400000).toISOString(), // 5 days from now
            endDate: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days from now
            location: "Conference Center",
          },
        ])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching events:", error)
        toast({
          title: "Error",
          description: "Failed to load upcoming events. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [toast])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading events...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Upcoming Events</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/events">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.length === 0 ? (
            <p>No upcoming events found.</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{event.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{formatDate(new Date(event.startDate))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>
                      {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 md:col-span-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/events/${event.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

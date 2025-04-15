// components/teams/events-tab.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TeamEventsTabProps {
  teamId: string
}

export function TeamEventsTab({ teamId }: TeamEventsTabProps) {
  // Using array destructuring to only get the first element (the state value)
  const [events] = useState([])
  // Removed unused state variables
  // const [isLoading, setIsLoading] = useState(false)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Events</CardTitle>
          <CardDescription>
            Events organized by this team
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Add Event
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No events found for this team
          </p>
        ) : (
          <div className="space-y-2">
            {/* Events list will be displayed here */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

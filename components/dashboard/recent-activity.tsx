// components/dashboard/recent-activity.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Activity {
  id: string
  type: string
  description: string
  user: {
    name: string
    email: string
  }
  timestamp: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // In a real implementation, fetch actual data from your API
        // This is just placeholder data for now
        setActivities([
          {
            id: "1",
            type: "member_added",
            description: "Added new member John Doe",
            user: {
              name: "Admin User",
              email: "admin@example.com",
            },
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            type: "event_created",
            description: "Created Sunday Service event",
            user: {
              name: "Pastor Smith",
              email: "pastor@example.com",
            },
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "3",
            type: "attendance_recorded",
            description: "Recorded attendance for Midweek Service",
            user: {
              name: "Team Lead",
              email: "lead@example.com",
            },
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: "4",
            type: "follow_up_completed",
            description: "Completed follow-up with Sarah Johnson",
            user: {
              name: "Small Group Leader",
              email: "sgleader@example.com",
            },
            timestamp: new Date(Date.now() - 10800000).toISOString(),
          },
          {
            id: "5",
            type: "flyer_published",
            description: "Published flyer for Youth Conference",
            user: {
              name: "Media Team",
              email: "media@example.com",
            },
            timestamp: new Date(Date.now() - 14400000).toISOString(),
          },
        ])
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching activities:", error)
        toast({
          title: "Error",
          description: "Failed to load recent activities. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [toast])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "member_added":
        return "👤"
      case "event_created":
        return "📅"
      case "attendance_recorded":
        return "✅"
      case "follow_up_completed":
        return "📞"
      case "flyer_published":
        return "📄"
      default:
        return "🔔"
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="flex items-center">
              <div className="space-y-1">
                <p>Loading activities...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.length === 0 ? (
            <p>No recent activities found.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center">
                <Avatar className="h-9 w-9 mr-4">
                  <AvatarFallback>{getActivityIcon(activity.type)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.description}</p>
                  <p className="text-sm text-gray-500">
                    by {activity.user.name} • {formatDate(new Date(activity.timestamp))}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
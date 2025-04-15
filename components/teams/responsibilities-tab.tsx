// components/teams/responsibilities-tab.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TeamResponsibilitiesTabProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  teamId: string
}

export function TeamResponsibilitiesTab({ teamId }: TeamResponsibilitiesTabProps) {
  // Using array destructuring to only get the first element (the state value)
  const [responsibilities] = useState([])
  // Removed unused state variables
  // const [isLoading, setIsLoading] = useState(false)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Responsibilities</CardTitle>
          <CardDescription>
            Responsibilities assigned to this team
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Add Responsibility
        </Button>
      </CardHeader>
      <CardContent>
        {responsibilities.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No responsibilities found for this team
          </p>
        ) : (
          <div className="space-y-2">
            {/* Responsibilities list will be displayed here */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

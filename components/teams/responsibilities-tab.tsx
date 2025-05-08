// components/teams/responsibilities-tab.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TeamResponsibilitiesTabProps {
  teamId: string; // Prop is now actively used or expected by the component structure
}

export function TeamResponsibilitiesTab({ teamId }: TeamResponsibilitiesTabProps) {
  // Using array destructuring to only get the first element (the state value)
  const [responsibilities] = useState([]) // This should ideally fetch responsibilities based on teamId
  // Removed unused state variables
  // const [isLoading, setIsLoading] = useState(false)

  // Example of how teamId might be used (even if just for logging for now)
  console.log("Rendering responsibilities for teamId:", teamId);

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

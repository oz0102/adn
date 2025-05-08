// components/members/teams-tab.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface MemberTeamsTabProps {
  memberId: string; // Prop is now actively used or expected by the component structure
}

export function MemberTeamsTab({ memberId }: MemberTeamsTabProps) {
  // Using array destructuring to only get the first element (the state value)
  const [teams] = useState([]) // This should ideally fetch teams based on memberId
  // Removed unused state variables
  // const [isLoading, setIsLoading] = useState(false)

  // Example of how memberId might be used (even if just for logging for now)
  console.log("Rendering teams for memberId:", memberId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Teams</CardTitle>
          <CardDescription>
            Teams this member belongs to
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Add to Team
        </Button>
      </CardHeader>
      <CardContent>
        {teams.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            This member is not part of any teams yet
          </p>
        ) : (
          <div className="space-y-2">
            {/* Team list will be displayed here */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

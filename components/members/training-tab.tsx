// components/members/training-tab.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface MemberTrainingTabProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  memberId: string
}

export function MemberTrainingTab({ memberId }: MemberTrainingTabProps) {
  // Using array destructuring to only get the first element (the state value)
  const [trainings] = useState([])
  // Removed unused state variables
  // const [isLoading, setIsLoading] = useState(false)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Training</CardTitle>
          <CardDescription>
            Training courses completed by this member
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          Add Training
        </Button>
      </CardHeader>
      <CardContent>
        {trainings.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No training records found for this member
          </p>
        ) : (
          <div className="space-y-2">
            {/* Training list will be displayed here */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

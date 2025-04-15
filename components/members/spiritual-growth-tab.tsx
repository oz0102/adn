// components/members/spiritual-growth-tab.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MemberSpiritualGrowthTabProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  memberId: string
}

export function MemberSpiritualGrowthTab({ memberId }: MemberSpiritualGrowthTabProps) {
  // We're using setActiveTab in the onValueChange prop, but activeTab isn't used
  // So we'll keep the state but not destructure the value
  const [, setActiveTab] = useState("discipleship")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spiritual Growth</CardTitle>
        <CardDescription>
          Track spiritual growth and discipleship progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="discipleship" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discipleship">Discipleship</TabsTrigger>
            <TabsTrigger value="bible-study">Bible Study</TabsTrigger>
            <TabsTrigger value="prayer">Prayer Life</TabsTrigger>
          </TabsList>
          <TabsContent value="discipleship" className="space-y-4 mt-4">
            <p>Discipleship content will be displayed here</p>
          </TabsContent>
          <TabsContent value="bible-study" className="space-y-4 mt-4">
            <p>Bible study content will be displayed here</p>
          </TabsContent>
          <TabsContent value="prayer" className="space-y-4 mt-4">
            <p>Prayer life content will be displayed here</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

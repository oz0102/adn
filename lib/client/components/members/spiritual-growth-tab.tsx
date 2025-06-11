// // components/members/spiritual-growth-tab.tsx
// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// interface MemberSpiritualGrowthTabProps {
//   // This prop is defined for future implementation but not currently used
//   memberId: string
// }

// export function MemberSpiritualGrowthTab({ memberId }: MemberSpiritualGrowthTabProps) {
//   // We're using setActiveTab in the onValueChange prop, but activeTab isn't used
//   // So we'll keep the state but not destructure the value
//   const [, setActiveTab] = useState("discipleship")

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Spiritual Growth</CardTitle>
//         <CardDescription>
//           Track spiritual growth and discipleship progress
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Tabs defaultValue="discipleship" onValueChange={setActiveTab}>
//           <TabsList className="grid w-full grid-cols-3">
//             <TabsTrigger value="discipleship">Discipleship</TabsTrigger>
//             <TabsTrigger value="bible-study">Bible Study</TabsTrigger>
//             <TabsTrigger value="prayer">Prayer Life</TabsTrigger>
//           </TabsList>
//           <TabsContent value="discipleship" className="space-y-4 mt-4">
//             <p>Discipleship content will be displayed here</p>
//           </TabsContent>
//           <TabsContent value="bible-study" className="space-y-4 mt-4">
//             <p>Bible study content will be displayed here</p>
//           </TabsContent>
//           <TabsContent value="prayer" className="space-y-4 mt-4">
//             <p>Prayer life content will be displayed here</p>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   )
// }


// components/members/spiritual-growth-tab.tsx
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/client/components/ui/card"
import { Button } from "@/lib/client/components/ui/button"
import { AlertCircle, Plus, CheckCircle } from "lucide-react"
import { useToast } from "@/lib/client/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/lib/client/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/client/components/ui/select"
import { Input } from "@/lib/client/components/ui/input"
import { Textarea } from "@/lib/client/components/ui/textarea"
import { Label } from "@/lib/client/components/ui/label"

interface SpiritualGrowthStage {
  stage: string
  date: string
  notes?: string
}

const stageLabels = {
  newConvert: "New Convert",
  waterBaptism: "Water Baptism",
  holyGhostBaptism: "Holy Ghost Baptism",
  worker: "Worker",
  minister: "Minister",
  ordainedMinister: "Ordained Minister"
}

export function MemberSpiritualGrowthTab({ memberId }: { memberId: string }) {
  const { toast } = useToast()
  const [stages, setStages] = useState<SpiritualGrowthStage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    stage: "",
    date: "",
    notes: ""
  })

  useEffect(() => {
    // Define fetchSpiritualGrowth inside useEffect or wrap it in useCallback
    const fetchSpiritualGrowthData = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch(`/api/members/${memberId}/spiritual-growth`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch spiritual growth data")
        }
        
        const data = await response.json()
        
        if (data.success) {
          const stagesArray: SpiritualGrowthStage[] = []
          
          if (data.data) {
            Object.entries(data.data).forEach(([key, value]: [string, SpiritualGrowthStageData]) => {
              if (value && value.date) {
                stagesArray.push({
                  stage: key,
                  date: value.date,
                  notes: value.notes
                })
              }
            })
          }
          
          stagesArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          
          setStages(stagesArray)
        } else {
          throw new Error(data.message || "Failed to fetch spiritual growth data")
        }
      } catch (error) {
        console.error("Error fetching spiritual growth:", error)
        toast({
          title: "Error",
          description: "Failed to load spiritual growth data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpiritualGrowthData()
  }, [memberId, toast]) // Removed fetchSpiritualGrowth from dependencies, added toast

  // This function is now defined outside useEffect or should be wrapped in useCallback if it were a dependency
  const fetchSpiritualGrowth = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch(`/api/members/${memberId}/spiritual-growth`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch spiritual growth data")
      }
      
      const data = await response.json()
      
      if (data.success) {
        const stagesArray: SpiritualGrowthStage[] = []
        
        if (data.data) {
          Object.entries(data.data).forEach(([key, value]: [string, SpiritualGrowthStageData]) => {
            if (value && value.date) {
              stagesArray.push({
                stage: key,
                date: value.date,
                notes: value.notes
              })
            }
          })
        }
        
        stagesArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
        setStages(stagesArray)
      } else {
        throw new Error(data.message || "Failed to fetch spiritual growth data")
      }
    } catch (error) {
      console.error("Error fetching spiritual growth:", error)
      toast({
        title: "Error",
        description: "Failed to load spiritual growth data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.stage || !formData.date) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/members/${memberId}/spiritual-growth`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: formData.stage,
          date: formData.date,
          notes: formData.notes
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add spiritual growth stage')
      }
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Stage added",
          description: `${stageLabels[formData.stage as keyof typeof stageLabels]} stage has been recorded.`,
        })
        
        // Refresh the spiritual growth data
        fetchSpiritualGrowth()
        
        setIsDialogOpen(false)
        setFormData({
          stage: "",
          date: "",
          notes: ""
        })
      } else {
        throw new Error(data.message || 'Failed to add spiritual growth stage')
      }
    } catch (error) {
      console.error("Error adding spiritual growth stage:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add spiritual growth stage. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Spiritual Growth Journey</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Stage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Spiritual Growth Stage</DialogTitle>
              <DialogDescription>
                Add a new spiritual growth milestone for this member.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => handleFormChange("stage", value)}
                >
                  <SelectTrigger id="stage">
                    <SelectValue placeholder="Select a stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(stageLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any relevant notes about this milestone"
                  value={formData.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center">Loading spiritual growth data...</div>
        ) : stages.length === 0 ? (
          <div className="py-10 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Spiritual Growth Stages Recorded</h3>
            <p className="text-gray-500 mb-4">
              Add the first spiritual growth stage for this member.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Stage
            </Button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-8 relative pl-12">
              {stages.map((stage, index) => (
                <div key={index} className="relative">
                  <div className="absolute -left-12 top-1">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      {stageLabels[stage.stage as keyof typeof stageLabels]}
                    </h3>
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(new Date(stage.date))}
                    </time>
                    {stage.notes && (
                      <p className="mt-1">{stage.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
